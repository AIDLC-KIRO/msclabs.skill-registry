-- ============================================================
-- Dental Dashboard Database Schema
-- Database: dental_db (PostgreSQL 14.2)
-- Extracted from: dental-db-20241224.sql (pg_dump binary)
-- ============================================================

-- ============================================================
-- SEQUENCES
-- ============================================================

CREATE SEQUENCE public."AssistDentist_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public."BookingRoom_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public."CareProvider_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public."CareProviderService_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public."DoctorSchedule_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public."DoctorScheduleTemp_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public."PatientAppointment_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public."PatientAppointmentHistory_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public."PatientAppointmentTemp_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public."AssistanceDentist" (
    "ID" bigint DEFAULT nextval('public."AssistDentist_ID_seq"'::regclass) NOT NULL,
    "CTLOC_Code" text NOT NULL,
    "CarpRowID" text,
    "AssistCode" text NOT NULL,
    "AssistDesc" text NOT NULL,
    "SecurityGroup" text,
    "SecurityGroupID" text,
    "SSUSR_Initials" text,
    "DeafultLogin" text,
    "Name" text,
    "NameTH" text,
    "NameEN" text NOT NULL,
    "CareProRowID" text,
    "CareProDesc" text,
    "CTPCP_CarPrvTp_DR" text,
    "CarProType" text,
    "ActiveDateFrom" text,
    "ActiveDateTo" text,
    "CreateDate" timestamp without time zone
);

CREATE TABLE public."BookingRoom" (
    "ID" bigint NOT NULL,
    "CarpCode" text,
    "AssistCode1" text,
    "AssistCode2" text,
    "StartDate" text,
    "EndDate" text,
    "StartTime" text,
    "EndTime" text,
    "Day" text,
    "Room" text,
    "Workcase" text,
    "Remark" text,
    "CreateDate" timestamp without time zone
);

CREATE TABLE public."CareProvider" (
    "ID" bigint DEFAULT nextval('public."CareProvider_ID_seq"'::regclass) NOT NULL,
    "CTLOC_Code" text NOT NULL,
    "CarpRowID" text,
    "CarpCode" text NOT NULL,
    "CarpDesc" text NOT NULL,
    "SecurityGroup" text,
    "SecurityGroupID" text,
    "SSUSR_Initials" text,
    "DeafultLogin" text,
    "Name" text,
    "NameTH" text,
    "NameEN" text NOT NULL,
    "CareProRowID" text,
    "CareProDesc" text,
    "CTPCP_CarPrvTp_DR" text,
    "CarProType" text,
    "ActiveDateFrom" text,
    "ActiveDateTo" text,
    "CreateDate" timestamp without time zone
);

CREATE TABLE public."CareProviderService" (
    "ID" bigint DEFAULT nextval('public."CareProviderService_ID_seq"'::regclass) NOT NULL,
    "CarpCode" text NOT NULL,
    "SvcItemCode" text NOT NULL,
    "SvcMaxAllow" text,
    "SvcRemainder" text,
    "Date" text,
    "CreateDate" timestamp without time zone
);

CREATE TABLE public."DoctorSchedule" (
    "ID" bigint NOT NULL,
    "FieldRow" text,
    "EffDate" text,
    "DoctorCode" text NOT NULL,
    "LocationCode" text,
    "LocationDesc" text,
    "Day" text NOT NULL,
    "TimeStart" text NOT NULL,
    "TimeEnd" text NOT NULL,
    "StartDate" text NOT NULL,
    "EndDate" text NOT NULL,
    "Length" text,
    "noOf" text,
    "Loadlevel" text,
    "noOfApp" text,
    "DoctorGroup" text,
    "CreateDate" timestamp without time zone
);

CREATE TABLE public."DoctorScheduleTemp" (
    "ID" bigint DEFAULT nextval('public."DoctorScheduleTemp_ID_seq"'::regclass) NOT NULL,
    "FieldRow" text,
    "EffDate" text,
    "DoctorCode" text NOT NULL,
    "LocationCode" text,
    "LocationDesc" text,
    "Day" text NOT NULL,
    "TimeStart" text NOT NULL,
    "TimeEnd" text NOT NULL,
    "StartDate" text NOT NULL,
    "EndDate" text NOT NULL,
    "Length" text,
    "noOf" text,
    "Loadlevel" text,
    "noOfApp" text,
    "DoctorGroup" text
);

