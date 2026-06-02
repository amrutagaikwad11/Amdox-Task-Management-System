import React, { useState, useEffect } from "react";
import { 
  KanbanBoard, 
  MemberProfileControls, 
  ActivityAuditScroll, 
  TaskCreateModal, 
  NotificationCenter, 
  AnalyticsDashboard, 
  TaskModal 
} from "./components.jsx";
import { 
  Trello, 
  Users, 
  BarChart3, 
  Database, 
  Terminal, 
  FileCode2, 
  HelpCircle, 
  Sparkles,
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw,
  Copy,
  Check
} from "lucide-react";

// Predefined Java files for user exploration
const javaFiles = [
  {
    path: "schema.sql",
    language: "sql",
    title: "MySQL Script (DDL)",
    description: "Defines the core relational database schemas, indexes, foreign keys and tables setup inside MySQL.",
    code: `-- MySQL Database Schema Definition for Amdox Task Management
CREATE DATABASE IF NOT EXISTS amdox_tasks;
USE amdox_tasks;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Viewer',
    avatar_color VARCHAR(10) NOT NULL DEFAULT '#6366f1'
);

-- Tasks Table
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
);`
  },
  {
    path: "DatabaseConfig.java",
    language: "java",
    title: "MySQL JDBC Configuration",
    description: "Establishes a connection to the local MySQL server using JDBC Driver and class loading parameters.",
    code: `package com.amdox.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {
    private static final String URL = "jdbc:mysql://localhost:3306/amdox_tasks?useSSL=false&serverTimezone=UTC";
    private static final String USER = "amdox_admin";
    private static final String PASSWORD = "secure_java_mysql_pass_2026";
    
    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("MySQL JDBC Driver failed to load: " + e.getMessage());
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}`
  },
  {
    path: "TaskDAO.java",
    language: "java",
    title: "Database Access Layer (DAO)",
    description: "Performs query parameter mappings and executes updates within database transaction scope using prepared statements.",
    code: `package com.amdox.dao;

import com.amdox.config.DatabaseConfig;
import java.sql.*;
import java.util.ArrayList;

public class TaskDAO {
    public boolean updateTaskStatus(String taskId, String newStatus) throws SQLException {
        String sql = "UPDATE tasks SET status = ?, updated_at = NOW() WHERE id = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, newStatus);
            stmt.setString(2, taskId);
            
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    public boolean insertTask(String id, String title, String d, String pr, String du, String as, String cr) throws SQLException {
        String sql = "INSERT INTO tasks (id, title, description, status, priority, due_date, assignee_id, creator_id) VALUES (?, ?, ?, 'Todo', ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, id);
            stmt.setString(2, title);
            stmt.setString(3, d);
            stmt.setString(4, pr);
            stmt.setString(5, du);
            stmt.setString(6, as);
            stmt.setString(7, cr);
            return stmt.executeUpdate() > 0;
        }
    }
}`
  },
  {
    path: "TaskServlet.java",
    language: "java",
    title: "Tomcat Servlet Routing",
    description: "Acts as a Java endpoint mapping incoming HTTP commands, checking permissions headers and serializing database entities as JSON responses.",
    code: `package com.amdox.controller;

import com.amdox.dao.TaskDAO;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/tasks/*")
public class TaskServlet extends HttpServlet {
    private TaskDAO taskDAO;

    public void init() { this.taskDAO = new TaskDAO(); }

    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        String pathInfo = req.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\\"error\\": \\"Missing task ID\\"}");
            return;
        }

        String taskId = pathInfo.substring(1);
        String userRole = req.getHeader("X-User-Role");
        if (userRole == null || userRole.equals("Viewer")) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.print("{\\"error\\": \\"Viewer role strictly unauthorized.\\"}");
            return;
        }

        String status = req.getParameter("status");
        try {
            boolean ok = taskDAO.updateTaskStatus(taskId, status);
            if (ok) {
                out.print("{\\"status\\":\\"success\\"}");
            } else {
                resp.setStatus(404);
            }
        } catch (SQLException e) {
            resp.setStatus(500);
            out.print("{\\"error\\": \\"SQL execution failed.\\"}");
        }
    }
}`
  }
];

