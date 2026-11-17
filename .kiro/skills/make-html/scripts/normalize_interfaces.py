#!/usr/bin/env python3
"""
normalize_interfaces.py — turn machine-readable interface specs into cited Markdown.

Why this exists: the doc site's content pipeline is Markdown-centric (build-embed.js
reads UTF-8 text; reference.html renders Markdown), while real projects hand you
interface specs as OpenAPI/Swagger or Postman collections. Converting them by hand
invites transcription errors and drops provenance, so this does it deterministically.

Two things it deliberately does NOT do:

  * It does not invent. Every row comes from a field that exists in the spec, and each
    section carries the source file plus a JSON-pointer path so a reader can verify it.
    A spec is still only a *claim* about the system — verify against code before
    presenting it as behaviour.
  * It does not copy secrets or sample data. Auth headers, tokens and passwords are
    redacted, and request/response bodies are reduced to their *shape* (keys + value
    types) instead of their values, because exported collections routinely contain live
    credentials and real customer records.

Usage:
    python3 normalize_interfaces.py <spec-file> [<spec-file>...] --out <dir>
    python3 normalize_interfaces.py api.yaml postman.json --out site/content/interfaces

Reads: OpenAPI 2/3 (.json/.yaml/.yml), Postman collection v2.x (.json).
Writes: one Markdown file per spec, plus 00-index.md. Prints a summary including
        every redaction, so the run is auditable.
"""

import argparse
import json
import os
import re
import sys

# ---------------------------------------------------------------- sensitivity

SENSITIVE_KEY = re.compile(
    r"(authorization|proxy-authorization|api[-_]?key|x-api-key|access[-_]?token"
    r"|refresh[-_]?token|id[-_]?token|bearer|secret|passwd|password|passphrase"
    r"|client[-_]?secret|private[-_]?key|credential|session|cookie|signature|sig"
    r"|connection[-_]?string|dsn)",
    re.I,
)
REDACTED = "«redacted»"
CREDS_IN_URL = re.compile(r"://[^/\s:@]+:[^/\s@]+@")

# RFC1918 addresses name internal infrastructure. The site is shareable, so they are
# replaced with a role label — the reader needs to know a host exists, not how to reach it.
PRIVATE_IP = re.compile(
    r"\b(?:10(?:\.\d{1,3}){3}"
    r"|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}"
    r"|192\.168(?:\.\d{1,3}){2})\b"
)
INTERNAL_HOST = "«internal-host»"

_redactions = []


def note_redaction(where, what):
    _redactions.append(f"{where}: {what}")


def scrub_text(value, where):
    """Strip credentials and internal addresses from a URL or connection string."""
    if not isinstance(value, str):
        return value
    if CREDS_IN_URL.search(value):
        note_redaction(where, "inline credentials in URL")
        value = CREDS_IN_URL.sub("://" + REDACTED + "@", value)
    if PRIVATE_IP.search(value):
        note_redaction(where, "internal IP address")
        value = PRIVATE_IP.sub(INTERNAL_HOST, value)
    return value


def scrub_value(key, value, where):
    """Redact a value whose *key* marks it sensitive; otherwise scrub the text."""
    if key and SENSITIVE_KEY.search(str(key)):
        note_redaction(where, f"value of `{key}`")
        return REDACTED
    return scrub_text(value, where)


# ---------------------------------------------------------------- body shapes


def json_shape(node, depth=0):
    """Describe a JSON value by its structure, never its content.

    Values carry customer data; keys and types carry the contract. Keeping only the
    latter makes the output both safer and more useful than a pasted example.
    """
    if depth > 6:
        return "…"
    if isinstance(node, dict):
        return {k: json_shape(v, depth + 1) for k, v in list(node.items())[:60]}
    if isinstance(node, list):
        return [json_shape(node[0], depth + 1)] if node else []
    if isinstance(node, bool):
        return "boolean"
    if isinstance(node, (int, float)):
        return "number"
    if node is None:
        return "null"
    return "string"


def shape_block(raw, label="shape"):
    """Render a raw body string as a fenced shape block, or note it is not JSON."""
    if not raw or not str(raw).strip():
        return None
    try:
        parsed = json.loads(raw)
    except (ValueError, TypeError):
        return f"_{label}: non-JSON body ({len(str(raw))} chars) — values omitted._"
    dumped = json.dumps(json_shape(parsed), indent=2, ensure_ascii=False)
    return f"_{label} — keys and value types only; values omitted:_\n\n```json\n{dumped}\n```"