CREATE TABLE public."PatientAppointment" (
    "ID" bigint DEFAULT nextval('public."PatientAppointment_ID_seq"'::regclass) NOT NULL,
    "PAADM_RowID" text,
    "HN" text,
    "EN" text,
    "Name" text NOT NULL,
    "Surname" text,
    "MiddleName" text,
    "Title" text,
    "Sex_Code" text NOT NULL,
    "Sex_Desc" text,
    "CarpCode" text,
    "ServiceCode" text NOT NULL,
    "AS_Date" text NOT NULL,
    "AS_SessStartTime" text NOT NULL,
    "APPT_ArrivalDate" text,
    "APPT_ArrivalTime" text,
    "APPT_CancelDate" text,
    "APPT_CancelTime" text,
    "LocCode" text NOT NULL,
    "LocDesc" text,
    "APPT_RowId" text,
    "PAADM_VisitStatus" text,
    "APPTStatus" text,
    "Fullname" text NOT NULL,
    "PT_Status" text,
    "EVTCall_Time" timestamp without time zone,
    "EVTEndService_Time" timestamp without time zone,
    "Room" text,
    "CreateDate" timestamp without time zone
);

CREATE TABLE public."PatientAppointmentHistory" (
    "ID" bigint DEFAULT nextval('public."PatientAppointmentHistory_ID_seq"'::regclass) NOT NULL,
    "PAADM_RowID" text,
    "HN" text,
    "EN" text,
    "Name" text NOT NULL,
    "Surname" text,
    "MiddleName" text,
    "Title" text,
    "Sex_Code" text NOT NULL,
    "Sex_Desc" text,
    "CarpCode" text,
    "ServiceCode" text NOT NULL,
    "AS_Date" text NOT NULL,
    "AS_SessStartTime" text NOT NULL,
    "APPT_ArrivalDate" text,
    "APPT_ArrivalTime" text,
    "APPT_CancelDate" text,
    "APPT_CancelTime" text,
    "LocCode" text NOT NULL,
    "LocDesc" text,
    "APPT_RowId" text,
    "PAADM_VisitStatus" text,
    "APPTStatus" text,
    "Fullname" text NOT NULL,
    "PT_Status" text,
    "Room" text,
    "TimeCreate" timestamp without time zone
);

CREATE TABLE public."PatientAppointmentTemp" (
    "ID" bigint NOT NULL,
    "PAADM_RowID" text,
    "HN" text,
    "EN" text,
    "Name" text,
    "Surname" text,
    "MiddleName" text,
    "Title" text,
    "Sex_Code" text,
    "Sex_Desc" text,
    "CarpCode" text,
    "ServiceCode" text,
    "AS_Date" text,
    "AS_SessStartTime" text,
    "APPT_ArrivalDate" text,
    "APPT_ArrivalTime" text,
    "APPT_CancelDate" text,
    "APPT_CancelTime" text,
    "LocCode" text,
    "LocDesc" text,
    "APPT_RowId" text,
    "PAADM_VisitStatus" text,
    "APPTStatus" text,
    "Fullname" text,
    "PT_Status" text,
    "Room" text
);

CREATE TABLE public."PatientStatus" (
    "ID" integer NOT NULL,
    "StatusSymbol" text NOT NULL,
    "StatusDesc" text NOT NULL
);

CREATE TABLE public."RoomDetail" (
    "ID" bigint NOT NULL,
    "CarpCode" text NOT NULL,
    "AssistCode" text NOT NULL,
    "ScheduleTime" text,
    "LocationCode" text NOT NULL,
    "CarpStatus" text NOT NULL,
    "Room" text NOT NULL,
    "LoginTime" timestamp without time zone,
    "LogoutTime" timestamp without time zone
);

CREATE TABLE public."Service" (
    "ID" bigint NOT NULL,
    "SvcItemCode" text NOT NULL,
    "SvcItemDesc" text NOT NULL,
    "SvcOrderSetCode" text,
    "SvcOrderSetDesc" text,
    "SvcTimeInMinute" text NOT NULL,
    "CreateDate" timestamp without time zone
);

