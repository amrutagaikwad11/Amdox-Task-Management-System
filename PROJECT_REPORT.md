# Project Report: Enterprise Java Full-Stack Task & Sprint Management System (Amdox Tasks)

---

## 1. Executive Summary
The **Amdox Tasks** platform is an enterprise-grade, full-stack sprint coordinator and team workstation. Designed around modern task management workflows, the application brings together high-fidelity frontend experiences and backend engineering design. 

The architecture bridges a **React 19, Vite, and Tailwind CSS v4 Single Page Application (SPA)** with an structural **Advanced Java + MySQL relational database backend modeling simulation**. It serves as a pedagogical and execution-ready sandbox illustrating enterprise patterns including JDBC connection pools, Java Servlet routers, role-based security filters, SQL diagnostic execution pipelines, and continuous real-time audit logging.

---

## 2. Feature Realization Matrix

Here is how each requested feature is fully realized and implemented inside the architecture of the platform:

### 1. Assignment and Prioritization
*   **Implementation Status:** **Fully Implemented & Interactive**
*   **Description:** Tasks can be assigned directly to specific team members during creation or editing. Each task registers clear due deadlines, priorities (`Low`, `Medium`, `High`, `Critical`), and workflow columns (`Todo`, `In_Progress`, `In_Review`, `Done`).
*   **Relational Logic:** Assigned via standard relational queries connecting the `tasks` table's `assignee_id` field to the primary identity constraints of the `users` table.

### 2. Role-Based Permissions (RBAC)
*   **Implementation Status:** **Fully Implemented & Interactive**
*   **Description:** Three specific security role authorities are enforced:
    *   **Admin:** Complete authority over task creation, deletion, status columns, file uploads, remarks, and member roles.
    *   **Editor:** Authorized to modify existing task states, participate in discussions, and upload files.
    *   **Viewer:** Read-only access to Kanban boards and analytical metrics.
*   **Enforcement:** Verified on the client-side via active UI controls mapping and server-side in `TaskServlet.java` via header inspection:
    ```java
    String userRole = req.getHeader("X-User-Role");
    if (userRole == null || userRole.equals("Viewer")) {
        resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
        out.print("{\"error\": \"Viewer role strictly unauthorized.\"}");
        return;
    }
    ```

### 3. Deadline Tracking and Alerts/Notifications
*   **Implementation Status:** **Fully Implemented & Interactive**
*   **Description:** Key deadlines are actively matched against the current epoch timeline. 
*   **Alerts & Center:** Real-time calculation triggers system-wide alerts for issues like overdue critical tasks or pending reviews. The **Notification Center** dynamically serves warnings, successes, and info summaries with deep-link navigation directly targeting the task in focus.

### 4. Real-Time Collaboration
*   **Implementation Status:** **Fully Implemented & Interactive**
*   **Description:** Discussions and file shares are built directly into each task card's focused modal:
    *   **Interactive Comments:** Members pool discussions with customized user avatar chips, recording dynamic time-stamps.
    *   **Drag-and-Drop Attachments:** Interactively support drag-over zones or folder clicks to append mock assets with system telemetry (file name, type, and size indicators).

### 5. Progress Reporting & Analytics Dashboard
*   **Implementation Status:** **Fully Implemented & Interactive**
*   **Description:** A dedicated statistics dashboard parses active workloads to present:
    *   Task distribution metrics by Status and Priority level utilizing responsive charts built with **Recharts**.
    *   Dynamic Calculation of **SLA Compliance Rate** and Average Activity metrics.
    *   **Data Export Suite:** Download the live database records instantly as raw **JSON** or parsed **CSV** files for third-party auditing tools.

### 6. Secure Authentication & Session Switching (Simulation)
*   **Implementation Status:** **Fully Implemented & Interactive**
*   **Description:** A robust user registration and profile switching module is located directly on the right side of the workspace dashboard. 
*   **Simulated Authentication:** Users can seamlessly change active session identities or register fresh member accounts specifying roles. This dynamically updates client Authorization headers (`x-user-id`, `X-User-Role`) to evaluate server-side permission validation.

---

## 3. Technology Stack & Frameworks

