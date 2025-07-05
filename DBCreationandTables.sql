
-- Create the database
CREATE DATABASE IF NOT EXISTS FreeExchangeBooks;
USE FreeExchangeBooks;

-- 1. Table: users
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: usercredentials (holds auth info)
CREATE TABLE usercredentials (
    credential_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    auth_provider ENUM('google', 'apple') NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Table: books (picture stored as binary data)
CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT , -- Owner (donor) of the book
    picture LONGBLOB, -- Binary image data
    book_name VARCHAR(255) NOT NULL,
    authors VARCHAR(255),
    genre VARCHAR(100),
    languages VARCHAR(50),
    conditions ENUM('new', 'like new', 'good', 'fair', 'poor') DEFAULT 'good',
    descriptions TEXT,
    date_available DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 4. Table: donors
CREATE TABLE donors (
    donor_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    phone_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Table: receivers
CREATE TABLE receivers (
    receiver_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT ,
    phone_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
