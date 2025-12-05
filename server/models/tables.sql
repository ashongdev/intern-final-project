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

ALTER TABLE students
ALTER COLUMN phone TYPE VARCHAR(10),
ALTER COLUMN phone SET DEFAULT NULL;



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