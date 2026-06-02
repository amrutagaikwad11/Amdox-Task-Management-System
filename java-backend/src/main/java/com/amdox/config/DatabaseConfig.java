package com.amdox.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Advanced Java JDBC Database Configuration for MySQL
 */
public class DatabaseConfig {
    private static final String URL = "jdbc:mysql://localhost:3306/amdox_tasks?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
    private static final String USER = "amdox_admin";
    private static final String PASSWORD = "secure_java_mysql_pass_2026";
    
    static {
        try {
            // Load MySQL Connector/J driver
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("MySQL JDBC Driver not found in classpath: " + e.getMessage());
        }
    }

    /**
     * Obtains a standard SQL connection to the MySQL server
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