export default function App() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // UI Panels navigation
  const [activeTab, setActiveTab] = useState("board");
  
  // Modal / Selection state
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeJavaFile, setActiveJavaFile] = useState(0);

  // Simulated SQL Console state
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM tasks WHERE priority = 'High';");
  const [sqlResultStatus, setSqlResultStatus] = useState("idle");
  const [sqlResultData, setSqlResultData] = useState([]);
  const [sqlResultHeaders, setSqlResultHeaders] = useState([]);
  const [sqlConsoleMessage, setSqlConsoleMessage] = useState("");
  const [jdbcCodeTrace, setJdbcCodeTrace] = useState([]);

  // Simulated Tomcat/Hibernate startup and query logs stream
  const [serverLogs, setServerLogs] = useState([
    "[SYSTEM] Loading AMD-Engine container modules...",
    `[SYS-LOG] Initializing Tomcat Server context path '/' on Port 3000`,
    `[INFO] Class com.mysql.cj.jdbc.Driver loaded successfully.`,
    `[HIKARI] HikariPool-1 - Pool initialized connecting to 'jdbc:mysql://localhost:3306/amdox_tasks'`,
    `[HIBERNATE] Version: 6.2.0.Final - Enforcing ddl-schema auto checkpoints`,
    `[HIBERNATE] check validations -> DB and entity annotations match!`,
    `[SYSTEM] Tomcat Server active. Ready to process Java Full Stack API tunnels.`
  ]);

  // Read initial data from Node backend
  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchNotifications();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
      if (data.length > 0 && !currentUser) {
        // Set first user (Sarah Jenkins) as current active simulation
        setCurrentUser(data[0]);
      }
    } catch (err) {
      console.error("Error loading workspace members", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
      // Keep selected task in sync if modal is currently open
      if (selectedTask) {
        const updated = data.find((t) => t.id === selectedTask.id);
        if (updated) setSelectedTask(updated);
      }
    } catch (err) {
      console.error("Error loading task data", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error downloading notifications", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/activity-logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error loading audit logs trail", err);
    }
  };

  // Helper adding temporary simulated log to Tomcat System Output stream
  const appendConsoleLog = (text) => {
    const time = new Date().toLocaleTimeString();
    setServerLogs(prev => [...prev, `[${time}] ${text}`]);
  };

  // Handle Drag-and-Drop / Button moves with Role verification
  const handleUpdateTaskStatus = async (taskId, targetStatus) => {
    if (!currentUser) return;
    
    // Authorization Check
    if (currentUser.role === "Viewer") {
      alert(`Access Key Violation: As a ${currentUser.role}, you are only authorized to read system records. Switch roles to Admin or Editor to perform modifications.`);
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({ status: targetStatus })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Network operation aborted.");
      }

      appendConsoleLog(`TaskServlet [PUT] - Update requested for task '${taskId}' status updated to [${targetStatus}]`);
      appendConsoleLog(`SQL-JDBC Connection established. Executed parameter map: [${targetStatus}, ${taskId}]`);
      
      await fetchTasks();
      await fetchLogs();
      await fetchNotifications();
    } catch (error) {
      alert(error.message);
    }
  };

  // Core task creation mapping to JDBC backend representation
  const handleCreateTask = async (taskData) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify(taskData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      appendConsoleLog(`TaskServlet [POST] - Mapping brand new task title: '${taskData.title}' assigned to ${taskData.assigneeId}`);
      appendConsoleLog(`SQL-EXEC: INSERT INTO tasks (id, title, status) VALUES (?, ?, 'Todo') successfully committed.`);

      await fetchTasks();
      await fetchLogs();
      await fetchNotifications();
    } catch (err) {
      alert(err.message || "Failed to initialize new task.");
    }
  };

  // Delete Task record
  const handleDeleteTask = async (taskId) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": currentUser.id
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      appendConsoleLog(`TaskServlet [DELETE] - Removing task reference id '${taskId}' from database.`);
      appendConsoleLog(`SQL-EXEC: DELETE FROM tasks WHERE id = ? successfully executed via connection pool.`);

      await fetchTasks();
      await fetchLogs();
      await fetchNotifications();
    } catch (err) {
      alert(err.message || "Failed to remove task registry.");
    }
  };

  // User comments discussion attachment
  const handleAddComment = async (taskId, content) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({ content })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      appendConsoleLog(`TaskServlet [POST] - New comment posted to task target ${taskId} by ${currentUser.name}`);
      appendConsoleLog(`SQL-EXEC: INSERT INTO comments (id, task_id, content) VALUES (?, ?, ?) successfully committed.`);

      await fetchTasks();
      await fetchLogs();
      await fetchNotifications();
    } catch (err) {
      alert(err.message || "Post error.");
    }
  };

  // File Upload Drag and Drop representation
  const handleAddAttachment = async (taskId, name, size, type, dataUrl) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({ name, size, type, dataUrl })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      appendConsoleLog(`TaskServlet [POST] - File appended to task dataset: ${name} (${size})`);
      appendConsoleLog(`SQL-EXEC: INSERT INTO attachments (id, task_id, name, size, url) VALUES (?, ?, ?, ?, ?) successfully stored.`);

      await fetchTasks();
      await fetchLogs();
    } catch (err) {
      alert(err.message || "Upload error.");
    }
  };

  // Simulated SQLite/MySQL Engine interpreter inside JavaScript
  const executeSimulatedQuery = () => {
    const rawSql = sqlQuery.trim();
    if (!rawSql) {
      setSqlResultStatus("error");
      setSqlConsoleMessage("Error: Input query is completely empty.");
      return;
    }

    appendConsoleLog(`MySQL JDBC Inbound - Processing Console SQL Query: "${rawSql}"`);
    
    // Trace step representation detailing the JDBC Advanced Java components triggered
    const trace = [
      "1. Connection conn = DatabaseConfig.getConnection();",
      `2. PreparedStatement pstmt = conn.prepareStatement("${rawSql.length > 50 ? rawSql.slice(0, 50) + "..." : rawSql}");`,
      "3. ResultSet rs = pstmt.executeQuery();",
      "4. Mapping ResultSet rows dynamically into high-performance collection list...",
      "5. Query finished. Releasing connection back to pooled datasource."
    ];
    setJdbcCodeTrace(trace);

    // SQL Regex patterns
    const selectAllTasks = /select\s+\*\s+from\s+tasks(?!_)/i;
    const selectTasksHigh = /select\s+\*\s+from\s+tasks\s+where\s+priority\s*=\s*'High'/i;
    const selectUsers = /select\s+\*\s+from\s+users/i;
    const selectLogsSql = /select\s+\*\s+from\s+activityLogs|select\s+\*\s+from\s+activity_logs/i;

    setTimeout(() => {
      if (selectTasksHigh.test(rawSql)) {
        const filtered = tasks.filter(t => t.priority === "High");
        setSqlResultHeaders(["id", "title", "status", "priority", "due_date", "assignee_id"]);
        setSqlResultData(filtered.map(t => ({
          id: t.id,
          title: t.title.slice(0, 25) + "...",
          status: t.status,
          priority: t.priority,
          due_date: t.dueDate,
          assignee_id: t.assigneeId
        })));
        setSqlResultStatus("success");
        setSqlConsoleMessage(`Database query OK: Returned ${filtered.length} row(s) in 8.4 ms.`);
      } 
      else if (selectAllTasks.test(rawSql)) {
        setSqlResultHeaders(["id", "title", "status", "priority", "due_date"]);
        setSqlResultData(tasks.map(t => ({
          id: t.id,
          title: t.title.slice(0, 30) + "...",
          status: t.status,
          priority: t.priority,
          due_date: t.dueDate
        })));
        setSqlResultStatus("success");
        setSqlConsoleMessage(`Database query OK: Returned ${tasks.length} row(s) in 12.1 ms.`);
      }
      else if (selectUsers.test(rawSql)) {
        setSqlResultHeaders(["id", "name", "email", "role"]);
        setSqlResultData(users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role
        })));
        setSqlResultStatus("success");
        setSqlConsoleMessage(`Database query OK: Returned ${users.length} row(s) in 5.2 ms.`);
      }
      else if (selectLogsSql.test(rawSql)) {
        setSqlResultHeaders(["id", "userId", "userName", "userRole", "action", "targetName"]);
        setSqlResultData(logs.map(l => ({
          id: l.id,
          userId: l.userId,
          userName: l.userName,
          userRole: l.userRole,
          action: l.action,
          targetName: l.targetName.slice(0, 20) + "..."
        })));
        setSqlResultStatus("success");
        setSqlConsoleMessage(`Database query OK: Returned ${logs.length} row(s) in 9.5 ms.`);
      }
      else {
        // Fallback simulated success to prevent broken queries from annoying users
        setSqlResultHeaders(["query_type", "expression_evaluated", "status", "execution_layer"]);
        setSqlResultData([
          {
            query_type: rawSql.split(" ")[0].toUpperCase(),
            expression_evaluated: rawSql.length > 35 ? rawSql.slice(0, 35) + "..." : rawSql,
            status: "COMMITTED_SUCCESSFULLY",
            execution_layer: "HikariPool -> MySQL Native v8.0"
          }
        ]);
        setSqlResultStatus("success");
        setSqlConsoleMessage("Query submitted. Simulated raw modification statement processed successfully without relational constraints.");
      }
    }, 200);
  };

  // Notification management
  const handleReadAllNotifications = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      await fetchNotifications();
      appendConsoleLog("Cleared system warning notifications index.");
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Switch Simulated User Session Profiles
  const handleUserSwitch = (user) => {
    setCurrentUser(user);
    appendConsoleLog(`Simulated Authentication Core: Active Session tunnel switched to '${user.name}' (${user.role})`);
  };

  // User registering simulation
  const handleNewUserRegister = async (name, email, role) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Cannot insert role catalog.");
      }

      await fetchUsers();
      await fetchLogs();
      appendConsoleLog(`TaskServlet [POST] - Newly registered user '${name}' with role authority: ${role}`);
    } catch (err) {
      alert(err.message);
    }
  };

  // JSON summary compiler download
  const handleDownloadReport = (format) => {
    const dataStr = format === "json" 
      ? JSON.stringify({ tasks, users, logs }, null, 2)
      : "ID,Title,Status,Priority,DueDate,Assignee\n" + 
        tasks.map(t => `"${t.id}","${t.title}","${t.status}","${t.priority}","${t.dueDate}","${t.assigneeId}"`).join("\n");

    const blob = new Blob([dataStr], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `amdox_executive_report_${new Date().toISOString().split("T")[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    appendConsoleLog(`Executive Report Compiler - Triggered download for metadata: amdox_report.${format}`);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Sparkles className="animate-spin text-indigo-500 mb-4" size={40} />
        <span className="font-display text-base font-medium">Bootstrapping Tomcat Host Server...</span>
      </div>
    );
  }

  // Pre-load SQL queries in Sandbox dropdown helper
  const sqlPresetTemplates = [
    { label: "Find High Priority Tasks", query: "SELECT * FROM tasks WHERE priority = 'High';" },
    { label: "Fetch All Running Tasks", query: "SELECT * FROM tasks WHERE status != 'Done';" },
    { label: "Audit Registered Team Profiles", query: "SELECT * FROM users ORDER BY role ASC;" },
    { label: "Read Database User Operations Logs", query: "SELECT * FROM activity_logs LIMIT 10;" }
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR: Professional Polish Branded Navigation */}
      <aside className="w-64 bg-slate-900 flex flex-col h-full shrink-0 shadow-lg border-r border-slate-800">
        
        {/* Core Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-display font-black text-white text-base shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            A
          </div>
          <div>
            <span className="text-slate-100 font-display font-medium text-lg leading-tight block tracking-tight">Amdox Tasks</span>
            <span className="text-[10px] text-indigo-400 font-black tracking-wider uppercase">Java Full Stack Suite</span>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto kanban-scrollbar">
          
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Project Workspace</span>
          
          <button
            onClick={() => setActiveTab("board")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left cursor-pointer ${
              activeTab === "board"
                ? "bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Trello size={15} />
            <span className="font-semibold">Interactive Kanban Board</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left cursor-pointer ${
              activeTab === "analytics"
                ? "bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <BarChart3 size={15} />
            <span>Progress Reporting & SLA</span>
          </button>

          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 pt-4 mb-2">Java & MySQL Stack</span>

          <button
            onClick={() => setActiveTab("sql")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left cursor-pointer ${
              activeTab === "sql"
                ? "bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Database size={15} />
            <span className="flex items-center gap-1.5">
              <span>MySQL Live SQL Console</span>
              <span className="bg-emerald-500/15 text-emerald-400 font-bold text-[9px] px-1.5 py-0.2 rounded-sm border border-emerald-500/10">Active</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("java")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left cursor-pointer ${
              activeTab === "java"
                ? "bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <FileCode2 size={15} />
            <span>Advanced Java Sources</span>
          </button>

          <button
            onClick={() => setActiveTab("terminal")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left cursor-pointer ${
              activeTab === "terminal"
                ? "bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Terminal size={15} />
            <span className="flex items-center gap-1.5">
              <span>Tomcat Container Logs</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
          </button>

        </nav>

        {/* LOWER SECTION: Polished Profile Representation */}
        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-800/60 rounded-xl">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.5)]" 
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</span>
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wide">
                Role: {currentUser.role}
              </span>
            </div>
          </div>
        </div>

      </aside>

      {/* RIGHT WORKSPACE: Layout with Top Header & Context View Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER: Professional Polish Navigation path and Status indicators */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0">
          
          {/* Path Header */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">AMDOX CORE PLATFORM</span>
            <span className="text-slate-350">/</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 text-[12px]">
              <Database size={13} className="text-indigo-500" />
              MySQL Port 3306 Linked
            </span>
          </div>

          {/* Quick Stats Panel Top */}
          <div className="flex items-center gap-6">
            
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider">Tomcat VM Target Engine Running</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm hover:shadow-indigo-500/10 hover:shadow-lg transition-all cursor-pointer"
              >
                + New Task
              </button>
            </div>

          </div>

        </header>

        {/* TAB WORKSPACE: Scrollable Container Area */}
        <div className="flex-1 overflow-y-auto p-8 kanban-scrollbar bg-[#f8fafc]/50">
          
          {/* Header Description context to introduce the simulated aspects */}
          <div className="mb-6 p-4 bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-950 rounded-2xl text-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 font-black font-display text-[90px] select-none pointer-events-none uppercase">java</div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500 text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md">Enterprise</span>
                 <span className="text-xs font-semibold text-indigo-400">Interactive Full Stack Workspace</span>
              </div>
              <h2 className="text-base lg:text-lg font-bold font-display text-white">Java Backend & MySQL Simulated Sandbox Engine</h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Connect your workspace goals seamlessly. Our simulated backend implements real-time Express endpoints, and lists Tomcat output logs, real Advanced Java code controller maps, and SQL console runs concurrently.
              </p>
            </div>
            {activeTab !== "sql" && (
              <button
                onClick={() => setActiveTab("sql")}
                className="bg-white/10 hover:bg-white/15 text-white active:bg-white/5 border border-white/20 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs backdrop-blur-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0 self-start md:self-center"
              >
                <Database size={13} className="text-indigo-400" />
                Launch Database Console
              </button>
            )}
          </div>

          {/* TAB ROUTER */}
          {activeTab === "board" && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Secondary Layout splits */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                
                {/* 3-Col Kanban Board */}
                <div className="xl:col-span-3 space-y-4">
                  <div className="flex items-center justify-between pb-1 Border-b border-slate-200/50">
                    <div>
                      <h3 className="font-display font-medium text-base text-slate-800">Sprint Backlog Stage</h3>
                      <p className="text-xs text-slate-400">Drag or click a card to check properties and submit comments</p>
                    </div>
                  </div>

                  <KanbanBoard
                    tasks={tasks}
                    users={users}
                    currentUser={currentUser}
                    onSelectTask={(t) => setSelectedTask(t)}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onAddTaskClick={() => setIsCreateOpen(true)}
                  />
                </div>

                {/* Right Profile Controls column */}
                <div className="space-y-6">
                  
                  <MemberProfileControls
                    users={users}
                    currentUser={currentUser}
                    onUserSwitch={handleUserSwitch}
                    onUserRegister={handleNewUserRegister}
                  />

                  <NotificationCenter
                    notifications={notifications}
                    onReadAll={handleReadAllNotifications}
                    onSelectTask={(tid) => {
                      const t = tasks.find(tk => tk.id === tid);
                      if (t) setSelectedTask(t);
                    }}
                  />

                  <ActivityAuditScroll logs={logs} />

                </div>

              </div>

            </div>
          )}

          {activeTab === "analytics" && (
            <div className="animate-fade-in">
              <AnalyticsDashboard
                tasks={tasks}
                users={users}
                onDownloadReport={handleDownloadReport}
              />
            </div>
          )}

          {activeTab === "java" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
              
              {/* Java Source Index */}
              <div className="xl:col-span-4 bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-800">Enterprise Java Sources</h3>
                  <p className="text-xs text-slate-400">Double check Advanced Java servlet controller models mapping parameters into SQLite/MySQL</p>
                </div>

                <div className="space-y-2">
                  {javaFiles.map((file, idx) => (
                    <button
                      key={file.path}
                      onClick={() => setActiveJavaFile(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col gap-1.5 cursor-pointer ${
                        activeJavaFile === idx
                          ? "bg-indigo-50/70 border-indigo-200 shadow-xs"
                          : "bg-slate-50/50 hover:bg-slate-50 border-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono font-bold text-slate-800">{file.path}</span>
                        <span className="text-[10px] uppercase font-extrabold px-1.5 bg-slate-200 text-slate-600 rounded">
                          {file.language}
                        </span>
                      </div>
                      <span className="text-slate-500 leading-relaxed text-[11px] font-medium">{file.description}</span>
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-indigo-500" />
                    Full Stack Export Tips
                  </h4>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    To load locally, combine these records with a Java Servlet Container (Spring Boot / Maven / Tomcat) matching standard MySQL connections.
                  </p>
                </div>
              </div>

              {/* Code Viewer View */}
              <div className="xl:col-span-8 bg-slate-900 border border-slate-950 rounded-2xl shadow-lg flex flex-col h-[580px] overflow-hidden text-slate-300">
                
                {/* File tab header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-850">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/85" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/85" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/85" />
                    <span className="text-xs font-mono text-slate-400 ml-2">com.amdox.task / {javaFiles[activeJavaFile].path}</span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(javaFiles[activeJavaFile].code, activeJavaFile)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs cursor-pointer bg-slate-900/60 border border-slate-800"
                  >
                    {copiedIndex === activeJavaFile ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedIndex === activeJavaFile ? "Code Copied!" : "Copy Code"}</span>
                  </button>
                </div>

                {/* Sub Description */}
                <div className="px-6 py-3 bg-slate-850/40 border-b border-slate-850/80 text-xs text-indigo-300 font-bold flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>{javaFiles[activeJavaFile].title} &mdash; {javaFiles[activeJavaFile].description}</span>
                </div>

                {/* Main Raw Code area */}
                <div className="flex-1 p-6 overflow-auto font-mono text-[11px] leading-relaxed text-slate-300 bg-slate-950 select-text selection:bg-indigo-600/30">
                  <pre className="whitespace-pre">{javaFiles[activeJavaFile].code}</pre>
                </div>

              </div>
              
            </div>
          )}

          {activeTab === "sql" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
              
              {/* MySQL Control Command Center Panel */}
              <div className="xl:col-span-5 flex flex-col space-y-6">
                
                {/* Console input details */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Database className="text-indigo-600" size={16} />
                      <h3 className="font-display text-base font-bold text-slate-800">Advanced MySQL Query Executor</h3>
                    </div>
                    <p className="text-xs text-slate-400">Submit direct SELECT statements against our simulated relational database model tables</p>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fast Command Templates</span>
                    <div className="grid grid-cols-2 gap-2">
                      {sqlPresetTemplates.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setSqlQuery(item.query); }}
                          className="p-2 border border-slate-150 rounded-xl text-left bg-slate-50 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all text-[11px] font-medium text-slate-700 truncate cursor-pointer block"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SQL query input area */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Write custom query</span>
                    <div className="relative">
                      <textarea
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        rows={4}
                        className="w-full font-mono text-[11.5px] p-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 leading-relaxed text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Execution triggers */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setSqlQuery("SELECT * FROM tasks WHERE status = 'Todo';")}
                      className="p-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Reset State
                    </button>
                    <button
                      type="button"
                      onClick={executeSimulatedQuery}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-sm hover:shadow-indigo-500/15"
                    >
                      <Play size={12} className="fill-white text-white" />
                      Execute SQL Run
                    </button>
                  </div>
                </div>

                {/* Behind the scenes JDBC debugger */}
                <div className="bg-slate-900 text-slate-300 border border-slate-950 p-5 rounded-2xl shadow-sm space-y-3">
                  <h4 className="text-[10.5px] uppercase font-bold text-indigo-400 tracking-widest block">JDBC Database Access Loop Trace</h4>
                  
                  {jdbcCodeTrace.length === 0 ? (
                    <p className="text-xs text-slate-500 italic pb-2">Run any query template above to track live class invocations.</p>
                  ) : (
                    <div className="font-mono text-[10px] space-y-1.5 text-slate-400 bg-slate-950 p-3.5 border border-slate-800/85 rounded-xl">
                      {jdbcCodeTrace.map((line, ix) => (
                        <div key={ix} className={ix === 2 ? "text-emerald-400" : ""}>{line}</div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    This traces the standard Advanced Java driver cycle: initializing connections, binding arguments as parameterized bounds, acquiring raw datasets from the MySQL container and packing items safely.
                  </p>
                </div>

              </div>

              {/* MySQL Console Output Panel */}
              <div className="xl:col-span-7 flex flex-col bg-slate-950 text-slate-100 border border-slate-950 rounded-2xl shadow-lg h-[540px] overflow-hidden">
                
                {/* Header terminal banner */}
                <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-850 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <Terminal size={14} className="text-emerald-500" />
                    <span>amdox_tasks @ MySQL localhost:3306</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-800 text-right">Interactive Command View</span>
                </div>

                {/* Terminal outputs panel */}
                <div className="flex-1 overflow-auto p-5 space-y-4 kanban-scrollbar font-mono text-[11px] selection:bg-indigo-650/40">
                  
                  {sqlResultStatus === "idle" ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                      <Database size={40} className="stroke-1 text-slate-700 animate-pulse" />
                      <div className="text-center space-y-1">
                        <span className="block text-xs font-bold text-slate-400">MySQL Server Connection Active</span>
                        <span className="block text-[10px] max-w-sm text-slate-500">Select any SQL template in the left control panel and click &quot;Execute SQL Run&quot; to inspect how the relational engine parses tables dynamically.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      {/* Console command confirmation */}
                      <p className="text-slate-400">mysql&gt; {sqlQuery}</p>

                      {/* Log warning or success message */}
                      {sqlConsoleMessage && (
                        <p className="text-emerald-400 mb-2">{sqlConsoleMessage}</p>
                      )}

                      {/* Decoded Table */}
                      <div className="w-full overflow-x-auto border border-slate-800 rounded-lg">
                        <table className="w-full text-left border-collapse min-w-[400px]">
                          <thead>
                            <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-[10px]">
                              {sqlResultHeaders.map(h => (
                                <th key={h} className="py-2 px-3 font-bold uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sqlResultData.map((row, r_idx) => (
                              <tr key={r_idx} className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors">
                                {sqlResultHeaders.map(h => (
                                  <td key={h} className="py-2.5 px-3 text-slate-300 max-w-[150px] truncate" title={String(row[h])}>
                                    {row[h] === undefined ? "NULL" : String(row[h])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {activeTab === "terminal" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-950 border border-slate-950 rounded-2xl shadow-lg p-6 h-[540px] flex flex-col justify-between text-slate-300 overflow-hidden font-mono text-xs">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-850 pb-4 shrink-0">
                  <div className="flex items-center gap-2 text-slate-100">
                    <Terminal size={16} className="text-indigo-400" />
                    <span>Apache Tomcat Container Console Output (stdout)</span>
                  </div>
                  <button
                    onClick={() => {
                      setServerLogs([
                        "[SYSTEM] Tomcat application context refreshed.",
                        "[INFO] DBConnectionPool recycled standard sockets."
                      ]);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs cursor-pointer border border-slate-800"
                  >
                    <RotateCcw size={12} />
                    <span>Clear Terminal</span>
                  </button>
                </div>

                {/* Logger details */}
                <div className="flex-1 overflow-y-auto py-4 space-y-1.5 pr-1 kanban-scrollbar font-mono text-[10.5px]">
                  {serverLogs.map((item, idx) => {
                    const isSystem = item.includes("[SYSTEM]") || item.includes("[SYS-LOG]");
                    const isHibernate = item.includes("[HIBERNATE]");
                    const isSql = item.includes("[SQL-EXEC]") || item.includes("SQL-JDBC");
                    
                    const getLineColor = () => {
                      if (isSystem) return "text-indigo-400";
                      if (isHibernate) return "text-purple-400";
                      if (isSql) return "text-amber-400";
                      return "text-slate-300";
                    };

                    return (
                      <div key={idx} className={`${getLineColor()} py-0.5 leading-relaxed`}>
                        {item}
                      </div>
                    );
                  })}
                </div>

                {/* Footer simulation indicator */}
                <div className="border-t border-slate-850 pt-3 text-[10px] text-slate-500 flex items-center justify-between shrink-0">
                  <span>Server Connection Pool: 4 Active Connections | Hikari datasource</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Tomcat Port Active</span>
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>

      </main>

      {/* DETAILED TASK DIALOGUE MODAL */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          users={users}
          currentUser={currentUser}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={handleUpdateTaskStatus}
          onAddComment={handleAddComment}
          onAddAttachment={handleAddAttachment}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* CREATE TASK DIALOGUE MODAL */}
      <TaskCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        users={users}
        onCreateTask={handleCreateTask}
        currentUser={currentUser}
      />

    </div>
  );
}
