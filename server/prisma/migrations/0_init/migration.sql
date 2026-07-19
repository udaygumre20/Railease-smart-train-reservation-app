-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "TrainStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SeatType" AS ENUM ('LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER', 'WINDOW_SEAT', 'AISLE_SEAT', 'MIDDLE_SEAT', 'CABIN_BERTH', 'COUPE_BERTH');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'WAITLISTED', 'RAC', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('CONFIRMED', 'WAITLISTED', 'RAC', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('WAITING', 'PROMOTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RACStatus" AS ENUM ('RAC', 'PROMOTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'WAITLIST_PROMOTED', 'RAC_PROMOTED', 'TRAIN_DELAY', 'DEPARTURE_REMINDER', 'GENERAL');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "Quota" AS ENUM ('GENERAL', 'LADIES', 'TATKAL', 'PREMIUM_TATKAL', 'SENIOR_CITIZEN', 'DIVYAANG', 'DEFENCE', 'FOREIGN_TOURIST');

-- CreateEnum
CREATE TYPE "TrainType" AS ENUM ('VANDE_BHARAT', 'RAJDHANI', 'SHATABDI', 'DURONTO', 'MAIL_EXPRESS', 'SUPERFAST', 'TEJAS', 'AMRIT_BHARAT', 'GARIB_RATH', 'HUMSAFAR', 'OTHER');

-- CreateEnum
CREATE TYPE "CoachClass" AS ENUM ('EC', 'CC', 'SL', 'AC3', 'AC2', 'AC1');

-- CreateEnum
CREATE TYPE "CoachTechnology" AS ENUM ('LHB', 'ICF', 'VANDE_BHARAT');

-- CreateEnum
CREATE TYPE "LayoutType" AS ENUM ('CHAIR_2_2', 'CHAIR_2_3', 'SLEEPER_3_TIER', 'AC_3_TIER', 'AC_2_TIER', 'FIRST_AC');

-- CreateEnum
CREATE TYPE "SeatPosition" AS ENUM ('WINDOW', 'AISLE', 'MIDDLE');

-- CreateEnum
CREATE TYPE "SeatReservation" AS ENUM ('NONE', 'GENDER_RESERVED', 'SENIOR_RESERVED', 'ACCESSIBLE');

-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'RAC_STATUS', 'WAITING', 'LOCKED', 'SELECTED', 'BLOCKED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" "Gender",
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "refresh_token" TEXT,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zone" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "platforms" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "total_distance" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "distance_from_origin" DECIMAL(10,2) NOT NULL,
    "arrival_time" TEXT,
    "departure_time" TEXT,
    "halt_duration" INTEGER,
    "day_offset" INTEGER NOT NULL DEFAULT 0,
    "platform" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trains" (
    "id" TEXT NOT NULL,
    "train_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "train_type" "TrainType" NOT NULL DEFAULT 'OTHER',
    "status" "TrainStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "train_routes" (
    "id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "run_days" "DayOfWeek"[],
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "train_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coach_class" "CoachClass",
    "technology" "CoachTechnology",
    "layout_type" "LayoutType",
    "layout_template_id" TEXT,
    "seat_layout" JSONB,
    "seats_per_coach" INTEGER NOT NULL,
    "has_ac" BOOLEAN NOT NULL DEFAULT false,
    "berth_tiers" INTEGER NOT NULL,
    "base_fare_per_km" DECIMAL(6,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaches" (
    "id" TEXT NOT NULL,
    "coach_number" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "coach_type_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "total_seats" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" TEXT NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "seat_label" TEXT,
    "seat_type" "SeatType" NOT NULL,
    "position" "SeatPosition",
    "coach_id" TEXT NOT NULL,
    "row_number" INTEGER,
    "column_number" INTEGER,
    "cabin" INTEGER,
    "coupe" INTEGER,
    "is_accessible" BOOLEAN NOT NULL DEFAULT false,
    "reserved_for" "SeatReservation" NOT NULL DEFAULT 'NONE',
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "boarding_station_id" TEXT NOT NULL,
    "alighting_station_id" TEXT NOT NULL,
    "journey_date" TIMESTAMP(3) NOT NULL,
    "total_passengers" INTEGER NOT NULL,
    "total_fare" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "quota" "Quota" NOT NULL DEFAULT 'GENERAL',
    "coach_preference" TEXT,
    "booking_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passengers" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'IN',
    "id_type" TEXT,
    "id_number" TEXT,
    "seat_preference" "SeatType",
    "is_lead_passenger" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "passenger_id" TEXT NOT NULL,
    "seat_id" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'CONFIRMED',
    "coach_number" TEXT NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "seat_type" "SeatType" NOT NULL,
    "fare" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "method" "PaymentMethod",
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transaction_id" TEXT,
    "gateway_order_id" TEXT,
    "gateway_response" JSONB,
    "refund_amount" DECIMAL(10,2),
    "refund_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pnr_records" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "pnr_number" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "chart_prepared" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pnr_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waiting_list" (
    "id" TEXT NOT NULL,
    "passenger_id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "journey_date" TIMESTAMP(3) NOT NULL,
    "coach_type_code" TEXT NOT NULL,
    "waitlist_number" INTEGER NOT NULL,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'WAITING',
    "promoted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waiting_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rac_entries" (
    "id" TEXT NOT NULL,
    "passenger_id" TEXT NOT NULL,
    "seat_id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "journey_date" TIMESTAMP(3) NOT NULL,
    "rac_number" INTEGER NOT NULL,
    "status" "RACStatus" NOT NULL DEFAULT 'RAC',
    "promoted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rac_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_locks" (
    "id" TEXT NOT NULL,
    "seat_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "journey_date" TIMESTAMP(3) NOT NULL,
    "locked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layout_templates" (
    "id" TEXT NOT NULL,
    "layout_type" "LayoutType" NOT NULL,
    "name" TEXT NOT NULL,
    "total_rows" INTEGER NOT NULL,
    "total_columns" INTEGER NOT NULL,
    "total_seats" INTEGER NOT NULL,
    "seat_definitions" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layout_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_availability" (
    "id" TEXT NOT NULL,
    "seat_id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "journey_date" TIMESTAMP(3) NOT NULL,
    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "stations_code_key" ON "stations"("code");

-- CreateIndex
CREATE INDEX "stations_code_idx" ON "stations"("code");

-- CreateIndex
CREATE INDEX "stations_name_idx" ON "stations"("name");

-- CreateIndex
CREATE INDEX "stations_city_idx" ON "stations"("city");

-- CreateIndex
CREATE UNIQUE INDEX "routes_code_key" ON "routes"("code");

-- CreateIndex
CREATE INDEX "route_stops_route_id_idx" ON "route_stops"("route_id");

-- CreateIndex
CREATE INDEX "route_stops_station_id_idx" ON "route_stops"("station_id");

-- CreateIndex
CREATE UNIQUE INDEX "route_stops_route_id_sequence_number_key" ON "route_stops"("route_id", "sequence_number");

-- CreateIndex
CREATE UNIQUE INDEX "route_stops_route_id_station_id_key" ON "route_stops"("route_id", "station_id");

-- CreateIndex
CREATE UNIQUE INDEX "trains_train_number_key" ON "trains"("train_number");

-- CreateIndex
CREATE INDEX "trains_train_number_idx" ON "trains"("train_number");

-- CreateIndex
CREATE INDEX "trains_name_idx" ON "trains"("name");

-- CreateIndex
CREATE INDEX "trains_status_idx" ON "trains"("status");

-- CreateIndex
CREATE INDEX "trains_train_type_idx" ON "trains"("train_type");

-- CreateIndex
CREATE INDEX "train_routes_train_id_idx" ON "train_routes"("train_id");

-- CreateIndex
CREATE INDEX "train_routes_route_id_idx" ON "train_routes"("route_id");

-- CreateIndex
CREATE INDEX "train_routes_is_active_idx" ON "train_routes"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "train_routes_train_id_route_id_key" ON "train_routes"("train_id", "route_id");

-- CreateIndex
CREATE UNIQUE INDEX "coach_types_code_key" ON "coach_types"("code");

-- CreateIndex
CREATE INDEX "coach_types_coach_class_idx" ON "coach_types"("coach_class");

-- CreateIndex
CREATE INDEX "coach_types_technology_idx" ON "coach_types"("technology");

-- CreateIndex
CREATE INDEX "coach_types_layout_type_idx" ON "coach_types"("layout_type");

-- CreateIndex
CREATE INDEX "coaches_train_id_idx" ON "coaches"("train_id");

-- CreateIndex
CREATE INDEX "coaches_coach_type_id_idx" ON "coaches"("coach_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "coaches_train_id_coach_number_key" ON "coaches"("train_id", "coach_number");

-- CreateIndex
CREATE INDEX "seats_coach_id_idx" ON "seats"("coach_id");

-- CreateIndex
CREATE INDEX "seats_is_available_idx" ON "seats"("is_available");

-- CreateIndex
CREATE INDEX "seats_seat_type_idx" ON "seats"("seat_type");

-- CreateIndex
CREATE INDEX "seats_position_idx" ON "seats"("position");

-- CreateIndex
CREATE INDEX "seats_reserved_for_idx" ON "seats"("reserved_for");

-- CreateIndex
CREATE UNIQUE INDEX "seats_coach_id_seat_number_key" ON "seats"("coach_id", "seat_number");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_train_id_idx" ON "bookings"("train_id");

-- CreateIndex
CREATE INDEX "bookings_journey_date_idx" ON "bookings"("journey_date");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_booking_date_idx" ON "bookings"("booking_date");

-- CreateIndex
CREATE INDEX "bookings_train_id_journey_date_idx" ON "bookings"("train_id", "journey_date");

-- CreateIndex
CREATE INDEX "passengers_booking_id_idx" ON "passengers"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_passenger_id_key" ON "tickets"("passenger_id");

-- CreateIndex
CREATE INDEX "tickets_passenger_id_idx" ON "tickets"("passenger_id");

-- CreateIndex
CREATE INDEX "tickets_seat_id_idx" ON "tickets"("seat_id");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gateway_order_id_key" ON "payments"("gateway_order_id");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_transaction_id_idx" ON "payments"("transaction_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paid_at_idx" ON "payments"("paid_at");

-- CreateIndex
CREATE UNIQUE INDEX "pnr_records_booking_id_key" ON "pnr_records"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "pnr_records_pnr_number_key" ON "pnr_records"("pnr_number");

-- CreateIndex
CREATE INDEX "pnr_records_pnr_number_idx" ON "pnr_records"("pnr_number");

-- CreateIndex
CREATE INDEX "pnr_records_booking_id_idx" ON "pnr_records"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "waiting_list_passenger_id_key" ON "waiting_list"("passenger_id");

-- CreateIndex
CREATE INDEX "waiting_list_train_id_journey_date_idx" ON "waiting_list"("train_id", "journey_date");

-- CreateIndex
CREATE INDEX "waiting_list_coach_type_code_idx" ON "waiting_list"("coach_type_code");

-- CreateIndex
CREATE INDEX "waiting_list_status_idx" ON "waiting_list"("status");

-- CreateIndex
CREATE UNIQUE INDEX "waiting_list_train_id_journey_date_coach_type_code_waitlist_key" ON "waiting_list"("train_id", "journey_date", "coach_type_code", "waitlist_number");

-- CreateIndex
CREATE UNIQUE INDEX "rac_entries_passenger_id_key" ON "rac_entries"("passenger_id");

-- CreateIndex
CREATE INDEX "rac_entries_train_id_journey_date_idx" ON "rac_entries"("train_id", "journey_date");

-- CreateIndex
CREATE INDEX "rac_entries_seat_id_idx" ON "rac_entries"("seat_id");

-- CreateIndex
CREATE INDEX "rac_entries_status_idx" ON "rac_entries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rac_entries_train_id_journey_date_rac_number_key" ON "rac_entries"("train_id", "journey_date", "rac_number");

-- CreateIndex
CREATE INDEX "seat_locks_seat_id_idx" ON "seat_locks"("seat_id");

-- CreateIndex
CREATE INDEX "seat_locks_user_id_idx" ON "seat_locks"("user_id");

-- CreateIndex
CREATE INDEX "seat_locks_train_id_journey_date_idx" ON "seat_locks"("train_id", "journey_date");

-- CreateIndex
CREATE INDEX "seat_locks_expires_at_idx" ON "seat_locks"("expires_at");

-- CreateIndex
CREATE INDEX "seat_locks_is_active_idx" ON "seat_locks"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "unique_seat_lock_per_journey" ON "seat_locks"("seat_id", "train_id", "journey_date");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "layout_templates_layout_type_key" ON "layout_templates"("layout_type");

-- CreateIndex
CREATE INDEX "seat_availability_train_id_journey_date_idx" ON "seat_availability"("train_id", "journey_date");

-- CreateIndex
CREATE INDEX "seat_availability_status_idx" ON "seat_availability"("status");

-- CreateIndex
CREATE UNIQUE INDEX "seat_availability_seat_id_train_id_journey_date_key" ON "seat_availability"("seat_id", "train_id", "journey_date");

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train_routes" ADD CONSTRAINT "train_routes_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train_routes" ADD CONSTRAINT "train_routes_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_types" ADD CONSTRAINT "coach_types_layout_template_id_fkey" FOREIGN KEY ("layout_template_id") REFERENCES "layout_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_coach_type_id_fkey" FOREIGN KEY ("coach_type_id") REFERENCES "coach_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_alighting_station_id_fkey" FOREIGN KEY ("alighting_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_boarding_station_id_fkey" FOREIGN KEY ("boarding_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passengers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pnr_records" ADD CONSTRAINT "pnr_records_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waiting_list" ADD CONSTRAINT "waiting_list_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passengers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waiting_list" ADD CONSTRAINT "waiting_list_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rac_entries" ADD CONSTRAINT "rac_entries_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passengers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rac_entries" ADD CONSTRAINT "rac_entries_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rac_entries" ADD CONSTRAINT "rac_entries_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_locks" ADD CONSTRAINT "seat_locks_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_locks" ADD CONSTRAINT "seat_locks_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_locks" ADD CONSTRAINT "seat_locks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_availability" ADD CONSTRAINT "seat_availability_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

