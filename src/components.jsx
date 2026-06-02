import React, { useState, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  LogOut, 
  TrendingUp, 
  UserCheck, 
  X, 
  Upload, 
  Database, 
  ChevronRight, 
  Lock,
  Download,
  Award,
  Users
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from "recharts";

// 1. KANBAN BOARD COMPONENT
export function KanbanBoard({ tasks, users, currentUser, onSelectTask, onUpdateStatus, onAddTaskClick }) {
  const columns = [
    { id: "Todo", title: "Todo Backlog", color: "text-slate-700 bg-slate-100", border: "border-slate-200", bg: "bg-slate-50/60" },
    { id: "In_Progress", title: "In Progress", color: "text-blue-700 bg-blue-100", border: "border-blue-200", bg: "bg-blue-50/10" },
    { id: "In_Review", title: "In Review", color: "text-amber-700 bg-amber-100", border: "border-amber-200", bg: "bg-amber-50/10" },
    { id: "Done", title: "Done & Verified", color: "text-emerald-700 bg-emerald-100", border: "border-emerald-200", bg: "bg-emerald-50/10" }
  ];

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onUpdateStatus(taskId, status);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case "Critical":
        return <span className="text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/10">Critical</span>;
      case "High":
        return <span className="text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/10">High</span>;
      case "Medium":
        return <span className="text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/10">Medium</span>;
      default:
        return <span className="text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 border border-slate-500/10">Low</span>;
    }
  };

  const truncateParagraph = (str, max) => {
    if (!str) return "No description supplied.";
    return str.length > max ? str.substring(0, max) + "..." : str;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {columns.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col h-[650px] rounded-2xl border ${col.border} ${col.bg} p-4 transition-all`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-lg ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-extrabold text-slate-400 bg-white border border-slate-150 px-2 py-0.5 rounded-md shadow-xs">
                  {columnTasks.length}
                </span>
              </div>
              
              {col.id === "Todo" && (
                <button
                  type="button"
                  onClick={onAddTaskClick}
                  className="p-1.5 hover:bg-slate-200 text-slate-600 transition-all rounded-lg cursor-pointer"
                  title="Create task"
                >
                  <Plus size={15} />
                </button>
              )}
            </div>

            {/* Tasks Container */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 kanban-scrollbar select-none">
              {columnTasks.length === 0 ? (
                <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 p-4">
                  <Database size={20} className="stroke-1 text-slate-350 mb-1" />
                  <span className="text-[10px] text-center italic">Empty Backlog State</span>
                </div>
              ) : (
                columnTasks.map(t => {
                  const assignee = users.find(u => u.id === t.assigneeId);
                  const isOverdue = new Date(t.dueDate) < new Date() && t.status !== "Done";
                  
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      onClick={() => onSelectTask(t)}
                      className="bg-white border border-slate-200/80 rounded-xl p-4 hover:border-indigo-400 hover:shadow-md transition-all duration-250 cursor-grab active:cursor-grabbing text-left space-y-3 relative group"
                    >
                      {/* Priority Tags */}
                      <div className="flex items-center justify-between gap-2">
                        {getPriorityBadge(t.priority)}
                        
                        {isOverdue && (
                          <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-1.5 py-0.5 tracking-wider uppercase flex items-center gap-1">
                            <Clock size={10} />
                            Overdue
                          </span>
                        )}
                      </div>

                      {/* Title & Body */}
                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-[13px] text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                          {t.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                          {truncateParagraph(t.description, 90)}
                        </p>
                      </div>

                      {/* Metadata row */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2 shrink-0">
                        
                        <div className="flex items-center gap-2.5 text-slate-400 text-[10px] font-bold">
                          <span className="flex items-center gap-1" title="Comments Count">
                            <MessageSquare size={12} className="stroke-2 text-slate-350" />
                            {t.comments?.length || 0}
                          </span>
                          <span className="flex items-center gap-1" title="Attachments Count">
                            <Paperclip size={12} className="stroke-2 text-slate-350" />
                            {t.attachments?.length || 0}
                          </span>
                        </div>

                        {/* Assignee custom avatar */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          {assignee && (
                            <>
                              <span className="text-[10px] font-bold text-slate-600 truncate max-w-[80px]">
                                {assignee.name.split(" ")[0]}
                              </span>
                              <div
                                className="w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-[9px] text-white shrink-0 shadow-xs"
                                style={{ backgroundColor: assignee.avatarColor }}
                                title={assignee.name}
                              >
                                {assignee.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                              </div>
                            </>
                          )}
                        </div>

                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 2. MEMBER PROFILE SELECTOR & CREATOR
export function MemberProfileControls({ users, currentUser, onUserSwitch, onUserRegister }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Editor");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    onUserRegister(name, email, role);
    setName("");
    setEmail("");
    setShowAdd(false);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-medium text-xs text-slate-400 tracking-wider uppercase">Active Session Persona</h4>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-indigo-600 hover:text-indigo-700 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
        >
          {showAdd ? "Close Grid" : "Invite +"}
        </button>
      </div>

      {!showAdd ? (
        <div className="space-y-2">
          <p className="text-[10.5px] text-slate-400">Select simulated profile representing different system endpoints credentials:</p>
          <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 kanban-scrollbar">
            {users.map(u => {
              const isSelected = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => onUserSwitch(u)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-slate-950 text-white shadow-sm"
                      : "bg-slate-50/55 hover:bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xxs text-white shadow-xs shrink-0"
                      style={{ backgroundColor: u.avatarColor }}
                    >
                      {u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold truncate">{u.name}</span>
                      <span className={`text-[9px] font-medium leading-none ${isSelected ? "text-indigo-400" : "text-slate-400"}`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                  {isSelected && <UserCheck size={14} className="text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 animate-fade-in text-xs">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 tracking-wide uppercase">Employee Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amanda Cole"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 tracking-wide uppercase">Corporate Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amanda@amdox.com"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 tracking-wide uppercase">Role Authority</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
            >
              <option value="Admin">Admin (Full Control)</option>
              <option value="Editor">Editor (Edit & Create)</option>
              <option value="Viewer">Viewer (Read Only)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all cursor-pointer shadow-sm text-xs"
          >
            Authorize Profile
          </button>
        </form>
      )}
    </div>
  );
}

// 3. RECENT ACTIVITY LOGGER SYSTEM
export function ActivityAuditScroll({ logs }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs text-left">
      <h4 className="font-display font-medium text-xs text-slate-400 tracking-wider mb-3.5 uppercase">Workspace Activity</h4>
      
      <div className="space-y-4 max-h-[188px] overflow-y-auto pr-1 kanban-scrollbar text-xs">
        {logs.length === 0 ? (
          <p className="text-slate-400 text-center italic py-4">No logged operations yet.</p>
        ) : (
          <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-0.5 before:bg-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 relative z-10 text-[11px]">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-slate-200 bg-white"
                  title={`${log.userName} (${log.userRole})`}
                >
                  <span className="text-[8px] font-black font-mono text-slate-500">
                    {log.userName.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-600 leading-relaxed font-normal">
                    <span className="font-bold text-slate-800">{log.userName}</span> {log.action}{" "}
                    <span className="font-bold text-slate-800 truncate" title={log.targetName}>
                      {log.targetName.length > 25 ? log.targetName.slice(0, 25) + "..." : log.targetName}
                    </span>
                  </p>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 4. NOTIFICATION CENTER FEED
export function NotificationCenter({ notifications, onReadAll, onSelectTask }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getAlertStyle = (type) => {
    switch (type) {
      case "warning": return "bg-rose-50 border-rose-100 text-rose-700";
      case "danger": return "bg-red-50 border-red-100 text-red-700";
      case "success": return "bg-emerald-50 border-emerald-100 text-emerald-700";
      default: return "bg-indigo-50 border-indigo-100 text-indigo-700";
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs text-left space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h4 className="font-display font-medium text-xs text-slate-400 tracking-wider uppercase">Risk & SLA Alerts</h4>
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onReadAll}
            className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2.5 max-h-[188px] overflow-y-auto pr-1 kanban-scrollbar text-xs">
        {notifications.length === 0 ? (
          <p className="text-slate-400 text-center italic py-4">No recent system triggers.</p>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => notif.taskId && onSelectTask(notif.taskId)}
              className={`p-3 border rounded-xl flex flex-col gap-1 transition-all text-[11px] ${getAlertStyle(notif.type)} ${
                notif.taskId ? "cursor-pointer hover:-translate-y-0.5" : ""
              } ${notif.read ? "opacity-60" : ""}`}
            >
              <div className="flex justify-between items-center w-full font-bold">
                 <span className="truncate">{notif.title}</span>
                 <span className="text-[8px] font-medium opacity-75">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="opacity-90 leading-snug">{notif.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 5. PROGRESS REPORTING & METRICS SYSTEM
export function AnalyticsDashboard({ tasks, users, onDownloadReport }) {
  // Compute numbers
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "Done").length;
  const progressRatio = total > 0 ? Math.round((done / total) * 100) : 0;
  
  const priorities = ["Low", "Medium", "High", "Critical"];
  const priorityData = priorities.map(p => ({
    name: p,
    value: tasks.filter(t => t.priority === p).length
  }));

  const COLORS = ["#94a3b8", "#3b82f6", "#f59e0b", "#ef4444"];

  const userDistribution = users.map(u => ({
    name: u.name.split(" ")[0],
    assigned: tasks.filter(t => t.assigneeId === u.id).length,
    completed: tasks.filter(t => t.assigneeId === u.id && t.status === "Done").length
  }));

  return (
    <div className="space-y-6 text-left">
      
      {/* SLA Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1: Completed */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider block">Completed Deliverables</span>
            <span className="text-3xl font-display font-black text-slate-900 block">{done} <span className="text-xs font-semibold text-slate-400">/ {total}</span></span>
            <span className="text-[10.5px] text-emerald-500 font-bold block">SLA Target Check OK</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100">
            {progressRatio}%
          </div>
        </div>

        {/* Card 2: Risk Profile */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider block">Blocked & Red Alert Tasks</span>
            <span className="text-3xl font-display font-black text-slate-900 block">
              {tasks.filter(t => t.priority === "Critical" && t.status !== "Done").length}
            </span>
            <span className="text-[10.5px] text-rose-500 font-bold block">Needs Developer Response</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            ⚠️
          </div>
        </div>

        {/* Card 3: Sprint countdown */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider block">Sprint Deliverable End</span>
            <span className="text-sm font-bold text-slate-800 block">June 30, 2026</span>
            <span className="text-[10.5px] text-slate-400 font-medium block">Timezone: UTC Zone</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
            29d
          </div>
        </div>

        {/* Card 4: Reports downloader */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider block mb-1">Download Summary Matrix</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onDownloadReport("json")}
              className="py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-[11px] font-extrabold text-slate-700 cursor-pointer text-center"
            >
              Export JSON
            </button>
            <button
              onClick={() => onDownloadReport("csv")}
              className="py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-[11px] font-extrabold cursor-pointer text-center"
            >
              Export CSV
            </button>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Recharts Workload distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h4 className="font-display font-medium text-base text-slate-800">Team Workload Distribution</h4>
            <p className="text-xs text-slate-405/90">Work assignments matching active user profiles in current sprint scope</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userDistribution}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="assigned" name="Assigned Tasks" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts Priority Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h4 className="font-display font-medium text-base text-slate-800">Priority Diagnostics Rate</h4>
            <p className="text-xs text-slate-405/90">Critical level allocations vs. lightweight deliverables backlog shares</p>
          </div>

          <div className="h-64 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            <div className="md:col-span-8 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Manual Legend to save space */}
            <div className="md:col-span-4 space-y-2 text-xs">
              {priorityData.map((d, index) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index] }} />
                  <span className="font-bold text-slate-700">{d.name}</span>
                  <span className="text-slate-400 font-normal">({d.value})</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

// 6. DETAILED VIEW / COMMENT POSTS MODEL
export function TaskModal({ task, users, currentUser, onClose, onUpdateStatus, onAddComment, onAddAttachment, onDeleteTask }) {
  const [commentText, setCommentText] = useState("");
  const fileInputRef = useRef(null);

  const assignee = users.find(u => u.id === task.assigneeId);
  const creator = users.find(u => u.id === task.creatorId);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(task.id, commentText);
    setCommentText("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeString = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
      : (file.size / 1024).toFixed(1) + " KB";

    const reader = new FileReader();
    reader.onload = () => {
      onAddAttachment(task.id, file.name, sizeString, file.type, reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Modal Banner */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-indigo-400" size={18} />
            <span className="font-mono text-xs text-slate-400">AMDOX TASK RECORD &mdash; {task.id}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content layout */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Task Details left side */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Task Identifier Title</span>
                <h3 className="font-display font-bold text-lg md:text-xl text-slate-900 leading-snug">{task.title}</h3>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Operational Description</span>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl bg-slate-50 border border-slate-100 p-4 rounded-xl">{task.description || "No full explanation supplied."}</p>
              </div>

              {/* Attachments panel */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Relational Attachments</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-bold cursor-pointer"
                  >
                    Attach File +
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {task.attachments?.length === 0 ? (
                    <div className="col-span-2 text-center py-4 bg-slate-50/50 border border-slate-100/60 rounded-xl text-xs text-slate-400 italic">
                      No attached modules. Upload images, diagrams or reports.
                    </div>
                  ) : (
                    task.attachments?.map((att) => (
                      <div key={att.id} className="p-3 border border-slate-200 bg-slate-50/20 hover:border-indigo-200 rounded-xl flex items-center justify-between text-xs transition-all">
                        <div className="min-w-0 flex-1 pr-2 space-y-0.5">
                          <p className="font-bold text-slate-850 truncate" title={att.name}>{att.name}</p>
                          <span className="text-[10px] text-slate-400">{att.size} &mdash; by {att.uploadedBy}</span>
                        </div>
                        {att.url && att.url !== "#" ? (
                          <a
                            href={att.url}
                            download={att.name}
                            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 cursor-pointer"
                            title="Download attachment"
                          >
                            <Download size={13} />
                          </a>
                        ) : (
                          <Paperclip size={13} className="text-slate-401" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Discussion chat thread */}
              <div className="space-y-4 pt-2">
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">Sprint Discussion</span>
                
                {/* Scroll Thread */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 kanban-scrollbar font-normal">
                  {task.comments?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50/20 border border-slate-100/50 rounded-xl">No discussion records on this backlog task item yet.</p>
                  ) : (
                    task.comments?.map(co => (
                      <div key={co.id} className="p-3 border border-slate-150/70 bg-slate-50/30 rounded-xl space-y-1.5 text-xs">
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: co.userColor }} />
                            <span>{co.userName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(co.createdAt).toLocaleDateString()} at {new Date(co.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-normal">{co.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Post Comment Input */}
                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter discussion feedback..."
                    className="flex-1 text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Post Dialogue
                  </button>
                </form>

              </div>

            </div>

            {/* Task Stats configuration sidebar right */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-5 text-xs text-slate-600">
              
              <div className="space-y-1 pb-3 border-b border-slate-200">
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Process Status Progress</span>
                <div className="grid grid-cols-2 gap-1.5 pt-2">
                  {["Todo", "In_Progress", "In_Review", "Done"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onUpdateStatus(task.id, st)}
                      className={`py-2 text-[10.5px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                        task.status === st
                          ? "bg-indigo-600 border-indigo-700 text-white shadow-xs"
                          : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Attributes Checklist */}
              <div className="space-y-3.5">
                
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-505">Priority Level</span>
                  <span className="font-semibold text-slate-800">{task.priority}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-550">SLA Due Date</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Calendar size={13} className="text-slate-401" />
                    {task.dueDate}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-550">Assigned Corporate Engineer</span>
                  <span className="font-serif font-bold text-slate-800">{assignee?.name || "Unassigned"}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-550">Creator Admin</span>
                  <span className="font-serif font-bold text-slate-800">{creator?.name || "System"}</span>
                </div>

              </div>

              {/* Danger zone actions */}
              {currentUser.role === "Admin" && (
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      if (confirm("Execute SQL CASCADE: Removing this task removes all associated discussion and file logs from MySQL schema structures. Proceed?")) {
                        onDeleteTask(task.id);
                        onClose();
                      }
                    }}
                    className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Trash2 size={13} />
                    Delete Database Task Record (Admin Only)
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// 7. CREATE DIALOGUE MODAL
export function TaskCreateModal({ isOpen, onClose, users, onCreateTask, currentUser }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || "");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    if (currentUser.role === "Viewer") {
      alert("Role Violation: A trial 'Viewer' profile is strictly unauthorized from inserting tasks into SQL tables.");
      return;
    }

    onCreateTask({
      title,
      description,
      priority,
      dueDate,
      assigneeId,
    });

    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Banner */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <span className="font-display font-bold text-xs text-indigo-400 tracking-wider uppercase">MySQL Backend: INSERT REGISTER</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Input fields form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 tracking-wide uppercase">Deliverable Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Hikari Connection Handler"
              className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 tracking-wide uppercase">Operational Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Operational instructions for the assigned engineer..."
              className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-indigo-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-400 tracking-wide uppercase">Priority Rate</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-400 tracking-wide uppercase">SLA Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-indigo-500"
              />
            </div>

          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 tracking-wide uppercase">Assignee Corporate Profile</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-indigo-500"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} &mdash; ({u.role})</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold transition-all cursor-pointer text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all cursor-pointer shadow-sm shadow-indigo-500/10 hover:shadow-lg h-9"
            >
              Commit SQL INSERT
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
