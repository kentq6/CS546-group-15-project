#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Create a temporary file to store IDs
ID_FILE="./.test_ids.txt"
touch "$ID_FILE"

# Helper function to print test results
print_test_result() {
  TEST_NAME=$1
  SUCCESS=$2
  RESPONSE=$3
  
  if [ "$SUCCESS" = true ]; then
    echo -e "${GREEN}✅ PASSED: ${TEST_NAME}${NC}"
    if [ ! -z "$RESPONSE" ]; then
      echo -e "   Response: $RESPONSE"
    fi
  else
    echo -e "${RED}❌ FAILED: ${TEST_NAME}${NC}"
    if [ ! -z "$RESPONSE" ]; then
      echo -e "   Response: $RESPONSE"
    fi
  fi
  echo "-------------------------------------"
}

# Function to extract ID from JSON response
extract_id() {
  echo "$1" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4
}

# Function to save ID
save_id() {
  echo "$1=$2" >> "$ID_FILE"
  echo "Saved ID: $1=$2"
}

# Function to get ID
get_id() {
  grep "^$1=" "$ID_FILE" | cut -d'=' -f2
}

echo -e "${YELLOW}=== STARTING API ROUTE TESTS ===${NC}"
echo "Make sure the server is running on http://localhost:3000"
echo ""

# ============= COMPANY TESTS =============
echo -e "${YELLOW}=== COMPANY ROUTES ===${NC}"

# Test 1: Create a company (success case)
echo -e "\nTest 1: Create a company (success case)"
RESPONSE=$(curl -s -X POST "$BASE_URL/companies" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Company API",
    "location": "Test City, Test Country",
    "industry": "Testing",
    "ownerId": null,
    "members": [],
    "projects": []
  }')

COMPANY_ID=$(extract_id "$RESPONSE")
if [ ! -z "$COMPANY_ID" ]; then
  save_id "COMPANY_ID" "$COMPANY_ID"
  print_test_result "Create company" true "$RESPONSE"
else
  print_test_result "Create company" false "$RESPONSE"
fi

# Test 2: Create a company with invalid data (failure case)
echo -e "\nTest 2: Create a company with invalid data (failure case)"
RESPONSE=$(curl -s -X POST "$BASE_URL/companies" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "location": "Test City, Test Country",
    "industry": "Testing",
    "ownerId": null,
    "members": [],
    "projects": []
  }')

if [[ "$RESPONSE" == *"error"* ]]; then
  print_test_result "Create company with invalid data" true "$RESPONSE"
else
  print_test_result "Create company with invalid data" false "$RESPONSE"
fi

# Test 3: Get all companies
echo -e "\nTest 3: Get all companies"
RESPONSE=$(curl -s -X GET "$BASE_URL/companies")

if [[ "$RESPONSE" == *"Test Company API"* ]]; then
  print_test_result "Get all companies" true "Response contains the expected company"
else
  print_test_result "Get all companies" false "$RESPONSE"
fi

# Test 4: Get company by ID
echo -e "\nTest 4: Get company by ID"
COMPANY_ID=$(get_id "COMPANY_ID")
RESPONSE=$(curl -s -X GET "$BASE_URL/companies/$COMPANY_ID")

if [[ "$RESPONSE" == *"Test Company API"* ]]; then
  print_test_result "Get company by ID" true "$RESPONSE"
else
  print_test_result "Get company by ID" false "$RESPONSE"
fi

# Test 5: Update company with PATCH
echo -e "\nTest 5: Update company with PATCH"
COMPANY_ID=$(get_id "COMPANY_ID")
RESPONSE=$(curl -s -X PATCH "$BASE_URL/companies/$COMPANY_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Company",
    "industry": "Updated Testing"
  }')

if [[ "$RESPONSE" == *"Updated Test Company"* ]] && [[ "$RESPONSE" == *"Updated Testing"* ]]; then
  print_test_result "Update company with PATCH" true "$RESPONSE"
else
  print_test_result "Update company with PATCH" false "$RESPONSE"
fi

# ============= USER TESTS =============
echo -e "\n${YELLOW}=== USER ROUTES ===${NC}"