# ---------------------------------------------------------------- helpers


def load_spec(path):
    text = open(path, "r", encoding="utf-8", errors="replace").read()
    if path.lower().endswith((".yaml", ".yml")):
        try:
            import yaml
        except ImportError:
            raise SystemExit(
                f"{path} is YAML but PyYAML is not installed. "
                "Install it (pip install pyyaml) or supply the JSON form of the spec — "
                "do not hand-transcribe it."
            )
        return yaml.safe_load(text)
    return json.loads(text)


def detect_kind(doc):
    if not isinstance(doc, dict):
        return None
    if "openapi" in doc or "swagger" in doc:
        return "openapi"
    info = doc.get("info") or {}
    schema = str(info.get("schema", ""))
    if "postman" in schema or "_postman_id" in info or "item" in doc:
        return "postman"
    return None


def esc(value):
    """Make a value safe for a Markdown table cell."""
    if value is None:
        return ""
    return str(value).replace("|", "\\|").replace("\n", " ").strip()


def ref_name(schema):
    """Human-readable type for an OpenAPI schema node, following $ref by name only."""
    if not isinstance(schema, dict):
        return ""
    if "$ref" in schema:
        return schema["$ref"].split("/")[-1]
    if schema.get("type") == "array":
        inner = ref_name(schema.get("items", {}))
        return f"array<{inner or 'object'}>"
    fmt = schema.get("format")
    base = schema.get("type", "")
    if base and fmt:
        return f"{base} ({fmt})"
    if base:
        return base
    for combinator in ("oneOf", "anyOf", "allOf"):
        if combinator in schema:
            parts = [ref_name(s) for s in schema[combinator]]
            return f"{combinator}<{', '.join(p for p in parts if p)}>"
    return ""


# ---------------------------------------------------------------- OpenAPI

HTTP_METHODS = ("get", "put", "post", "delete", "patch", "options", "head", "trace")