COMMENT ON TABLE public."Service" IS 'Master Service';

CREATE TABLE public."Workcase" (
    "ID" integer,
    "CaseSymbol" text,
    "CaseDesc" text,
    "Priority" integer
);

-- ============================================================
-- SEQUENCE OWNERSHIP
-- ============================================================

ALTER SEQUENCE public."BookingRoom_ID_seq" OWNED BY public."BookingRoom"."ID";
ALTER SEQUENCE public."DoctorSchedule_ID_seq" OWNED BY public."DoctorSchedule"."ID";
ALTER SEQUENCE public."PatientAppointmentTemp_ID_seq" OWNED BY public."PatientAppointmentTemp"."ID";

-- ============================================================
-- INDEXES (from CreateIndexKey-1.sql)
-- ============================================================

-- AssistanceDentist
CREATE INDEX "AssistanceDentist_AssistCode_Idx" ON "AssistanceDentist" ("AssistCode");
CREATE INDEX "AssistanceDentist_AssistDesc_Idx" ON "AssistanceDentist" ("AssistDesc");

-- CareProvider
CREATE INDEX "CareProvider_CarpCode_Idx" ON "CareProvider" ("CarpCode");
CREATE INDEX "CareProvider_CarpDesc_Idx" ON "CareProvider" ("CarpDesc");

-- Service
CREATE INDEX "Service_SvcItemCode_Idx" ON "Service" ("SvcItemCode");
CREATE INDEX "Service_SvcItemDesc_Idx" ON "Service" ("SvcItemDesc");

-- CareProviderService
CREATE INDEX "CareProviderService_CarpCode_Idx" ON "CareProviderService" ("CarpCode");
CREATE INDEX "CareProviderService_SvcItemCode_Idx" ON "CareProviderService" ("SvcItemCode");
CREATE INDEX "CareProviderService_Date_Idx" ON "CareProviderService" ("Date");
CREATE INDEX "CareProviderService_CarpCode_SvcItemCode_Idx" ON "CareProviderService" ("CarpCode", "SvcItemCode");

-- DoctorSchedule
CREATE INDEX "DoctorSchedule_DoctorCode_Idx" ON "DoctorSchedule" ("DoctorCode");
CREATE INDEX "DoctorSchedule_Day_Idx" ON "DoctorSchedule" ("Day");
CREATE INDEX "DoctorSchedule_TimeStart_Idx" ON "DoctorSchedule" ("TimeStart");
CREATE INDEX "DoctorSchedule_TimeEnd_Idx" ON "DoctorSchedule" ("TimeEnd");
CREATE INDEX "DoctorSchedule_StartDate_Idx" ON "DoctorSchedule" ("StartDate");
CREATE INDEX "DoctorSchedule_EndDate_Idx" ON "DoctorSchedule" ("EndDate");
CREATE INDEX "DoctorSchedule_StartDate_EndDate_Day_Idx" ON "DoctorSchedule" ("StartDate", "EndDate", "Day");
CREATE INDEX "DoctorSchedule_StartDate_EndDate_Day_DoctorCode_Idx" ON "DoctorSchedule" ("StartDate", "EndDate", "Day", "DoctorCode");

-- DoctorScheduleTemp
CREATE INDEX "DoctorScheduleTemp_DoctorCode_Idx" ON "DoctorScheduleTemp" ("DoctorCode");
CREATE INDEX "DoctorScheduleTemp_Day_Idx" ON "DoctorScheduleTemp" ("Day");
CREATE INDEX "DoctorScheduleTemp_TimeStart_Idx" ON "DoctorScheduleTemp" ("TimeStart");
CREATE INDEX "DoctorScheduleTemp_TimeEnd_Idx" ON "DoctorScheduleTemp" ("TimeEnd");
CREATE INDEX "DoctorScheduleTemp_StartDate_Idx" ON "DoctorScheduleTemp" ("StartDate");
CREATE INDEX "DoctorScheduleTemp_EndDate_Idx" ON "DoctorScheduleTemp" ("EndDate");
CREATE INDEX "DoctorScheduleTemp_StartDate_EndDate_Day_Idx" ON "DoctorScheduleTemp" ("StartDate", "EndDate", "Day");
CREATE INDEX "DoctorScheduleTemp_StartDate_EndDate_Day_DoctorCode_Idx" ON "DoctorScheduleTemp" ("StartDate", "EndDate", "Day", "DoctorCode");

