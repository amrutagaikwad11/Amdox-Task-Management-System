import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Middleware to parse body
app.use(express.json({ limit: "50mb" }));

const defaultUsers = [
  { id: "usr-1", name: "Sarah Jenkins", email: "sarah@amdox.com", role: "Admin", avatarColor: "#6366f1" }, // Indigo
  { id: "usr-2", name: "David Chen", email: "david@amdox.com", role: "Editor", avatarColor: "#10b981" }, // Emerald
  { id: "usr-3", name: "Elena Rostova", email: "elena@amdox.com", role: "Viewer", avatarColor: "#f59e0b" }, // Amber
  { id: "usr-4", name: "Marcus Aurelius", email: "marcus@amdox.com", role: "Editor", avatarColor: "#ec4899" }, // Pink
];

const defaultTasks = [
  {
    id: "tsk-1",
    title: "Formulate Core System Architectural Framework",
    description: "Design and document the core service framework. This requires establishing secure endpoints, checking TLS layers, and ensuring robust failovers.",
    status: "Done",
    priority: "Critical",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days ago
    assigneeId: "usr-2",
    creatorId: "usr-1",
    comments: [
      {
        id: "com-1",
        taskId: "tsk-1",
        userId: "usr-1",
        userName: "Sarah Jenkins",
        userColor: "#6366f1",
        content: "Awesome job finishing the core framework document! Please attach the architecture PDF for review.",
        createdAt: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "com-2",
        taskId: "tsk-1",
        userId: "usr-2",
        userName: "David Chen",
        userColor: "#10b981",
        content: "Attached the diagram files as requested. Architecture has been successfully verified against performance benchmarks.",
        createdAt: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
      }
    ],
    attachments: [
      {
        id: "att-1",
        name: "architecture_v2_core.pdf",
        size: "3.4 MB",
        type: "application/pdf",
        url: "#",
        uploadedAt: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
        uploadedBy: "David Chen"
      }
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tsk-2",
    title: "Refactor API Gateway Authenticator Middleware",
    description: "Standardize session checking, integrate JWT validation with precise expiration limits, and block brute-force attempts on public pathways.",
    status: "In_Review",
    priority: "High",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // tomorrow
    assigneeId: "usr-1",
    creatorId: "usr-1",
    comments: [
      {
        id: "com-3",
        taskId: "tsk-2",
        userId: "usr-4",
        userName: "Marcus Aurelius",
        userColor: "#ec4899",
        content: "Finished refactoring the auth filter. Sarah, please take a look at the middleware implementation.",
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      }
    ],
    attachments: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tsk-3",
    title: "Develop Kanban Interactive Drag-and-Drop View",
    description: "Implement interactive task boards using Tailwind CSS. Must display columns for task lifecycle and show full visual feedback on mouse and touch gestures.",
    status: "In_Progress",
    priority: "Medium",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days from now
    assigneeId: "usr-4",
    creatorId: "usr-2",
    comments: [],
    attachments: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tsk-4",
    title: "Generate Complete Executive Summary Report Modules",
    description: "Prepare professional PDF and spreadsheet compilation algorithms, compiling all task states, metrics, and workload data ready for director overview.",
    status: "Todo",
    priority: "High",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 day overdue
    assigneeId: "usr-3",
    creatorId: "usr-1",
    comments: [],
    attachments: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tsk-5",
    title: "Fix SSL Handshake Outbound Protocol Failures",
    description: "Troubleshoot connectivity anomalies with key external partners. Standardize cipher suites, enforce TLS 1.3, and renew domain cert key chains.",
    status: "Todo",
    priority: "Critical",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assigneeId: "usr-2",
    creatorId: "usr-1",
    comments: [],
    attachments: [],
    createdAt: new Date(Date.now()).toISOString(),
    updatedAt: new Date(Date.now()).toISOString(),
  },
  {
    id: "tsk-6",
    title: "Benchmark High Intensity Pipeline Stress Run",
    description: "Execute telemetry measurements with 10k simulations. Chart latencies, identify lock contentions, and suggest database pool configurations.",
    status: "Todo",
    priority: "Low",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assigneeId: "usr-4",
    creatorId: "usr-2",
    comments: [],
    attachments: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const defaultNotifications = [
  {
    id: "not-1",
    title: "New Task Assigned",
    message: "David Chen assigned 'Fix SSL Handshake Outbound Protocol Failures' to you.",
    type: "warning",
    createdAt: new Date().toISOString(),
    read: false,
    taskId: "tsk-5"
  },
  {
    id: "not-2",
    title: "Deadline Approaching",
    message: "Task 'Refactor API Gateway Authenticator Middleware' is due tomorrow.",
    type: "info",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    taskId: "tsk-2"
  },
  {
    id: "not-3",
    title: "Task Overdue Notice",
    message: "Task 'Generate Complete Executive Summary Report Modules' is past its scheduled deadline.",
    type: "danger",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    read: false,
    taskId: "tsk-4"
  }
];

const defaultLogs = [
  {
    id: "log-1",
    userId: "usr-1",
    userName: "Sarah Jenkins",
    userRole: "Admin",
    action: "created",
    targetType: "task",
    targetId: "tsk-1",
    targetName: "Formulate Core System Architectural Framework",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "log-2",
    userId: "usr-2",
    userName: "David Chen",
    userRole: "Editor",
    action: "completed",
    targetType: "task",
    targetId: "tsk-1",
    targetName: "Formulate Core System Architectural Framework",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "log-3",
    userId: "usr-1",
    userName: "Sarah Jenkins",
    userRole: "Admin",
    action: "commented on",
    targetType: "comment",
    targetId: "com-1",
    targetName: "Formulate Core System Architectural Framework",
    createdAt: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString(),
  }
];

// Helper functions for reading/writing DB file
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb = {
        users: defaultUsers,
        tasks: defaultTasks,
        notifications: defaultNotifications,
        activityLogs: defaultLogs
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file, using fallback template data", error);
    return {
      users: defaultUsers,
      tasks: defaultTasks,
      notifications: defaultNotifications,
      activityLogs: defaultLogs
    };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to commit database write", error);
  }
}

// User role permission middleware
const getAuthDetails = (req) => {
  const actingUserId = req.headers["x-user-id"];
  if (!actingUserId) {
    return { user: null, error: "Missing required auth session indicator headers." };
  }
  const db = readDb();
  const matchedUser = db.users.find(u => u.id === actingUserId);
  if (!matchedUser) {
    return { user: null, error: "User profile was not discovered in the active workspace." };
  }
  return { user: matchedUser, error: null };
};

const checkPermissions = (allowedRoles) => {
  return (req, res, next) => {
    const { user, error } = getAuthDetails(req);
    if (error) {
      return res.status(401).json({ error });
    }
    if (user && !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: `Action forbidden. Your role is '${user.role}' but this operation requires one of [${allowedRoles.join(", ")}].`
      });
    }
    req.actingUser = user;
    next();
  };
};

