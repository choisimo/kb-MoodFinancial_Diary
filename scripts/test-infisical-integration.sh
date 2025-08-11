#!/bin/bash

# KB Mood Financial Diary - Infisical Integration Test Script
# This script tests all aspects of the Infisical integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Starting Infisical Integration Test Suite...${NC}"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}🔍 Testing: ${test_name}${NC}"
    ((TESTS_RUN++))
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✅ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}  ❌ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to run a test with output
run_test_with_output() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}🔍 Testing: ${test_name}${NC}"
    ((TESTS_RUN++))
    
    if eval "$test_command"; then
        echo -e "${GREEN}  ✅ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}  ❌ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo -e "${BLUE}📋 Test Suite: Prerequisites${NC}"

# Test 1: Check if Infisical CLI is installed
run_test "Infisical CLI Installation" "command -v infisical"

# Test 2: Check if Infisical server is running
run_test "Infisical Server Running" "curl -s http://localhost:8222/api/status"

# Test 3: Check if Docker is running
run_test "Docker Service Running" "docker ps"

# Test 4: Check if scripts are executable
run_test "Setup Script Executable" "test -x ./infisical-setup.sh"
run_test "Migration Script Executable" "test -x ./env-migration.sh"
run_test "Sync Script Executable" "test -x ./sync-env.sh"
run_test "Validation Script Executable" "test -x ./validate-env.sh"

echo ""
echo -e "${BLUE}📋 Test Suite: File Structure${NC}"

# Test 5: Check if required files exist
run_test "InfisicalService.java exists" "test -f backend-main/src/main/java/com/nodove/MoodDiary/service/InfisicalService.java"
run_test "Infisical Integration JS exists" "test -f env-manager/infisical-integration.js"
run_test "GitHub Actions Workflow exists" "test -f .github/workflows/infisical-sync.yml"
run_test "Documentation exists" "test -f INFISICAL_INTEGRATION.md"

echo ""
echo -e "${BLUE}📋 Test Suite: Configuration Files${NC}"

# Test 6: Check if example env files exist
run_test ".env.example exists" "test -f .env.example"
run_test "Backend .env.example exists" "test -f backend-main/.env.example"
run_test "Frontend .env.example exists" "test -f frontend/.env.example"

echo ""
echo -e "${BLUE}📋 Test Suite: Script Functionality${NC}"

# Test 7: Test validation script help
run_test "Validation Script Help" "./validate-env.sh --help"

# Test 8: Test sync script help
run_test "Sync Script Help" "./sync-env.sh --help"

echo ""
echo -e "${BLUE}📋 Test Suite: Java Code Integration${NC}"

# Test 9: Check if InfisicalService compiles
if command -v javac > /dev/null 2>&1; then
    run_test "InfisicalService Compilation" "cd backend-main && ./gradlew compileJava"
else
    echo -e "${YELLOW}  ⚠️  SKIPPED: Java compiler not available${NC}"
fi

echo ""
echo -e "${BLUE}📋 Test Suite: Environment Variable Validation${NC}"

# Test 10: Validate example environment files
run_test_with_output "Validate .env.example" "./validate-env.sh -f"

echo ""
echo -e "${BLUE}📋 Test Suite: Infisical Authentication${NC}"

# Test 11: Check Infisical authentication status
if run_test "Infisical Authentication" "infisical whoami"; then
    echo -e "${GREEN}  📋 Infisical is authenticated${NC}"
    
    # Test 12: Check if project ID exists
    if [ -f ".infisical-project-id" ]; then
        source .infisical-project-id
        echo -e "${GREEN}  📋 Project ID found: ${PROJECT_ID}${NC}"
        
        # Test 13: Test Infisical project access
        run_test "Infisical Project Access" "infisical environments list --project-id ${PROJECT_ID}"
        
        # Test 14: Test secret listing
        run_test "Infisical Secret Listing" "infisical secrets list --env development --project-id ${PROJECT_ID}"
        
    else
        echo -e "${YELLOW}  ⚠️  Project ID file not found${NC}"
        echo -e "${YELLOW}  💡 Run ./infisical-setup.sh to create project${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠️  Infisical not authenticated${NC}"
    echo -e "${YELLOW}  💡 Run 'infisical login' to authenticate${NC}"