-- PatientAppointment
CREATE INDEX "PatientAppointment_CarpCode_Idx" ON "PatientAppointment" ("CarpCode");
CREATE INDEX "PatientAppointment_AS_Date_Idx" ON "PatientAppointment" ("AS_Date");
CREATE INDEX "PatientAppointment_PT_Status_Idx" ON "PatientAppointment" ("PT_Status");
CREATE INDEX "PatientAppointment_ServiceCode_Idx" ON "PatientAppointment" ("ServiceCode");
CREATE INDEX "PatientAppointment_AS_SessStartTime_Idx" ON "PatientAppointment" ("AS_SessStartTime");
CREATE INDEX "PatientAppointment_HN_Idx" ON "PatientAppointment" ("HN");
CREATE INDEX "PatientAppointment_EN_Idx" ON "PatientAppointment" ("EN");
CREATE INDEX "PatientAppointment_PAADM_RowID_Idx" ON "PatientAppointment" ("PAADM_RowID");
CREATE INDEX "PatientAppointment_Room_Idx" ON "PatientAppointment" ("Room");
CREATE INDEX "PatientAppointment_APPT_ArrivalDate_Idx" ON "PatientAppointment" ("APPT_ArrivalDate");
CREATE INDEX "PatientAppointment_APPT_CancelDate_Idx" ON "PatientAppointment" ("APPT_CancelDate");
CREATE INDEX "PatientAppointment_APPTStatus_Idx" ON "PatientAppointment" ("APPTStatus");
CREATE INDEX "PatientAppointment_CarpCode_AS_Date_Idx" ON "PatientAppointment" ("CarpCode", "AS_Date");
CREATE INDEX "PatientAppointment_CarpCode_AS_Date_SessStartTime_Idx" ON "PatientAppointment" ("CarpCode", "AS_Date", "AS_SessStartTime");
CREATE INDEX "PatientAppointment_HN_EN_Idx" ON "PatientAppointment" ("HN", "EN");

-- PatientAppointmentTemp
CREATE INDEX "PatientAppointmentTemp_CarpCode_Idx" ON "PatientAppointmentTemp" ("CarpCode");
CREATE INDEX "PatientAppointmentTemp_AS_Date_Idx" ON "PatientAppointmentTemp" ("AS_Date");
CREATE INDEX "PatientAppointmentTemp_PT_Status_Idx" ON "PatientAppointmentTemp" ("PT_Status");
CREATE INDEX "PatientAppointmentTemp_ServiceCode_Idx" ON "PatientAppointmentTemp" ("ServiceCode");
CREATE INDEX "PatientAppointmentTemp_AS_SessStartTime_Idx" ON "PatientAppointmentTemp" ("AS_SessStartTime");
CREATE INDEX "PatientAppointmentTemp_HN_Idx" ON "PatientAppointmentTemp" ("HN");
CREATE INDEX "PatientAppointmentTemp_EN_Idx" ON "PatientAppointmentTemp" ("EN");
CREATE INDEX "PatientAppointmentTemp_PAADM_RowID_Idx" ON "PatientAppointmentTemp" ("PAADM_RowID");
CREATE INDEX "PatientAppointmentTemp_Room_Idx" ON "PatientAppointmentTemp" ("Room");
CREATE INDEX "PatientAppointmentTemp_APPT_ArrivalDate_Idx" ON "PatientAppointmentTemp" ("APPT_ArrivalDate");
CREATE INDEX "PatientAppointmentTemp_APPT_CancelDate_Idx" ON "PatientAppointmentTemp" ("APPT_CancelDate");
CREATE INDEX "PatientAppointmentTemp_APPTStatus_Idx" ON "PatientAppointmentTemp" ("APPTStatus");
CREATE INDEX "PatientAppointmentTemp_CarpCode_AS_Date_Idx" ON "PatientAppointmentTemp" ("CarpCode", "AS_Date");
CREATE INDEX "PatientAppointmentTemp_CarpCode_AS_Date_SessStartTime_Idx" ON "PatientAppointmentTemp" ("CarpCode", "AS_Date", "AS_SessStartTime");
CREATE INDEX "PatientAppointmentTemp_HN_EN_Idx" ON "PatientAppointmentTemp" ("HN", "EN");