# Test 6: Create a user (success case)
echo -e "\nTest 6: Create a user (success case)"
COMPANY_ID=$(get_id "COMPANY_ID")
RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "password": "Password123!",
    "role": "Owner",
    "projects": [],
    "companyId": "'$COMPANY_ID'"
  }')

USER_ID=$(extract_id "$RESPONSE")
if [ ! -z "$USER_ID" ]; then
  save_id "USER_ID" "$USER_ID"
  print_test_result "Create user" true "$RESPONSE"
else
  print_test_result "Create user" false "$RESPONSE"
fi

# Test 7: Create a user with invalid data (failure case)
echo -e "\nTest 7: Create a user with invalid data (failure case)"
COMPANY_ID=$(get_id "COMPANY_ID")
RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "password": "Password123!",
    "role": "Owner",
    "projects": [],
    "companyId": "'$COMPANY_ID'"
  }')

if [[ "$RESPONSE" == *"error"* ]]; then
  print_test_result "Create user with invalid data" true "$RESPONSE"
else
  print_test_result "Create user with invalid data" false "$RESPONSE"
fi

# Test 8: Get all users
echo -e "\nTest 8: Get all users"
RESPONSE=$(curl -s -X GET "$BASE_URL/users")

if [[ "$RESPONSE" == *"testuser123"* ]]; then
  print_test_result "Get all users" true "Response contains the expected user"
else
  print_test_result "Get all users" false "$RESPONSE"
fi

# Test 9: Get user by ID
echo -e "\nTest 9: Get user by ID"
USER_ID=$(get_id "USER_ID")
RESPONSE=$(curl -s -X GET "$BASE_URL/users/$USER_ID")

if [[ "$RESPONSE" == *"testuser123"* ]]; then
  print_test_result "Get user by ID" true "$RESPONSE"
else
  print_test_result "Get user by ID" false "$RESPONSE"
fi

# Test 10: Update user with PATCH
echo -e "\nTest 10: Update user with PATCH"
USER_ID=$(get_id "USER_ID")
RESPONSE=$(curl -s -X PATCH "$BASE_URL/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Project Manager"
  }')

if [[ "$RESPONSE" == *"Project Manager"* ]]; then
  print_test_result "Update user with PATCH" true "$RESPONSE"
else
  print_test_result "Update user with PATCH" false "$RESPONSE"
fi

# ============= PROJECT TESTS =============
echo -e "\n${YELLOW}=== PROJECT ROUTES ===${NC}"

# Test 11: Create a project (success case)
echo -e "\nTest 11: Create a project (success case)"
COMPANY_ID=$(get_id "COMPANY_ID")
RESPONSE=$(curl -s -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project API",
    "description": "This is a test project created via API",
    "budget": 100000,
    "status": "Pending",
    "companyId": "'$COMPANY_ID'"
  }')

PROJECT_ID=$(extract_id "$RESPONSE")
if [ ! -z "$PROJECT_ID" ]; then
  save_id "PROJECT_ID" "$PROJECT_ID"
  print_test_result "Create project" true "$RESPONSE"
else
  print_test_result "Create project" false "$RESPONSE"
fi

# Test 12: Create a project with invalid data (failure case)
echo -e "\nTest 12: Create a project with invalid data (failure case)"
COMPANY_ID=$(get_id "COMPANY_ID")
RESPONSE=$(curl -s -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project API 2",
    "description": "This is another test project created via API",
    "budget": -5000,
    "status": "Pending",
    "companyId": "'$COMPANY_ID'"
  }')

if [[ "$RESPONSE" == *"error"* ]]; then
  print_test_result "Create project with invalid data" true "$RESPONSE"
else
  print_test_result "Create project with invalid data" false "$RESPONSE"
fi

# Test 13: Get all projects
echo -e "\nTest 13: Get all projects"
RESPONSE=$(curl -s -X GET "$BASE_URL/projects")

if [[ "$RESPONSE" == *"Test Project API"* ]]; then
  print_test_result "Get all projects" true "Response contains the expected project"
else
  print_test_result "Get all projects" false "$RESPONSE"
