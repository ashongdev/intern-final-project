CREATE TYPE LEVEL AS ENUM ('100','200','300','400');
CREATE TYPE FACULTIES AS ENUM ('FoCIS', 'FoITB', 'FoE');
CREATE TABLE faculty (
   id SERIAL PRIMARY KEY,
   name FACULTIES UNIQUE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE students (
   id SERIAL PRIMARY KEY,
   email VARCHAR(50) NOT NULL UNIQUE,
   phone VARCHAR(10) UNIQUE,
   faculty INT,
   index_number VARCHAR(20) UNIQUE NOT NULL,
   fullname TEXT NOT NULL,
   programme VARCHAR(30) UNIQUE,
   level LEVEL,
   BIO TEXT,
   avatar TEXT,
   password TEXT NOT NULL,
   is_profile_completed BOOLEAN DEFAULT false,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW(),

   FOREIGN KEY (faculty) REFERENCES faculty (id)
);

CREATE TYPE THEME AS ENUM ('dark', 'light');

CREATE TABLE user_settings (
   id SERIAL PRIMARY KEY,
   student_id INT NOT NULL,
   email_notis BOOLEAN DEFAULT true,
   reminder_notis BOOLEAN DEFAULT true,
   theme THEME DEFAULT ('light'),
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW(),

   FOREIGN KEY (student_id) REFERENCES students (id)
)

CREATE TYPE INTERNSHIP_TYPE AS ENUM ('voluntary', 'mandatory');

CREATE TABLE letter_requests (
   id SERIAL PRIMARY KEY,
   student_id VARCHAR(20) NOT NULL,
   internship_type INTERNSHIP_TYPE NOT NULL DEFAULT 'mandatory',
   start_date DATE DEFAULT NOW(),
   end_date DATE DEFAULT (NOW() + INTERVAL '2 months'),
   additonal_notes TEXT,
   organization_name TEXT,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW(),
   status VARCHAR(10) CHECK (status IN ('Pending', 'Sent', 'Cancelled')) DEFAULT 'Pending',
   FOREIGN KEY (student_id) REFERENCES students (index_number)
);


CREATE TABLE user_step (
   id SERIAL PRIMARY KEY,
   student_id VARCHAR(20) NOT NULL,
   current_step INT CHECK (current_step IN (1, 2, 3, 4)),

   FOREIGN KEY (student_id) REFERENCES students (index_number)
);

CREATE OR REPLACE FUNCTION insert_current_step()
RETURNS TRIGGER AS $$
BEGIN
   INSERT INTO user_step (student_id, current_step) VALUES (NEW.index_number, 1);

   RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER insert_current_step
AFTER INSERT ON students
FOR EACH ROW
EXECUTE FUNCTION insert_current_step();