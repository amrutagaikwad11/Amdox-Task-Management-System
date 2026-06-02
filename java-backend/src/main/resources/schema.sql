-- MySQL Database Schema Definition for Amdox Task Management
CREATE DATABASE IF NOT EXISTS amdox_tasks;
USE amdox_tasks;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Viewer',
    avatar_color VARCHAR(10) NOT NULL DEFAULT '#6366f1'
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Todo',
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    due_date DATE NOT NULL,
    assignee_id VARCHAR(50) NOT NULL,
    creator_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(50) PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_color VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(50) PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(20) NOT NULL,
    type VARCHAR(100) DEFAULT 'application/octet-stream',
    url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100) NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Seed Initial Data
INSERT INTO users (id, name, email, role, avatar_color) VALUES
('usr-1', 'Sarah Jenkins', 'sarah@amdox.com', 'Admin', '#6366f1'),
('usr-2', 'David Chen', 'david@amdox.com', 'Editor', '#10b981'),
('usr-3', 'Elena Rostova', 'elena@amdox.com', 'Viewer', '#f59e0b'),
('usr-4', 'Marcus Aurelius', 'marcus@amdox.com', 'Editor', '#ec4899')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO tasks (id, title, description, status, priority, due_date, assignee_id, creator_id) VALUES
('tsk-1', 'Formulate Core System Architectural Framework', 'Design and document the core service framework. This requires establishing secure endpoints, checking TLS layers, and ensuring robust failovers.', 'Done', 'Critical', '2026-05-30', 'usr-2', 'usr-1'),
('tsk-2', 'Refactor API Gateway Authenticator Middleware', 'Standardize session checking, integrate JWT validation with precise expiration limits, and block brute-force attempts on public pathways.', 'In_Review', 'High', '2026-06-02', 'usr-1', 'usr-1'),
('tsk-3', 'Develop Kanban Interactive Drag-and-Drop View', 'Implement interactive task boards using Tailwind CSS. Must display columns for task lifecycle and show full visual feedback on mouse and touch gestures.', 'In_Progress', 'Medium', '2026-06-03', 'usr-4', 'usr-2')
ON DUPLICATE KEY UPDATE title=title;