fi

# Test 14: Get project by ID
echo -e "\nTest 14: Get project by ID"
PROJECT_ID=$(get_id "PROJECT_ID")
RESPONSE=$(curl -s -X GET "$BASE_URL/projects/$PROJECT_ID")

if [[ "$RESPONSE" == *"Test Project API"* ]]; then
  print_test_result "Get project by ID" true "$RESPONSE"
else
  print_test_result "Get project by ID" false "$RESPONSE"
fi

# Test 15: Update project with PATCH
echo -e "\nTest 15: Update project with PATCH"
PROJECT_ID=$(get_id "PROJECT_ID")
RESPONSE=$(curl -s -X PATCH "$BASE_URL/projects/$PROJECT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress",
    "budget": 150000
  }')

if [[ "$RESPONSE" == *"In Progress"* ]] && [[ "$RESPONSE" == *"150000"* ]]; then
  print_test_result "Update project with PATCH" true "$RESPONSE"
else
  print_test_result "Update project with PATCH" false "$RESPONSE"
fi

# ============= TASK TESTS =============
echo -e "\n${YELLOW}=== TASK ROUTES ===${NC}"

# Test 16: Create a task (success case)
echo -e "\nTest 16: Create a task (success case)"
PROJECT_ID=$(get_id "PROJECT_ID")
USER_ID=$(get_id "USER_ID")
RESPONSE=$(curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "name": "Test Task API",
    "description": "This is a test task created via API",
    "cost": 25000,
    "status": "Pending",
    "assignedTo": "'$USER_ID'"
  }')

TASK_ID=$(extract_id "$RESPONSE")
if [ ! -z "$TASK_ID" ]; then
  save_id "TASK_ID" "$TASK_ID"
  print_test_result "Create task" true "$RESPONSE"
else
  print_test_result "Create task" false "$RESPONSE"
fi

# Test 17: Get all tasks
echo -e "\nTest 17: Get all tasks"
RESPONSE=$(curl -s -X GET "$BASE_URL/tasks")

if [[ "$RESPONSE" == *"Test Task API"* ]]; then
  print_test_result "Get all tasks" true "Response contains the expected task"
else
  print_test_result "Get all tasks" false "$RESPONSE"
fi

# Test 18: Get task by ID
echo -e "\nTest 18: Get task by ID"
TASK_ID=$(get_id "TASK_ID")
RESPONSE=$(curl -s -X GET "$BASE_URL/tasks/$TASK_ID")

if [[ "$RESPONSE" == *"Test Task API"* ]]; then
  print_test_result "Get task by ID" true "$RESPONSE"
else
  print_test_result "Get task by ID" false "$RESPONSE"
fi

# Test 19: Update task with PATCH
echo -e "\nTest 19: Update task with PATCH"
TASK_ID=$(get_id "TASK_ID")
RESPONSE=$(curl -s -X PATCH "$BASE_URL/tasks/$TASK_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress",
    "cost": 30000
  }')

if [[ "$RESPONSE" == *"In Progress"* ]]; then
  print_test_result "Update task with PATCH" true "$RESPONSE"
else
  print_test_result "Update task with PATCH" false "$RESPONSE"
fi

# ============= BLUEPRINT TESTS =============
echo -e "\n${YELLOW}=== BLUEPRINT ROUTES ===${NC}"

# Test 20: Create a blueprint (success case)
echo -e "\nTest 20: Create a blueprint (success case)"
PROJECT_ID=$(get_id "PROJECT_ID")
USER_ID=$(get_id "USER_ID")
RESPONSE=$(curl -s -X POST "$BASE_URL/blueprints" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "title": "Test Blueprint API",
    "fileUrl": "test_blueprint.pdf",
    "tags": ["API", "Testing"],
    "uploadedBy": "'$USER_ID'"
  }')

BLUEPRINT_ID=$(extract_id "$RESPONSE")
if [ ! -z "$BLUEPRINT_ID" ]; then
  save_id "BLUEPRINT_ID" "$BLUEPRINT_ID"
  print_test_result "Create blueprint" true "$RESPONSE"