// API Endpoints

// GET /api/users
app.get("/api/users", (req, res) => {
  const db = readDb();
  res.json(db.users);
});

// POST /api/users - Register new user
app.post("/api/users", (req, res) => {
  const { name, email, role, avatarColor } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: "Name, email, and role are required fields." });
  }

  const db = readDb();
  // Check if email already in use
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Email is already taken in this workspace." });
  }

  const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7", "#ef4444"];
  const randomColor = avatarColor || colors[Math.floor(Math.random() * colors.length)];

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    role: role,
    avatarColor: randomColor,
  };

  db.users.push(newUser);

  // Log activity
  const newLog = {
    id: `log-${Date.now()}`,
    userId: "usr-1", // Logged by default admin representing management
    userName: "Sarah Jenkins",
    userRole: "Admin",
    action: "added",
    targetType: "role",
    targetId: newUser.id,
    targetName: `${newUser.name} as ${newUser.role}`,
    createdAt: new Date().toISOString()
  };
  db.activityLogs.unshift(newLog);

  writeDb(db);
  res.status(201).json(newUser);
});

// GET /api/tasks
app.get("/api/tasks", (req, res) => {
  const db = readDb();
  res.json(db.tasks);
});

// POST /api/tasks (Admin or Editor)
app.post("/api/tasks", checkPermissions(["Admin", "Editor"]), (req, res) => {
  const { title, description, priority, dueDate, assigneeId } = req.body;
  const user = req.actingUser;

  if (!title || !priority || !dueDate || !assigneeId) {
    return res.status(400).json({ error: "Missing required file task properties: title, priority, dueDate, assigneeId." });
  }

  const db = readDb();
  const assignee = db.users.find(u => u.id === assigneeId);
  if (!assignee) {
    return res.status(400).json({ error: "Assignee user not found." });
  }

  const newTask = {
    id: `tsk-${Date.now()}`,
    title,
    description: description || "",
    status: "Todo",
    priority: priority,
    dueDate,
    assigneeId,
    creatorId: user.id,
    comments: [],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.tasks.unshift(newTask);

  // Log activity
  const newLog = {
    id: `log-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: "created",
    targetType: "task",
    targetId: newTask.id,
    targetName: newTask.title,
    createdAt: new Date().toISOString(),
  };
  db.activityLogs.unshift(newLog);

  // Trigger Notification for the Assignee
  if (assigneeId !== user.id) {
    const newNotif = {
      id: `not-${Date.now()}`,
      title: "New Task Assigned",
      message: `${user.name} assigned task '${newTask.title}' to you.`,
      type: "info",
      createdAt: new Date().toISOString(),
      read: false,
      taskId: newTask.id,
    };
    db.notifications.unshift(newNotif);
  }

  writeDb(db);
  res.status(201).json(newTask);
});

// PUT /api/tasks/:id (Admin or Editor)
app.put("/api/tasks/:id", checkPermissions(["Admin", "Editor"]), (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate, assigneeId } = req.body;
  const user = req.actingUser;

  const db = readDb();
  const taskIndex = db.tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found." });
  }

  const originalTask = db.tasks[taskIndex];
  
  // Update properties if provided
  let hasStatusChanged = false;

  if (title !== undefined) originalTask.title = title;
  if (description !== undefined) originalTask.description = description;
  if (priority !== undefined) originalTask.priority = priority;
  if (dueDate !== undefined) originalTask.dueDate = dueDate;
  
  if (assigneeId !== undefined && assigneeId !== originalTask.assigneeId) {
    const assignee = db.users.find(u => u.id === assigneeId);
    if (!assignee) {
      return res.status(400).json({ error: "Assignee user not found." });
    }
    originalTask.assigneeId = assigneeId;

    // Trigger assign notify
    const assignNotif = {
      id: `not-${Date.now()}`,
      title: "Task Reassigned",
      message: `${user.name} reassigned task '${originalTask.title}' to you.`,
      type: "info",
      createdAt: new Date().toISOString(),
      read: false,
      taskId: originalTask.id
    };
    db.notifications.unshift(assignNotif);
  }

  if (status !== undefined && status !== originalTask.status) {
    originalTask.status = status;
    hasStatusChanged = true;
  }

  originalTask.updatedAt = new Date().toISOString();

  // Create Activity log
  const logMessage = hasStatusChanged 
    ? `moved to [${status}]` 
    : "modified properties of";

  const newLog = {
    id: `log-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: logMessage,
    targetType: "task",
    targetId: originalTask.id,
    targetName: originalTask.title,
    createdAt: new Date().toISOString(),
  };
  db.activityLogs.unshift(newLog);

  // If moved to Done and user is different from creator, send notification
  if (status === "Done" && originalTask.creatorId !== user.id) {
    const doneNotif = {
      id: `not-done-${Date.now()}`,
      title: "Task Completed",
      message: `${user.name} marked task '${originalTask.title}' as Done.`,
      type: "success",
      createdAt: new Date().toISOString(),
      read: false,
      taskId: originalTask.id
    };
    db.notifications.unshift(doneNotif);
  }

  writeDb(db);
  res.json(originalTask);
});

// DELETE /api/tasks/:id (Admin ONLY)
app.delete("/api/tasks/:id", checkPermissions(["Admin"]), (req, res) => {
  const { id } = req.params;
  const user = req.actingUser;

  const db = readDb();
  const taskIndex = db.tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found." });
  }

  const deletedTask = db.tasks[taskIndex];
  db.tasks.splice(taskIndex, 1);

  // Register logger
  const newLog = {
    id: `log-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: "deleted",
    targetType: "task",
    targetId: id,
    targetName: deletedTask.title,
    createdAt: new Date().toISOString(),
  };
  db.activityLogs.unshift(newLog);

  writeDb(db);
  res.json({ message: "Task successfully removed.", deletedId: id });
});

// POST /api/tasks/:id/comments (Admin or Editor)
app.post("/api/tasks/:id/comments", checkPermissions(["Admin", "Editor"]), (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const user = req.actingUser;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Comment content cannot be empty." });
  }

  const db = readDb();
  const task = db.tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "Task not found." });
  }

  const newComment = {
    id: `com-${Date.now()}`,
    taskId: id,
    userId: user.id,
    userName: user.name,
    userColor: user.avatarColor,
    content,
    createdAt: new Date().toISOString(),
  };

  task.comments.push(newComment);
  task.updatedAt = new Date().toISOString();

  // Write log representation
  const newLog = {
    id: `log-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: "commented on",
    targetType: "comment",
    targetId: newComment.id,
    targetName: task.title,
    createdAt: new Date().toISOString(),
  };
  db.activityLogs.unshift(newLog);

  // Notify original creator or assignee if they aren't the commentator
  const usersToNotify = new Set();
  if (task.creatorId !== user.id) usersToNotify.add(task.creatorId);
  if (task.assigneeId !== user.id) usersToNotify.add(task.assigneeId);

  usersToNotify.forEach(uid => {
    const commNotif = {
      id: `not-${Date.now()}-${uid}`,
      title: "New Comment Added",
      message: `${user.name} commented on '${task.title}'`,
      type: "info",
      createdAt: new Date().toISOString(),
      read: false,
      taskId: task.id
    };
    db.notifications.unshift(commNotif);
  });

  writeDb(db);
  res.status(201).json(newComment);
});