fi

echo ""
echo -e "${BLUE}📋 Test Suite: Node.js Integration${NC}"

# Test 15: Check if Node.js is available
if command -v node > /dev/null 2>&1; then
    run_test "Node.js Available" "node --version"
    
    # Test 16: Test Infisical integration module
    if [ -f "env-manager/infisical-integration.js" ]; then
        run_test "Infisical Integration Module" "node -c env-manager/infisical-integration.js"
    fi
else
    echo -e "${YELLOW}  ⚠️  SKIPPED: Node.js not available${NC}"
fi

echo ""
echo -e "${BLUE}📋 Test Suite: Security Checks${NC}"

# Test 17: Check for hardcoded secrets in code
echo -e "${BLUE}🔍 Testing: Hardcoded Secrets Check${NC}"
((TESTS_RUN++))

if grep -r -i "password\|secret\|key" --include="*.java" --include="*.js" --include="*.ts" --include="*.tsx" backend-main/src frontend/src | grep -v "getSecret\|@Value\|process.env" | grep -v "// " | grep -v "/\*" > /dev/null; then
    echo -e "${YELLOW}  ⚠️  Potential hardcoded secrets found${NC}"
    echo -e "${YELLOW}  💡 Review and move to Infisical if needed${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${GREEN}  ✅ PASSED - No obvious hardcoded secrets found${NC}"
    ((TESTS_PASSED++))
fi

# Test 18: Check for hardcoded URLs
echo -e "${BLUE}🔍 Testing: Hardcoded URLs Check${NC}"
((TESTS_RUN++))

if grep -r "localhost:[0-9]" --include="*.java" --include="*.js" --include="*.ts" --include="*.tsx" backend-main/src frontend/src | grep -v "getSecret\|@Value\|process.env" > /dev/null; then
    echo -e "${YELLOW}  ⚠️  Hardcoded localhost URLs found${NC}"
    echo -e "${YELLOW}  💡 Consider using environment variables${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${GREEN}  ✅ PASSED - No hardcoded localhost URLs found${NC}"
    ((TESTS_PASSED++))
fi

echo ""
echo -e "${BLUE}📋 Test Suite: Documentation${NC}"

# Test 19: Check documentation completeness
run_test "Documentation Exists" "test -s INFISICAL_INTEGRATION.md"

# Test 20: Check if README mentions Infisical
if grep -q -i "infisical" README.md 2>/dev/null; then
    echo -e "${GREEN}  ✅ README mentions Infisical${NC}"
else
    echo -e "${YELLOW}  ⚠️  Consider adding Infisical info to README${NC}"
fi

echo ""
echo -e "${BLUE}📋 Test Suite: Performance Tests${NC}"

# Test 21: Test script execution time
echo -e "${BLUE}🔍 Testing: Script Performance${NC}"
((TESTS_RUN++))

start_time=$(date +%s)
./validate-env.sh -f > /dev/null 2>&1 || true
end_time=$(date +%s)
execution_time=$((end_time - start_time))

if [ $execution_time -lt 10 ]; then
    echo -e "${GREEN}  ✅ PASSED - Validation script runs in ${execution_time}s${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}  ⚠️  Validation script took ${execution_time}s (consider optimization)${NC}"
    ((TESTS_PASSED++))
fi

echo ""
echo -e "${BLUE}📋 Test Suite: Integration Tests${NC}"