else
  print_test_result "Create blueprint" false "$RESPONSE"
fi

# Test 21: Get all blueprints
echo -e "\nTest 21: Get all blueprints"
RESPONSE=$(curl -s -X GET "$BASE_URL/blueprints")

if [[ "$RESPONSE" == *"Test Blueprint API"* ]]; then
  print_test_result "Get all blueprints" true "Response contains the expected blueprint"
else
  print_test_result "Get all blueprints" false "$RESPONSE"
fi

# Test 22: Get blueprint by ID
echo -e "\nTest 22: Get blueprint by ID"
BLUEPRINT_ID=$(get_id "BLUEPRINT_ID")
RESPONSE=$(curl -s -X GET "$BASE_URL/blueprints/$BLUEPRINT_ID")

if [[ "$RESPONSE" == *"Test Blueprint API"* ]]; then
  print_test_result "Get blueprint by ID" true "$RESPONSE"
else
  print_test_result "Get blueprint by ID" false "$RESPONSE"
fi

# ============= REPORT TESTS =============
echo -e "\n${YELLOW}=== REPORT ROUTES ===${NC}"

# Test 23: Create a report (success case)
echo -e "\nTest 23: Create a report (success case)"
PROJECT_ID=$(get_id "PROJECT_ID")
USER_ID=$(get_id "USER_ID")
RESPONSE=$(curl -s -X POST "$BASE_URL/reports" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "title": "Test Report API",
    "description": "This is a test report created via API",
    "fileUrl": "test_report.pdf",
    "tags": ["API", "Testing"],
    "uploadedBy": "'$USER_ID'"
  }')

REPORT_ID=$(extract_id "$RESPONSE")
if [ ! -z "$REPORT_ID" ]; then
  save_id "REPORT_ID" "$REPORT_ID"
  print_test_result "Create report" true "$RESPONSE"
else
  print_test_result "Create report" false "$RESPONSE"
fi

# Test 24: Get all reports
echo -e "\nTest 24: Get all reports"
RESPONSE=$(curl -s -X GET "$BASE_URL/reports")

if [[ "$RESPONSE" == *"Test Report API"* ]]; then
  print_test_result "Get all reports" true "Response contains the expected report"
else
  print_test_result "Get all reports" false "$RESPONSE"
fi

# Test 25: Get report by ID
echo -e "\nTest 25: Get report by ID"
REPORT_ID=$(get_id "REPORT_ID")
RESPONSE=$(curl -s -X GET "$BASE_URL/reports/$REPORT_ID")

if [[ "$RESPONSE" == *"Test Report API"* ]]; then
  print_test_result "Get report by ID" true "$RESPONSE"
else
  print_test_result "Get report by ID" false "$RESPONSE"
fi

# Test 26: Create an issue for a report
echo -e "\nTest 26: Create an issue for a report"
REPORT_ID=$(get_id "REPORT_ID")
USER_ID=$(get_id "USER_ID")
RESPONSE=$(curl -s -X POST "$BASE_URL/reports/$REPORT_ID/issues" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Issue API",
    "description": "This is a test issue created via API",
    "status": "Unresolved",
    "raisedBy": "'$USER_ID'"
  }')

ISSUE_ID=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ ! -z "$ISSUE_ID" ]; then
  save_id "ISSUE_ID" "$ISSUE_ID"
  print_test_result "Create issue" true "$RESPONSE"
else
  print_test_result "Create issue" false "$RESPONSE"
fi

# Test 27: Get all issues for a report
echo -e "\nTest 27: Get all issues for a report"
REPORT_ID=$(get_id "REPORT_ID")
RESPONSE=$(curl -s -X GET "$BASE_URL/reports/$REPORT_ID/issues")

if [[ "$RESPONSE" == *"Test Issue API"* ]]; then
  print_test_result "Get all issues for a report" true "Response contains the expected issue"
else
  print_test_result "Get all issues for a report" false "$RESPONSE"
fi

