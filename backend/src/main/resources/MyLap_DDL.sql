CREATE DATABASE "defaultdb"

CREATE TABLE "order_details" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "price" double DEFAULT NULL,
  "product_id" bigint DEFAULT NULL,
  "quantity" int DEFAULT NULL,
  "order_id" bigint DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "FKjyu2qbqt8gnvno9oe9j2s2ldk" ("order_id"),
  CONSTRAINT "FKjyu2qbqt8gnvno9oe9j2s2ldk" FOREIGN KEY ("order_id") REFERENCES "orders" ("id")
);

CREATE TABLE "orders" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "address" varchar(255) DEFAULT NULL,
  "created_at" datetime(6) DEFAULT NULL,
  "customer_name" varchar(255) DEFAULT NULL,
  "phone" varchar(255) DEFAULT NULL,
  "status" varchar(255) DEFAULT NULL,
  "total_amount" double DEFAULT NULL,
  "username" varchar(255) DEFAULT NULL,
  "cancel_reason" text,
  PRIMARY KEY ("id")
);

CREATE TABLE "products" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "brand" varchar(255) DEFAULT NULL,
  "cpu" varchar(255) DEFAULT NULL,
  "description" text,
  "image" varchar(1000) DEFAULT NULL,
  "name" varchar(255) NOT NULL,
  "price" double DEFAULT NULL,
  "ram" varchar(255) DEFAULT NULL,
  "screen" varchar(255) DEFAULT NULL,
  "storage" varchar(255) DEFAULT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "users" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "email" varchar(255) DEFAULT NULL,
  "full_name" varchar(255) DEFAULT NULL,
  "password" varchar(255) NOT NULL,
  "role" varchar(255) DEFAULT NULL,
  "username" varchar(255) NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "UKr43af9ap4edm43mmtq01oddj6" ("username")
);