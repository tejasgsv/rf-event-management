@echo off
echo Testing Admin Login...
curl -X POST http://localhost:5000/api/admin/login -H "Content-Type: application/json" -d "{\"email\": \"admin@rf-event.com\", \"password\": \"admin123\"}"
echo.