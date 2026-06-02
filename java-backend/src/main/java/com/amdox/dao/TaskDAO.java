package com.amdox.dao;

import com.amdox.config.DatabaseConfig;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Task Data Access Object (DAO) implementing Advanced Java JDBC practices.
 */
public class TaskDAO {

    /**
     * Updates the status column of a task record in the MySQL table
     */
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

    /**
     * Inserts a new task row dynamically into the tasks MySQL Table
     */
    public boolean insertTask(String id, String title, String description, String priority, String dueDate, String assigneeId, String creatorId) throws SQLException {
        String sql = "INSERT INTO tasks (id, title, description, status, priority, due_date, assignee_id, creator_id, created_at, updated_at) " +
                     "VALUES (?, ?, ?, 'Todo', ?, ?, ?, ?, NOW(), NOW())";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, id);
            stmt.setString(2, title);
            stmt.setString(3, description);
            stmt.setString(4, priority);
            stmt.setString(5, dueDate);
            stmt.setString(6, assigneeId);
            stmt.setString(7, creatorId);
            
            return stmt.executeUpdate() > 0;
        }
    }

    /**
     * Deletes a task by primary key from target database schema
     */
    public boolean deleteTask(String taskId) throws SQLException {
        String sql = "DELETE FROM tasks WHERE id = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, taskId);
            return stmt.executeUpdate() > 0;
        }
    }
}