def render_openapi(doc, src):
    info = doc.get("info") or {}
    version = doc.get("openapi") or doc.get("swagger") or "unknown"
    out = [
        f"# Interface Spec — {info.get('title') or os.path.basename(src)}",
        "",
        f"**Source:** `{src}`  ",
        f"**Format:** OpenAPI/Swagger {esc(version)}  ",
        f"**Spec version:** {esc(info.get('version')) or 'not stated'}",
        "",
        "> Generated by `normalize_interfaces.py` from the spec above. Each section cites its"
        " JSON pointer in the source, so any row can be traced back. A spec states intent —"
        " confirm against the running code before documenting it as actual behaviour."
        " Examples and sample payloads are omitted; bodies are described by shape only.",
        "",
    ]
    if info.get("description"):
        out += ["## Description", "", str(info["description"]).strip(), ""]

    servers = doc.get("servers") or ([{"url": doc["host"]}] if doc.get("host") else [])
    if servers:
        out += ["## Servers", "", "| URL | Description | Pointer |", "|---|---|---|"]
        for i, server in enumerate(servers):
            url = scrub_text(server.get("url", ""), f"{src} servers[{i}]")
            out.append(f"| `{esc(url)}` | {esc(server.get('description'))} | `#/servers/{i}` |")
        out.append("")

    paths = doc.get("paths") or {}
    op_count = 0
    out += [
        "## Endpoints",
        "",
        "| Method | Path | Operation | Summary | Pointer |",
        "|---|---|---|---|---|",
    ]
    for path, item in paths.items():
        if not isinstance(item, dict):
            continue
        for method in HTTP_METHODS:
            op = item.get(method)
            if not isinstance(op, dict):
                continue
            op_count += 1
            pointer = f"#/paths/{path.replace('~', '~0').replace('/', '~1')}/{method}"
            out.append(
                f"| `{method.upper()}` | `{esc(path)}` | {esc(op.get('operationId'))} "
                f"| {esc(op.get('summary') or op.get('description'))} | `{pointer}` |"
            )
    out.append("")
    if op_count == 0:
        out += ["_No operations found in this spec._", ""]

    # Per-operation detail: parameters, request shape, responses.
    for path, item in paths.items():
        if not isinstance(item, dict):
            continue
        shared_params = item.get("parameters") or []
        for method in HTTP_METHODS:
            op = item.get(method)
            if not isinstance(op, dict):
                continue
            pointer = f"#/paths/{path.replace('~', '~0').replace('/', '~1')}/{method}"
            out += [f"### `{method.upper()} {path}`", "", f"Pointer: `{pointer}`", ""]
            if op.get("description"):
                out += [str(op["description"]).strip(), ""]
            if op.get("tags"):
                out += [f"**Tags:** {', '.join(esc(t) for t in op['tags'])}", ""]

            params = list(shared_params) + list(op.get("parameters") or [])
            if params:
                out += ["**Parameters**", "", "| Name | In | Required | Type | Description |", "|---|---|---|---|---|"]
                for p in params:
                    if not isinstance(p, dict):
                        continue
                    ptype = ref_name(p.get("schema", {})) or p.get("type", "")
                    out.append(
                        f"| `{esc(p.get('name'))}` | {esc(p.get('in'))} "
                        f"| {'yes' if p.get('required') else 'no'} | {esc(ptype)} "
                        f"| {esc(p.get('description'))} |"
                    )
                out.append("")

            body = op.get("requestBody")
            if isinstance(body, dict):
                out += ["**Request body**", "", "| Content type | Schema | Required |", "|---|---|---|"]
                for ctype, media in (body.get("content") or {}).items():
                    out.append(
                        f"| `{esc(ctype)}` | {esc(ref_name(media.get('schema', {}))) or '—'} "
                        f"| {'yes' if body.get('required') else 'no'} |"
                    )
                out.append("")

            responses = op.get("responses") or {}
            if responses:
                out += ["**Responses**", "", "| Code | Description | Schema |", "|---|---|---|"]
                for code, resp in responses.items():
                    if not isinstance(resp, dict):
                        continue
                    schemas = [
                        ref_name(m.get("schema", {}))
                        for m in (resp.get("content") or {}).values()
                    ]
                    if not schemas and resp.get("schema"):
                        schemas = [ref_name(resp["schema"])]
                    out.append(
                        f"| `{esc(code)}` | {esc(resp.get('description'))} "
                        f"| {esc(', '.join(s for s in schemas if s)) or '—'} |"
                    )
                out.append("")

            sec = op.get("security", doc.get("security"))
            if sec:
                names = [k for entry in sec if isinstance(entry, dict) for k in entry]
                if names:
                    out += [f"**Security:** {', '.join(f'`{esc(n)}`' for n in names)}", ""]

    schemas = ((doc.get("components") or {}).get("schemas")) or doc.get("definitions") or {}
    if schemas:
        out += ["## Schemas", ""]
        for name, schema in schemas.items():
            if not isinstance(schema, dict):
                continue
            out += [f"### `{esc(name)}`", "", f"Pointer: `#/components/schemas/{esc(name)}`", ""]
            props = schema.get("properties") or {}
            required = set(schema.get("required") or [])
            if props:
                out += ["| Field | Type | Required | Description |", "|---|---|---|---|"]
                for field, prop in props.items():
                    out.append(
                        f"| `{esc(field)}` | {esc(ref_name(prop))} "
                        f"| {'yes' if field in required else 'no'} "
                        f"| {esc(prop.get('description') if isinstance(prop, dict) else '')} |"
                    )
                out.append("")
            else:
                out += [f"_Type: {esc(ref_name(schema)) or 'not stated'}; no properties declared._", ""]

    schemes = ((doc.get("components") or {}).get("securitySchemes")) or doc.get("securityDefinitions") or {}
    if schemes:
        out += ["## Security schemes", "", "| Name | Type | Details |", "|---|---|---|"]
        for name, scheme in schemes.items():
            if not isinstance(scheme, dict):
                continue
            detail = " ".join(
                f"{k}={scheme[k]}"
                for k in ("scheme", "in", "name", "bearerFormat", "flows", "openIdConnectUrl")
                if k in scheme and not SENSITIVE_KEY.search(str(scheme[k]))
            )
            out.append(f"| `{esc(name)}` | {esc(scheme.get('type'))} | {esc(detail)} |")
        out.append("")

    stats = {"endpoints": op_count, "schemas": len(schemas), "servers": len(servers)}
    return "\n".join(out).rstrip() + "\n", stats


