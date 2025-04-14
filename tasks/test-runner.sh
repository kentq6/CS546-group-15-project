#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${YELLOW}=================================================${NC}"
echo -e "${YELLOW}       GoProject Testing Suite Runner            ${NC}"
echo -e "${YELLOW}=================================================${NC}"

# Check if MongoDB is running
echo -e "\n${BLUE}Checking if MongoDB is running...${NC}"
if nc -z localhost 27017 > /dev/null 2>&1; then
  echo -e "${GREEN}MongoDB is running on port 27017${NC}"
else
  echo -e "${RED}MongoDB is not running on port 27017!${NC}"
  echo -e "Please start MongoDB before running the tests."
  exit 1
fi

# Function to run a command and check its exit status
run_command() {
  echo -e "\n${BLUE}Running: $1${NC}"
  eval $1
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Command completed successfully!${NC}"
  else
    echo -e "${RED}Command failed with exit code $?${NC}"
    if [ "$2" == "exit_on_fail" ]; then
      exit 1
    fi
  fi
}

# Step 1: Install dependencies if needed
echo -e "\n${YELLOW}Step 1: Checking and installing dependencies${NC}"
if [ ! -d "node_modules" ]; then
  run_command "npm install" "exit_on_fail"
else
  echo -e "${GREEN}Dependencies already installed${NC}"
fi

# Step 2: Run the enhanced seed to set up test data
echo -e "\n${YELLOW}Step 2: Running enhanced seed script${NC}"
run_command "node tasks/enhanced-seed.js" "exit_on_fail"

# Step 3: Run data function tests
echo -e "\n${YELLOW}Step 3: Running data function tests${NC}"
run_command "node tasks/data-test.js"

# Step 4: Start the Express server in the background
echo -e "\n${YELLOW}Step 4: Starting Express server${NC}"
run_command "node app.js &" "exit_on_fail"
SERVER_PID=$!
echo -e "${GREEN}Server started with PID: $SERVER_PID${NC}"
echo -e "${BLUE}Waiting 5 seconds for the server to initialize...${NC}"
sleep 5

# Step 5: Run the API route tests
echo -e "\n${YELLOW}Step 5: Running API route tests${NC}"
run_command "chmod +x tasks/route-test.sh"
run_command "./tasks/route-test.sh"

# Step 6: Clean up - kill the Express server
echo -e "\n${YELLOW}Step 6: Cleaning up - killing Express server${NC}"
kill $SERVER_PID
echo -e "${GREEN}Server with PID $SERVER_PID has been terminated${NC}"

# Print summary
echo -e "\n${YELLOW}=================================================${NC}"
echo -e "${YELLOW}       Testing Suite Execution Complete           ${NC}"
echo -e "${YELLOW}=================================================${NC}"
echo -e "\nPlease review the output above for any test failures."
echo -e "For detailed information, see the Testing Suite README."