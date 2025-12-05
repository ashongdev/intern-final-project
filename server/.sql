-- Active: 1738799141377@@localhost@5432@intern
CREATE DATABASE intern;

-- MAIN ENTITIES
-- ADMIN, USERS, UNIVERSITY, ORGANIZATION, SUPERVISOR


CREATE TABLE admins (
   id SERIAL PRIMARY KEY,
   username VARCHAR(20) UNIQUE NOT NULL,
   email VARCHAR(255) NOT NULL UNIQUE,
   password TEXT NOT NULL,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE university (
   id SERIAL PRIMARY KEY,
   name VARCHAR(100) UNIQUE NOT NULL,
   phone_number VARCHAR(30) UNIQUE NOT NULL,
   email VARCHAR(100) NOT NULL UNIQUE,
   password TEXT NOT NULL,
   address TEXT NOT NULL UNIQUE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX uni_name ON university (name);
CREATE INDEX uni_email ON university (email);

CREATE TABLE students (
   id SERIAL PRIMARY KEY,
   first_name VARCHAR(20) NOT NULL,
   last_name VARCHAR(20) NOT NULL,
   program_id INTEGER,
   index_number VARCHAR(10) NOT NULL UNIQUE,
   email VARCHAR(255) NOT NULL UNIQUE,
   password TEXT NOT NULL,
   phone_number VARCHAR(15) UNIQUE,
   level INT NOT NULL CHECK(level IN (100, 200, 300, 400)),
   school_id INT DEFAULT 1, -- set default to gctu (ID: 1)
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW(),
   FOREIGN KEY (school_id) REFERENCES university (id) ON DELETE SET NULL
);
CREATE INDEX std_index ON students (index_number);
CREATE INDEX std_name ON students (first_name, last_name);

CREATE TABLE organizations (
   id SERIAL PRIMARY KEY,
   name VARCHAR(50) NOT NULL UNIQUE,
   email VARCHAR(50) NOT NULL UNIQUE,
   password TEXT NOT NULL,
   phone_number VARCHAR(30) UNIQUE NOT NULL,
   address TEXT NOT NULL UNIQUE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX org_name ON organizations (name);

CREATE TABLE supervisors (
   id SERIAL PRIMARY KEY,
   first_name VARCHAR(20) NOT NULL,
   last_name VARCHAR(20) NOT NULL,
   email VARCHAR(255) NOT NULL UNIQUE,
   password TEXT NOT NULL,
   phone_number VARCHAR(15) UNIQUE,
   organization_id INT DEFAULT 1, 
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW(),
   FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL
);
CREATE INDEX supervisor_name ON supervisors (first_name, last_name);

CREATE TABLE supervising (
   id SERIAL PRIMARY KEY,
   student_id INT NOT NULL,
   supervisor_id INT NOT NULL,
   FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
   FOREIGN KEY (supervisor_id) REFERENCES supervisors (id) ON DELETE CASCADE
);

CREATE TABLE letter_requests (
   id SERIAL PRIMARY KEY,
   student_id INT NOT NULL UNIQUE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW(),
   FOREIGN KEY (student_id) REFERENCES students (id)
);

CREATE TABLE student_logs (
   id SERIAL PRIMARY KEY,
   activity VARCHAR(20) NOT NULL,
   student_id INT NOT NULL,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   FOREIGN KEY (student_id) REFERENCES students (id)
);

CREATE OR REPLACE FUNCTION log_letter_request()
RETURNS TRIGGER AS $$
BEGIN
   INSERT INTO student_logs (activity, student_id)
   VALUES ("Letter Request", NEW.student_id);
END
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER student_activity_trigger
AFTER INSERT ON letter_requests
FOR EACH ROW
EXECUTE FUNCTION log_letter_request();