The application utilizes a robust stack combining proven enterprise design and modern web build pipelines:

| Layer | Technology / Library | Role & Implementation Details |
| :--- | :--- | :--- |
| **Frontend Runtime** | **React 19** | Dynamic component rendering, functional hooks, states management, and lazy interactions. |
| **Build & Tooling** | **Vite + esbuild** | Superfast Hot Module Replacement (HMR) simulation, modern asset compilation, and optimized production bundling. |
| **Styling Engine** | **Tailwind CSS v4** | Clean custom design, negative space margins, interactive states, responsive grids, and typography styling. |
| **Icons Library** | **Lucide React** | Consistent and polished vector icons representing entities, tools, and actions. |
| **Visual Analytics** | **Recharts** | Interactive charts, canvas animations, and progress graphs. |
| **Enterprise Backend** | **Java SE (Servlet API)** | Implements REST Controllers (`TaskServlet`), JDBC transaction pooling, data filters, and access controls. |
| **Java DB Connector** | **MySQL JDBC Connector (v8.0)**| Handles SQL transaction states, prepared statements mapping, database class registry, and Hikari pooling. |
| **Web Host Proxy** | **Node.js (Express)** | Serves as mock local host and telemetry logger, generating server-log streams that mock real Tomcat Tomcat server loops. |
| **Local Memory Store** | **JSON DB Engine** | Safely persists local tasks, member states, remarks, and system audit logs in the server folder environment for ongoing sessions. |

---

## 4. Systems Architecture Diagrams

Below is the conceptual full-stack data flow architecture of Amdox Tasks:

```text
  +------------------------------------------------------------------------+
  |                             APPLICATIONS LAYER                         |
  |             React 19 client & Interactive Sprint Board (Vite)          |
  +------------------------------------+-----------------------------------+
                                       |
                   HTTP Request Tunnel | JSON payloads & Headers
                                       v
  +------------------------------------------------------------------------+
  |                              GATEWAY LAYER                             |
  |          Express Proxy & Real-Time Tomcat Logging Simulator            |
  +------------------------------------+-----------------------------------+
                                       |
                     Subprocesses / DB v JDBC Drivers
  +------------------------------------------------------------------------+
  |                          ENTERPRISE JAVA BACKEND                       |
  |     Servlet REST Routing  ->   TaskDAO Layer  ->   Database Config     |
  +------------------------------------+-----------------------------------+
                                       |
                   Java PreparedStatement (SQL)
                                       v
  +------------------------------------------------------------------------+
  |                           PERSISTENT STORAGE                           |
  |           MySQL Database Schema (Normalized Users, Tasks & Logs)       |
  +------------------------------------------------------------------------+
```

---

## 5. Normalized MySQL Database Schema

The core repository contains standard MySQL configurations representing the five key relational tables. This schema ensures third-normal-form (3NF) sanitization and foreign key constraints:

```sql
-- Core MySQL Database Setup Script
CREATE DATABASE IF NOT EXISTS amdox_tasks;
USE amdox_tasks;

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Viewer',
    avatar_color VARCHAR(10) NOT NULL DEFAULT '#6366f1'
);

-- 2. Tasks Table
CREATE TABLE tasks (
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
CREATE TABLE comments (
    id VARCHAR(50) PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Attachments Table
CREATE TABLE attachments (
    id VARCHAR(50) PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100) NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 5. Activity Logs Table
CREATE TABLE activity_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    target_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. How to Run Locally

### Prerequisites
1.  **Node.js (v18+)** installed.
2.  **Java JDK (11 or newer)** and **Apache Tomcat (9+)** for compiling Java sources.
3.  **MySQL Server** running database instance.

### Setup and Running Instructions
1.  **Extract Project Files:** Ensure all workspace logs, directories and configs have been exported.
2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```
3.  **Spin Up Local Dev Server:**
    ```bash
    npm run dev
    ```
    This launches the local node development workspace, routing port `3000` with proxy channels mapping endpoints.
4.  **Connect Database Pipeline:** 
    Configure the MySQL details inside `DatabaseConfig.java` and load the initial relational arrays using `schema.sql` inside your MySQL command terminal.
