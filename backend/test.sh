#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# Base URL
BASE_URL="http://localhost:3001/api"

# Test counter
PASS=0
FAIL=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        FAIL=$((FAIL + 1))
    fi
}

echo -e "\n${BLUE}Starting API Tests...${NC}\n"

# Generate unique email for test
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_USERNAME="testuser${TIMESTAMP}"

# 1. Register a new user
echo -e "${BLUE}Test 1: Register New User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$TEST_USERNAME\",
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"password123\"
    }")

echo "Registration Response: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -n "$TOKEN" ]; then
    print_result 0 "User Registration"
else
    print_result 1 "User Registration (Token not found in response)"
fi

# 2. Login with the created user
echo -e "\n${BLUE}Test 2: User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"password123\"
    }")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
print_result $? "User Login"

# 3. Get user profile
echo -e "\n${BLUE}Test 3: Get User Profile${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $TOKEN")
print_result $? "Get User Profile"

# 4. Record workout event
echo -e "\n${BLUE}Test 4: Record Workout Event${NC}"
EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/events" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "eventType": "LOG_WORKOUT",
        "metadata": {
            "workoutType": "cardio",
            "duration": 30
        }
    }')
print_result $? "Record Workout Event"

# 5. Get event history
echo -e "\n${BLUE}Test 5: Get Event History${NC}"
HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/events/history" \
    -H "Authorization: Bearer $TOKEN")
print_result $? "Get Event History"

# 6. Test invalid login
echo -e "\n${BLUE}Test 6: Invalid Login Test${NC}"
INVALID_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "wrong@example.com",
        "password": "wrongpassword"
    }')
ERROR_MESSAGE=$(echo $INVALID_LOGIN_RESPONSE | grep -o '"message":"[^"]*' | grep -o '[^"]*$')
if [[ $ERROR_MESSAGE == *"Invalid credentials"* ]]; then
    print_result 0 "Invalid Login Rejection"
else
    print_result 1 "Invalid Login Rejection"
fi

# 7. Test unauthorized access
echo -e "\n${BLUE}Test 7: Unauthorized Access Test${NC}"
UNAUTH_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile")
ERROR_MESSAGE=$(echo $UNAUTH_RESPONSE | grep -o '"message":"[^"]*' | grep -o '[^"]*$')
if [[ $ERROR_MESSAGE == *"No authentication token"* ]]; then
    print_result 0 "Unauthorized Access Rejection"
else
    print_result 1 "Unauthorized Access Rejection"
fi

# Print summary
echo -e "\n${BLUE}Test Summary:${NC}"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo -e "Total: $((PASS + FAIL))\n"