# Test 28: Update issue with PATCH
echo -e "\nTest 28: Update issue with PATCH"
REPORT_ID=$(get_id "REPORT_ID")
ISSUE_ID=$(get_id "ISSUE_ID")
RESPONSE=$(curl -s -X PATCH "$BASE_URL/reports/$REPORT_ID/issues/$ISSUE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Resolved",
    "description": "This issue has been resolved via API"
  }')

if [[ "$RESPONSE" == *"Resolved"* ]]; then
  print_test_result "Update issue with PATCH" true "$RESPONSE"
else
  print_test_result "Update issue with PATCH" false "$RESPONSE"
fi

# ============= CLEANUP TESTS =============
echo -e "\n${YELLOW}=== DELETION TESTS ===${NC}"

# Test 29: Delete issue
echo -e "\nTest 29: Delete issue"
REPORT_ID=$(get_id "REPORT_ID")
ISSUE_ID=$(get_id "ISSUE_ID")
RESPONSE=$(curl -s -X DELETE "$BASE_URL/reports/$REPORT_ID/issues/$ISSUE_ID")

if [[ "$RESPONSE" == *"deleted"* ]]; then
  print_test_result "Delete issue" true "$RESPONSE"
else
  print_test_result "Delete issue" false "$RESPONSE"
fi

# Test 30: Delete report
echo -e "\nTest 30: Delete report"
REPORT_ID=$(get_id "REPORT_ID")
RESPONSE=$(curl -s -X DELETE "$BASE_URL/reports/$REPORT_ID")

if [[ "$RESPONSE" == *"deleted"* ]]; then
  print_test_result "Delete report" true "$RESPONSE"
else
  print_test_result "Delete report" false "$RESPONSE"
fi

# Test 31: Delete blueprint
echo -e "\nTest 31: Delete blueprint"
PROJECT_ID=$(get_id "PROJECT_ID")
BLUEPRINT_ID=$(get_id "BLUEPRINT_ID")
RESPONSE=$(curl -s -X DELETE "$BASE_URL/blueprints/$PROJECT_ID/$BLUEPRINT_ID")

if [[ "$RESPONSE" == *"deleted"* ]]; then
  print_test_result "Delete blueprint" true "$RESPONSE"
else
  print_test_result "Delete blueprint" false "$RESPONSE"
fi

# Test 32: Delete task
echo -e "\nTest 32: Delete task"
TASK_ID=$(get_id "TASK_ID")
RESPONSE=$(curl -s -X DELETE "$BASE_URL/tasks/$TASK_ID")

if [[ "$RESPONSE" == *"deleted"* ]]; then
  print_test_result "Delete task" true "$RESPONSE"
else
  print_test_result "Delete task" false "$RESPONSE"
fi

# Test 33: Delete project
echo -e "\nTest 33: Delete project"
PROJECT_ID=$(get_id "PROJECT_ID")
RESPONSE=$(curl -s -X DELETE "$BASE_URL/projects/$PROJECT_ID")

if [[ "$RESPONSE" == *"deleted"* ]]; then
  print_test_result "Delete project" true "$RESPONSE"
else
  print_test_result "Delete project" false "$RESPONSE"
fi

# Test 34: Delete user
echo -e "\nTest 34: Delete user"
USER_ID=$(get_id "USER_ID")
RESPONSE=$(curl -s -X DELETE "$BASE_URL/users/$USER_ID")

if [[ "$RESPONSE" == *"deleted"* ]]; then
  print_test_result "Delete user" true "$RESPONSE"
else
  print_test_result "Delete user" false "$RESPONSE"
fi

# Test 35: Delete company
echo -e "\nTest 35: Delete company"
COMPANY_ID=$(get_id "COMPANY_ID")
RESPONSE=$(curl -s -X DELETE "$BASE_URL/companies/$COMPANY_ID")

if [[ "$RESPONSE" == *"deleted"* ]]; then
  print_test_result "Delete company" true "$RESPONSE"
else
  print_test_result "Delete company" false "$RESPONSE"
fi

# Clean up the ID file
rm -f "$ID_FILE"

echo -e "\n${YELLOW}=== TEST SUMMARY ===${NC}"
echo -e "All API route tests completed."
echo "Remember to review any failed tests and fix the corresponding route handlers."