// POST /api/tasks/:id/attachments (Admin or Editor)
app.post("/api/tasks/:id/attachments", checkPermissions(["Admin", "Editor"]), (req, res) => {
  const { id } = req.params;
  const { name, size, type, dataUrl } = req.body;
  const user = req.actingUser;

  if (!name || !size) {
    return res.status(400).json({ error: "Attachment name and size are required properties." });
  }

  const db = readDb();
  const task = db.tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "Task not found." });
  }

  const newAttachment = {
    id: `att-${Date.now()}`,
    name,
    size,
    type: type || "application/octet-stream",
    url: dataUrl || "#", // Real binary content or simulated preview reference
    uploadedAt: new Date().toISOString(),
    uploadedBy: user.name,
  };

  task.attachments.push(newAttachment);
  task.updatedAt = new Date().toISOString();

  // Log activity
  const newLog = {
    id: `log-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: "attached file to",
    targetType: "attachment",
    targetId: newAttachment.id,
    targetName: `${newAttachment.name} on ${task.title}`,
    createdAt: new Date().toISOString()
  };
  db.activityLogs.unshift(newLog);

  writeDb(db);
  res.status(201).json(newAttachment);
});

// GET /api/notifications
app.get("/api/notifications", (req, res) => {
  const db = readDb();
  res.json(db.notifications);
});

// POST /api/notifications/read-all
app.post("/api/notifications/read-all", (req, res) => {
  const db = readDb();
  db.notifications.forEach(n => {
    n.read = true;
  });
  writeDb(db);
  res.json({ message: "All notifications cleared.", status: "success" });
});

// GET /api/activity-logs
app.get("/api/activity-logs", (req, res) => {
  const db = readDb();
  res.json(db.activityLogs);
});


// Serve static assets in production, hook Vite dev middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Amdox Backend] Secure service initialized on port ${PORT}`);
  });
}

startServer();