# ---------------------------------------------------------------- Postman


def walk_postman(items, trail=None):
    """Yield (folder_trail, request_item) for every request, at any nesting depth."""
    trail = trail or []
    for entry in items or []:
        if not isinstance(entry, dict):
            continue
        if "item" in entry:
            yield from walk_postman(entry["item"], trail + [entry.get("name", "(unnamed)")])
        elif "request" in entry:
            yield trail, entry


def postman_url(url):
    if isinstance(url, str):
        return url
    if isinstance(url, dict):
        if url.get("raw"):
            return url["raw"]
        host = ".".join(url.get("host") or [])
        path = "/".join(str(p) for p in (url.get("path") or []))
        return f"{host}/{path}"
    return ""


def render_postman(doc, src):
    info = doc.get("info") or {}
    requests = list(walk_postman(doc.get("item")))
    out = [
        f"# Interface Spec — {info.get('name') or os.path.basename(src)}",
        "",
        f"**Source:** `{src}`  ",
        "**Format:** Postman collection  ",
        f"**Requests:** {len(requests)}",
        "",
        "> Generated by `normalize_interfaces.py` from the collection above. Auth headers and"
        " token values are redacted, and bodies are described by shape (keys and value types)"
        " rather than content, because exported collections commonly carry live credentials"
        " and real records. A collection shows how someone called the API — confirm against"
        " the server code before treating it as the contract.",
        "",
    ]
    if info.get("description"):
        out += ["## Description", "", str(info["description"]).strip(), ""]

    variables = doc.get("variable") or []
    if variables:
        out += ["## Collection variables", "", "| Key | Value |", "|---|---|"]
        for var in variables:
            if not isinstance(var, dict):
                continue
            key = var.get("key")
            value = scrub_value(key, var.get("value"), f"{src} variable")
            out.append(f"| `{esc(key)}` | {esc(value)} |")
        out.append("")

    out += ["## Requests", "", "| Method | Name | Folder | URL |", "|---|---|---|---|"]
    for trail, entry in requests:
        req = entry.get("request") or {}
        method = req.get("method", "") if isinstance(req, dict) else ""
        url = scrub_text(postman_url(req.get("url") if isinstance(req, dict) else ""), f"{src} url")
        out.append(
            f"| `{esc(method)}` | {esc(entry.get('name'))} "
            f"| {esc(' / '.join(trail)) or '—'} | `{esc(url)}` |"
        )
    out.append("")
    if not requests:
        out += ["_No requests found in this collection._", ""]

    for trail, entry in requests:
        req = entry.get("request") or {}
        if not isinstance(req, dict):
            continue
        name = entry.get("name") or "(unnamed)"
        method = req.get("method", "")
        url = scrub_text(postman_url(req.get("url")), f"{src} url")
        where = " / ".join(trail + [name])
        out += [f"### `{esc(method)}` {esc(name)}", "", f"**Path:** {esc(where)}  ", f"**URL:** `{esc(url)}`", ""]
        if isinstance(req.get("description"), str) and req["description"].strip():
            out += [req["description"].strip(), ""]

        headers = [h for h in (req.get("header") or []) if isinstance(h, dict)]
        if headers:
            out += ["**Headers**", "", "| Key | Value |", "|---|---|"]
            for h in headers:
                key = h.get("key")
                out.append(f"| `{esc(key)}` | {esc(scrub_value(key, h.get('value'), f'{src} {where} header'))} |")
            out.append("")

        if req.get("auth"):
            auth_type = req["auth"].get("type") if isinstance(req["auth"], dict) else req["auth"]
            note_redaction(f"{src} {where}", "auth block values")
            out += [f"**Auth:** `{esc(auth_type)}` (credential values redacted)", ""]

        url_obj = req.get("url")
        if isinstance(url_obj, dict):
            query = [q for q in (url_obj.get("query") or []) if isinstance(q, dict)]
            if query:
                out += ["**Query parameters**", "", "| Key | Value | Description |", "|---|---|---|"]
                for q in query:
                    key = q.get("key")
                    out.append(
                        f"| `{esc(key)}` | {esc(scrub_value(key, q.get('value'), f'{src} {where} query'))} "
                        f"| {esc(q.get('description'))} |"
                    )
                out.append("")

        body = req.get("body")
        if isinstance(body, dict) and body.get("mode"):
            mode = body["mode"]
            out += [f"**Request body** — mode `{esc(mode)}`", ""]
            if mode == "raw":
                block = shape_block(body.get("raw"), "Request shape")
                out += [block or "_Empty body._", ""]
            elif mode in ("formdata", "urlencoded"):
                rows = [f for f in (body.get(mode) or []) if isinstance(f, dict)]
                if rows:
                    out += ["| Field | Type | Value |", "|---|---|---|"]
                    for field in rows:
                        key = field.get("key")
                        out.append(
                            f"| `{esc(key)}` | {esc(field.get('type', 'text'))} "
                            f"| {esc(scrub_value(key, field.get('value'), f'{src} {where} body'))} |"
                        )
                    out.append("")
            else:
                out += [f"_Body mode `{esc(mode)}` — content omitted._", ""]

        examples = [r for r in (entry.get("response") or []) if isinstance(r, dict)]
        if examples:
            out += ["**Saved responses**", "", "| Name | Status | Code |", "|---|---|---|"]
            for ex in examples:
                out.append(f"| {esc(ex.get('name'))} | {esc(ex.get('status'))} | {esc(ex.get('code'))} |")
            out.append("")
            shape = shape_block(examples[0].get("body"), "Response shape (first saved example)")
            if shape:
                out += [shape, ""]

    return "\n".join(out).rstrip() + "\n", {"requests": len(requests), "variables": len(variables)}


