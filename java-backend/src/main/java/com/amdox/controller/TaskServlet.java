package com.amdox.controller;

import com.amdox.dao.TaskDAO;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Advanced Java HttpServlet for processing REST requests for Task Management
 */
@WebServlet("/api/tasks/*")
public class TaskServlet extends HttpServlet {
    private TaskDAO taskDAO;

    @Override
    public void init() throws ServletException {
        this.taskDAO = new TaskDAO();
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Parse path parameter taskId
        String pathInfo = request.getPathInfo(); // Expecting /tsk-123
        if (pathInfo == null || pathInfo.equals("/")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\": \"Missing task ID path variable.\"}");
            return;
        }

        String taskId = pathInfo.substring(1); // Strip out leading '/'
        String currentUserRole = request.getHeader("X-User-Role");

        // Role authorization check
        if (currentUserRole == null || currentUserRole.equals("Viewer")) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.print("{\"error\": \"Viewer profiles cannot commit changes to tasks.\"}");
            return;
        }

        // Simulating JSON parsing for update properties
        String newStatus = request.getParameter("status");
        if (newStatus == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\": \"Status value is required to commit update.\"}");
            return;
        }

        try {
            boolean success = taskDAO.updateTaskStatus(taskId, newStatus);
            if (success) {
                response.setStatus(HttpServletResponse.SC_OK);
                out.print("{\"status\": \"success\", \"message\": \"Task updated in database.\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\": \"Task requested not found in database.\"}");
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\": \"Database operation failed: " + e.getMessage() + "\"}");
        }
    }
}
