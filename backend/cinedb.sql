-- cine_backend.sql (Updated)
-- SQL Schema for Full-featured Movie Ticket Booking System
-- Includes support for user roles, theater owners, shows, and more

-- USERS TABLE: Handles all login roles (admin, theater owner, user)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'theater_owner', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- THEATERS TABLE: Each theater belongs to a theater_owner
CREATE TABLE theaters (
    theater_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_id INT,
    location VARCHAR(255),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(15),
    FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

-- SCREENS TABLE: Each theater has multiple screens
CREATE TABLE screens (
    screen_id INT AUTO_INCREMENT PRIMARY KEY,
    theater_id INT,
    screen_name VARCHAR(50),
    total_seats INT,
    seat_layout JSON,
    FOREIGN KEY (theater_id) REFERENCES theaters(theater_id)
);

-- MOVIES TABLE: Movies added by theater owners (or shared across theaters)
CREATE TABLE movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    theater_id INT, -- Optional: NULL if movie is global/shared
    title VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INT,
    language VARCHAR(50),
    genre VARCHAR(100),
    poster_url TEXT,
    trailer_url TEXT,
    release_date DATE,
    FOREIGN KEY (theater_id) REFERENCES theaters(theater_id)
);

-- THEATER_MOVIES TABLE: For shared/global movies shown by multiple theaters
CREATE TABLE theater_movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    theater_id INT,
    movie_id INT,
    FOREIGN KEY (theater_id) REFERENCES theaters(theater_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
);

-- SHOWS TABLE: Specific showtimes for a movie on a screen
CREATE TABLE shows (
    show_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT,
    screen_id INT,
    show_time DATETIME,
    price DECIMAL(8,2),
    available_seats INT,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
    FOREIGN KEY (screen_id) REFERENCES screens(screen_id)
);

-- BOOKINGS TABLE: Tickets booked by users
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    show_id INT,
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seats_booked JSON,
    total_price DECIMAL(10,2),
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (show_id) REFERENCES shows(show_id)
);

-- MOVIE REVIEWS TABLE: Reviews left by users for movies
CREATE TABLE movie_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    movie_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
);

-- SITE REVIEWS TABLE: Reviews of the platform itself
CREATE TABLE site_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- PAYMENTS TABLE: Tracks payment details for bookings
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);