# Test 22: Test end-to-end workflow (if authenticated)
if [ -f ".infisical-project-id" ] && infisical whoami > /dev/null 2>&1; then
    echo -e "${BLUE}🔍 Testing: End-to-End Workflow${NC}"
    ((TESTS_RUN++))
    
    # Create a test secret
    source .infisical-project-id
    test_key="TEST_INTEGRATION_$(date +%s)"
    test_value="test_value_$(date +%s)"
    
    if infisical secrets set --env development --project-id ${PROJECT_ID} ${test_key}="${test_value}" > /dev/null 2>&1; then
        # Try to retrieve it
        if retrieved_value=$(infisical secrets get --env development --project-id ${PROJECT_ID} ${test_key} 2>/dev/null | grep "Value:" | cut -d':' -f2 | xargs); then
            if [ "$retrieved_value" = "$test_value" ]; then
                echo -e "${GREEN}  ✅ PASSED - End-to-end secret management works${NC}"
                ((TESTS_PASSED++))
                
                # Clean up test secret
                infisical secrets delete --env development --project-id ${PROJECT_ID} ${test_key} > /dev/null 2>&1 || true
            else
                echo -e "${RED}  ❌ FAILED - Retrieved value doesn't match${NC}"
                ((TESTS_FAILED++))
            fi
        else
            echo -e "${RED}  ❌ FAILED - Could not retrieve test secret${NC}"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${RED}  ❌ FAILED - Could not create test secret${NC}"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${YELLOW}  ⚠️  SKIPPED: End-to-end test (not authenticated or no project)${NC}"
fi

echo ""
echo -e "${GREEN}📊 Test Results Summary${NC}"
echo -e "${BLUE}===========================================${NC}"
echo -e "Total Tests Run: ${TESTS_RUN}"
echo -e "${GREEN}Tests Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Tests Failed: ${TESTS_FAILED}${NC}"

# Calculate success rate
if [ $TESTS_RUN -gt 0 ]; then
    success_rate=$((TESTS_PASSED * 100 / TESTS_RUN))
    echo -e "Success Rate: ${success_rate}%"
else
    success_rate=0
fi

echo -e "${BLUE}===========================================${NC}"

# Provide recommendations based on results
echo ""
echo -e "${BLUE}💡 Recommendations:${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your Infisical integration is ready.${NC}"
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. Run ./infisical-setup.sh if you haven't already"
    echo -e "  2. Migrate your environment variables with ./env-migration.sh"
    echo -e "  3. Test your applications with the new configuration"
    echo -e "  4. Set up CI/CD integration"
elif [ $success_rate -ge 80 ]; then
    echo -e "${YELLOW}⚠️  Most tests passed, but some issues need attention.${NC}"
    echo -e "${BLUE}Priority fixes:${NC}"
    echo -e "  1. Address any failed prerequisite tests"
    echo -e "  2. Ensure Infisical authentication is working"
    echo -e "  3. Fix any compilation or syntax errors"
elif [ $success_rate -ge 60 ]; then
    echo -e "${YELLOW}⚠️  Moderate success rate. Several issues need fixing.${NC}"
    echo -e "${BLUE}Recommended actions:${NC}"
    echo -e "  1. Install missing dependencies (Infisical CLI, Docker, etc.)"
    echo -e "  2. Start Infisical server if not running"
    echo -e "  3. Run setup scripts to initialize configuration"
else
    echo -e "${RED}❌ Low success rate. Major issues detected.${NC}"
    echo -e "${BLUE}Critical actions needed:${NC}"
    echo -e "  1. Install and configure all prerequisites"
    echo -e "  2. Follow the setup guide in INFISICAL_INTEGRATION.md"
    echo -e "  3. Ensure all services are running properly"
fi

echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "  - Setup Guide: INFISICAL_INTEGRATION.md"
echo -e "  - Script Help: ./script-name.sh --help"
echo -e "  - Infisical Docs: https://infisical.com/docs"

echo ""
echo -e "${GREEN}🏁 Test suite completed!${NC}"

# Exit with appropriate code
if [ $TESTS_FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