# ---------------------------------------------------------------- main


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("specs", nargs="+", help="OpenAPI/Swagger or Postman collection files")
    ap.add_argument("--out", required=True, help="output directory, e.g. <site>/content/interfaces")
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    written, failed = [], []

    for spec_path in args.specs:
        try:
            doc = load_spec(spec_path)
        except SystemExit:
            raise
        except Exception as exc:
            failed.append((spec_path, f"could not parse: {exc}"))
            continue

        kind = detect_kind(doc)
        if kind == "openapi":
            markdown, stats = render_openapi(doc, spec_path)
        elif kind == "postman":
            markdown, stats = render_postman(doc, spec_path)
        else:
            failed.append((spec_path, "not recognized as OpenAPI/Swagger or a Postman collection"))
            continue

        stem = re.sub(r"[^a-z0-9._-]+", "-", os.path.splitext(os.path.basename(spec_path))[0].lower())
        dest = os.path.join(args.out, f"{stem}-{kind}.md")
        with open(dest, "w", encoding="utf-8") as fh:
            fh.write(markdown)
        written.append((dest, kind, stats))

    if written:
        index = [
            "# Interface Specs",
            "",
            "Normalized from machine-readable specs by `normalize_interfaces.py`. Each document"
            " cites its source file and JSON pointers. Credentials are redacted and payloads are"
            " reduced to shapes, so nothing here carries secrets or customer data.",
            "",
            "These are **claims about** the interface. Where a spec disagrees with the code, the"
            " code wins — and the disagreement is itself worth reporting.",
            "",
            "| Document | Format | Contents |",
            "|---|---|---|",
        ]
        for dest, kind, stats in written:
            summary = ", ".join(f"{v} {k}" for k, v in stats.items())
            index.append(f"| [{os.path.basename(dest)}]({os.path.basename(dest)}) | {kind} | {summary} |")
        with open(os.path.join(args.out, "00-index.md"), "w", encoding="utf-8") as fh:
            fh.write("\n".join(index) + "\n")

    print("Normalizing interface specs…")
    for dest, kind, stats in written:
        summary = ", ".join(f"{v} {k}" for k, v in stats.items())
        print(f"  {dest}: {kind} — {summary}")
    if written:
        print(f"  {os.path.join(args.out, '00-index.md')}: index of {len(written)} document(s)")

    if _redactions:
        print(f"\nRedacted {len(_redactions)} sensitive item(s) — record this on methodology.html:")
        for item in sorted(set(_redactions)):
            print(f"  - {item}")

    if failed:
        print("\nNot converted (say so rather than hand-transcribing):", file=sys.stderr)
        for path, reason in failed:
            print(f"  - {path}: {reason}", file=sys.stderr)

    print("\nNext: add the new files to the reference.html document TREE, then run node build-embed.js.")
    return 1 if failed and not written else 0


if __name__ == "__main__":
    sys.exit(main())