-- PatientAppointmentHistory
CREATE INDEX "PatientAppointmentHistory_CarpCode_Idx" ON "PatientAppointmentHistory" ("CarpCode");
CREATE INDEX "PatientAppointmentHistory_AS_Date_Idx" ON "PatientAppointmentHistory" ("AS_Date");
CREATE INDEX "PatientAppointmentHistory_PT_Status_Idx" ON "PatientAppointmentHistory" ("PT_Status");
CREATE INDEX "PatientAppointmentHistory_ServiceCode_Idx" ON "PatientAppointmentHistory" ("ServiceCode");
CREATE INDEX "PatientAppointmentHistory_AS_SessStartTime_Idx" ON "PatientAppointmentHistory" ("AS_SessStartTime");
CREATE INDEX "PatientAppointmentHistory_HN_Idx" ON "PatientAppointmentHistory" ("HN");
CREATE INDEX "PatientAppointmentHistory_EN_Idx" ON "PatientAppointmentHistory" ("EN");
CREATE INDEX "PatientAppointmentHistory_PAADM_RowID_Idx" ON "PatientAppointmentHistory" ("PAADM_RowID");
CREATE INDEX "PatientAppointmentHistory_Room_Idx" ON "PatientAppointmentHistory" ("Room");
CREATE INDEX "PatientAppointmentHistory_APPT_ArrivalDate_Idx" ON "PatientAppointmentHistory" ("APPT_ArrivalDate");
CREATE INDEX "PatientAppointmentHistory_APPT_CancelDate_Idx" ON "PatientAppointmentHistory" ("APPT_CancelDate");
CREATE INDEX "PatientAppointmentHistory_APPTStatus_Idx" ON "PatientAppointmentHistory" ("APPTStatus");
CREATE INDEX "PatientAppointmentHistory_CarpCode_AS_Date_Idx" ON "PatientAppointmentHistory" ("CarpCode", "AS_Date");
CREATE INDEX "PatientAppointmentHistory_CarpCode_AS_Date_SessStartTime_Idx" ON "PatientAppointmentHistory" ("CarpCode", "AS_Date", "AS_SessStartTime");
CREATE INDEX "PatientAppointmentHistory_HN_EN_Idx" ON "PatientAppointmentHistory" ("HN", "EN");

-- RoomDetail
CREATE INDEX "RoomDetail_CarpCode_Idx" ON "RoomDetail" ("CarpCode");
CREATE INDEX "RoomDetail_AssistCode_Idx" ON "RoomDetail" ("AssistCode");
CREATE INDEX "RoomDetail_CarpStatus_Idx" ON "RoomDetail" ("CarpStatus");
CREATE INDEX "RoomDetail_Room_Idx" ON "RoomDetail" ("Room");
CREATE INDEX "RoomDetail_CarpCode_CarpStatus_Idx" ON "RoomDetail" ("CarpCode", "CarpStatus");

-- PatientStatus
CREATE INDEX "PatientStatus_StatusSymbol_Idx" ON "PatientStatus" ("StatusSymbol");

-- Workcase
CREATE INDEX "Workcase_ID_Idx" ON "Workcase" ("ID");
CREATE INDEX "Workcase_CaseSymbol_Idx" ON "Workcase" ("CaseSymbol");

-- BookingRoom
CREATE INDEX "BookingRoom_ID_Idx" ON "BookingRoom" ("ID");
CREATE INDEX "BookingRoom_CarpCode_Idx" ON "BookingRoom" ("CarpCode");
CREATE INDEX "BookingRoom_CreateDate_Idx" ON "BookingRoom" ("CreateDate");
CREATE INDEX "BookingRoom_AssistCode1_Idx" ON "BookingRoom" ("AssistCode1");
CREATE INDEX "BookingRoom_AssistCode2_Idx" ON "BookingRoom" ("AssistCode2");
CREATE INDEX "BookingRoom_StartDate_EndDate_Day_StartTime_EndTime_Room_Idx" ON "BookingRoom" ("StartDate", "EndDate", "Day", "StartTime", "EndTime", "Room");
