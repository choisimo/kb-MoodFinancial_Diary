#!/bin/bash

# KB Mood Financial Diary - Environment Variables Validation Script
# This script validates environment variables for consistency and completeness

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INFISICAL_HOST="http://localhost:8222"
PROJECT_NAME="kb-mood-diary"

echo -e "${GREEN}🔍 Starting environment variables validation...${NC}"

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --env ENVIRONMENT    Environment to validate (development, staging, production)"
    echo "  -a, --all               Validate all environments"
    echo "  -i, --infisical         Validate Infisical configuration"
    echo "  -f, --files             Validate local .env files"
    echo "  -c, --consistency       Check consistency between environments"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e development        # Validate development environment"
    echo "  $0 --all                 # Validate all environments"
    echo "  $0 -i -f                 # Validate both Infisical and files"
}

# Parse command line arguments
ENVIRONMENT=""
VALIDATE_ALL=false
VALIDATE_INFISICAL=false
VALIDATE_FILES=false
CHECK_CONSISTENCY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -a|--all)
            VALIDATE_ALL=true
            shift
            ;;
        -i|--infisical)
            VALIDATE_INFISICAL=true
            shift
            ;;
        -f|--files)
            VALIDATE_FILES=true
            shift
            ;;
        -c|--consistency)
            CHECK_CONSISTENCY=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Set defaults if no specific validation requested
if [ "$VALIDATE_INFISICAL" = false ] && [ "$VALIDATE_FILES" = false ] && [ "$CHECK_CONSISTENCY" = false ]; then
    VALIDATE_INFISICAL=true
    VALIDATE_FILES=true
fi

# Load project ID if validating Infisical
if [ "$VALIDATE_INFISICAL" = true ]; then
    if [ -f ".infisical-project-id" ]; then
        source .infisical-project-id
        echo -e "${BLUE}📋 Using project ID: ${PROJECT_ID}${NC}"
    else
        echo -e "${YELLOW}⚠️  Project ID not found. Infisical validation will be limited.${NC}"
    fi
fi

# Function to validate environment file
validate_env_file() {
    local file="$1"
    local env_name="$2"
    
    echo -e "${BLUE}📄 Validating ${file} (${env_name})...${NC}"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}  ❌ File not found: ${file}${NC}"
        return 1
    fi
    
    local errors=0
    local warnings=0
    
    # Define required variables based on environment
    local required_vars=()
    local sensitive_vars=()
    
    case "$env_name" in
        "development")
            required_vars=("JWT_SECRET" "DB_HOST" "DB_NAME" "DB_USER" "FRONTEND_URL" "CORS_ALLOWED_ORIGINS" "BACKEND_PORT")
            sensitive_vars=("JWT_SECRET" "DB_PASSWORD" "OAUTH2_GOOGLE_CLIENT_SECRET" "OAUTH2_KAKAO_CLIENT_SECRET")
            ;;
        "staging"|"production")
            required_vars=("JWT_SECRET" "DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD" "FRONTEND_URL" "CORS_ALLOWED_ORIGINS" "BACKEND_PORT")
            sensitive_vars=("JWT_SECRET" "DB_PASSWORD" "OAUTH2_GOOGLE_CLIENT_SECRET" "OAUTH2_KAKAO_CLIENT_SECRET" "SMTP_PASSWORD")
            ;;
        *)
            required_vars=("JWT_SECRET" "DB_HOST" "DB_NAME" "FRONTEND_URL")
            sensitive_vars=("JWT_SECRET" "DB_PASSWORD")
            ;;
    esac
    
    # Check required variables
    echo -e "${BLUE}  🔍 Checking required variables...${NC}"
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" "$file"; then
            value=$(grep "^${var}=" "$file" | cut -d'=' -f2- | xargs)
            if [ -z "$value" ] || [[ "$value" == "your_"* ]] || [[ "$value" == "your-"* ]]; then
                echo -e "${RED}    ❌ ${var}: Empty or placeholder value${NC}"
                ((errors++))
            else
                echo -e "${GREEN}    ✅ ${var}${NC}"
            fi
        else
            echo -e "${RED}    ❌ ${var}: Missing${NC}"
            ((errors++))
        fi
    done
    
    # Check sensitive variables
    echo -e "${BLUE}  🔐 Checking sensitive variables...${NC}"
    for var in "${sensitive_vars[@]}"; do
        if grep -q "^${var}=" "$file"; then
            value=$(grep "^${var}=" "$file" | cut -d'=' -f2- | xargs)
            if [ -z "$value" ] || [[ "$value" == "your_"* ]] || [[ "$value" == "your-"* ]]; then
                echo -e "${YELLOW}    ⚠️  ${var}: Empty or placeholder value${NC}"
                ((warnings++))
            else
                # Check JWT_SECRET length
                if [ "$var" = "JWT_SECRET" ]; then
                    if [ ${#value} -lt 32 ]; then
                        echo -e "${RED}    ❌ ${var}: Too short (${#value} chars, minimum 32)${NC}"
                        ((errors++))
                    else
                        echo -e "${GREEN}    ✅ ${var}: Adequate length (${#value} chars)${NC}"
                    fi
                else
                    echo -e "${GREEN}    ✅ ${var}: Configured${NC}"
                fi
            fi
        else
            echo -e "${YELLOW}    ⚠️  ${var}: Missing${NC}"
            ((warnings++))
        fi
    done
    
    # Check for deprecated variables
    echo -e "${BLUE}  🗑️  Checking for deprecated variables...${NC}"
    deprecated_vars=("GOOGLE_OAUTH_CLIENT_ID" "GOOGLE_OAUTH_CLIENT_SECRET" "KAKAO_OAUTH_CLIENT_ID" "KAKAO_OAUTH_CLIENT_SECRET" "DATABASE_URL" "DATABASE_USERNAME" "DATABASE_PASSWORD" "MAIL_HOST" "MAIL_PORT" "MAIL_USERNAME" "MAIL_PASSWORD")
    
    for var in "${deprecated_vars[@]}"; do
        if grep -q "^${var}=" "$file"; then
            echo -e "${YELLOW}    ⚠️  ${var}: Deprecated variable found${NC}"
            ((warnings++))
        fi
    done
    
    # Check for consistency issues
    echo -e "${BLUE}  🔄 Checking consistency...${NC}"
    
    # Check CORS and FRONTEND_URL consistency
    if grep -q "^FRONTEND_URL=" "$file" && grep -q "^CORS_ALLOWED_ORIGINS=" "$file"; then
        frontend_url=$(grep "^FRONTEND_URL=" "$file" | cut -d'=' -f2- | xargs)
        cors_origins=$(grep "^CORS_ALLOWED_ORIGINS=" "$file" | cut -d'=' -f2- | xargs)
        
        if [[ "$cors_origins" == *"$frontend_url"* ]]; then
            echo -e "${GREEN}    ✅ FRONTEND_URL is included in CORS_ALLOWED_ORIGINS${NC}"
        else
            echo -e "${YELLOW}    ⚠️  FRONTEND_URL not found in CORS_ALLOWED_ORIGINS${NC}"
            ((warnings++))
        fi
    fi
    
    # Check port consistency
    if grep -q "^BACKEND_PORT=" "$file" && grep -q "^FRONTEND_URL=" "$file"; then
        backend_port=$(grep "^BACKEND_PORT=" "$file" | cut -d'=' -f2- | xargs)
        frontend_url=$(grep "^FRONTEND_URL=" "$file" | cut -d'=' -f2- | xargs)
        
        # Extract port from frontend URL if it contains one
        if [[ "$frontend_url" =~ :([0-9]+) ]]; then
            frontend_port="${BASH_REMATCH[1]}"
            if [ "$backend_port" = "$frontend_port" ]; then
                echo -e "${YELLOW}    ⚠️  BACKEND_PORT and FRONTEND_URL use same port: ${backend_port}${NC}"
                ((warnings++))
            else
                echo -e "${GREEN}    ✅ BACKEND_PORT (${backend_port}) and FRONTEND_URL port (${frontend_port}) are different${NC}"
            fi
        fi
    fi
    
    # Summary for this file
    echo -e "${BLUE}  📊 Summary for ${file}:${NC}"
    echo -e "    Errors: ${errors}"
    echo -e "    Warnings: ${warnings}"
    
    if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
        echo -e "${GREEN}  ✅ Validation passed${NC}"
        return 0
    elif [ $errors -eq 0 ]; then
        echo -e "${YELLOW}  ⚠️  Validation passed with warnings${NC}"
        return 0
    else
        echo -e "${RED}  ❌ Validation failed${NC}"
        return 1
    fi
}

# Function to validate Infisical environment
validate_infisical_env() {
    local env="$1"
    
    echo -e "${BLUE}🔍 Validating Infisical ${env} environment...${NC}"
    
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}  ❌ Project ID not available${NC}"
        return 1
    fi
    
    # Check if Infisical CLI is available
    if ! command -v infisical &> /dev/null; then
        echo -e "${RED}  ❌ Infisical CLI not found${NC}"
        return 1
    fi
    
    # Check if logged in
    if ! infisical whoami > /dev/null 2>&1; then
        echo -e "${RED}  ❌ Not logged into Infisical${NC}"
        return 1
    fi
    
    # List secrets in environment
    echo -e "${BLUE}  📋 Listing secrets in ${env}...${NC}"
    
    if ! secret_count=$(infisical secrets list --env "$env" --project-id "$PROJECT_ID" --format json 2>/dev/null | jq length 2>/dev/null); then
        echo -e "${RED}  ❌ Failed to list secrets in ${env}${NC}"
        return 1
    fi
    
    echo -e "${GREEN}  ✅ Found ${secret_count} secrets in ${env}${NC}"
    
    # Check for required secrets
    required_secrets=("JWT_SECRET" "DB_HOST" "DB_NAME" "FRONTEND_URL" "CORS_ALLOWED_ORIGINS" "OPENROUTER_MODEL")
    
    local missing_secrets=()
    
    for secret in "${required_secrets[@]}"; do
        if infisical secrets get --env "$env" --project-id "$PROJECT_ID" "$secret" > /dev/null 2>&1; then
            echo -e "${GREEN}    ✅ ${secret}${NC}"
        else
            echo -e "${RED}    ❌ ${secret}: Missing${NC}"
            missing_secrets+=("$secret")
        fi
    done
    
    if [ ${#missing_secrets[@]} -eq 0 ]; then
        echo -e "${GREEN}  ✅ All required secrets found in ${env}${NC}"
        return 0
    else
        echo -e "${RED}  ❌ Missing secrets in ${env}: ${missing_secrets[*]}${NC}"
        return 1
    fi
}

# Function to check consistency between environments
check_consistency() {
    echo -e "${BLUE}🔄 Checking consistency between environments...${NC}"
    
    # Define files to check
    declare -A env_files=(
        ["development"]=".env"
        ["staging"]=".env.staging"
        ["production"]=".env.production"
    )
    
    # Variables that should be consistent across environments
    consistent_vars=("BACKEND_PORT" "OPENROUTER_MODEL" "CORS_ALLOWED_METHODS")
    
    # Variables that should be different across environments
    different_vars=("FRONTEND_URL" "DB_HOST" "SPRING_PROFILES_ACTIVE" "NODE_ENV")
    
    echo -e "${BLUE}  🔍 Checking variables that should be consistent...${NC}"
    
    for var in "${consistent_vars[@]}"; do
        echo -e "${BLUE}    Checking ${var}...${NC}"
        
        local values=()
        local found_files=()
        
        for env in "${!env_files[@]}"; do
            file="${env_files[$env]}"
            if [ -f "$file" ] && grep -q "^${var}=" "$file"; then
                value=$(grep "^${var}=" "$file" | cut -d'=' -f2- | xargs)
                values+=("$value")
                found_files+=("$file")
            fi
        done
        
        if [ ${#values[@]} -gt 1 ]; then
            # Check if all values are the same
            first_value="${values[0]}"
            all_same=true
            
            for value in "${values[@]}"; do
                if [ "$value" != "$first_value" ]; then
                    all_same=false
                    break
                fi
            done
            
            if [ "$all_same" = true ]; then
                echo -e "${GREEN}      ✅ ${var}: Consistent across files (${first_value})${NC}"
            else
                echo -e "${YELLOW}      ⚠️  ${var}: Inconsistent values found${NC}"
                for i in "${!found_files[@]}"; do
                    echo -e "${YELLOW}        ${found_files[$i]}: ${values[$i]}${NC}"
                done
            fi
        fi
    done
    
    echo -e "${BLUE}  🔍 Checking variables that should be different...${NC}"
    
    for var in "${different_vars[@]}"; do
        echo -e "${BLUE}    Checking ${var}...${NC}"
        
        local values=()
        local found_files=()
        
        for env in "${!env_files[@]}"; do
            file="${env_files[$env]}"
            if [ -f "$file" ] && grep -q "^${var}=" "$file"; then
                value=$(grep "^${var}=" "$file" | cut -d'=' -f2- | xargs)
                values+=("$value")
                found_files+=("$file")
            fi
        done
        
        if [ ${#values[@]} -gt 1 ]; then
            # Check if values are different
            first_value="${values[0]}"
            all_same=true
            
            for value in "${values[@]}"; do
                if [ "$value" != "$first_value" ]; then
                    all_same=false
                    break
                fi
            done
            
            if [ "$all_same" = false ]; then
                echo -e "${GREEN}      ✅ ${var}: Properly differentiated across environments${NC}"
            else
                echo -e "${YELLOW}      ⚠️  ${var}: Same value across environments (${first_value})${NC}"
                echo -e "${YELLOW}        This might be intentional, but please verify${NC}"
            fi
        fi
    done
}

# Main validation function
main() {
    echo -e "${GREEN}🎯 Starting validation process...${NC}"
    
    local overall_success=true
    
    # Validate files if requested
    if [ "$VALIDATE_FILES" = true ]; then
        echo -e "${BLUE}📄 Validating local .env files...${NC}"
        
        if [ "$VALIDATE_ALL" = true ]; then
            # Validate all environment files
            declare -A files_to_validate=(
                [".env"]="development"
                [".env.staging"]="staging"
                [".env.production"]="production"
                ["backend-main/.env"]="development"
                ["frontend/.env"]="development"
            )
            
            for file in "${!files_to_validate[@]}"; do
                env_name="${files_to_validate[$file]}"
                if ! validate_env_file "$file" "$env_name"; then
                    overall_success=false
                fi
                echo ""
            done
        elif [ -n "$ENVIRONMENT" ]; then
            # Validate specific environment
            case "$ENVIRONMENT" in
                "development")
                    validate_env_file ".env" "development"
                    ;;
                "staging")
                    validate_env_file ".env.staging" "staging"
                    ;;
                "production")
                    validate_env_file ".env.production" "production"
                    ;;
                *)
                    validate_env_file ".env.${ENVIRONMENT}" "$ENVIRONMENT"
                    ;;
            esac
        else
            # Default to development
            validate_env_file ".env" "development"
        fi
    fi
    
    # Validate Infisical if requested
    if [ "$VALIDATE_INFISICAL" = true ] && [ -n "$PROJECT_ID" ]; then
        echo -e "${BLUE}🔐 Validating Infisical environments...${NC}"
        
        if [ "$VALIDATE_ALL" = true ]; then
            for env in "development" "staging" "production"; do
                if ! validate_infisical_env "$env"; then
                    overall_success=false
                fi
                echo ""
            done
        elif [ -n "$ENVIRONMENT" ]; then
            if ! validate_infisical_env "$ENVIRONMENT"; then
                overall_success=false
            fi
        else
            if ! validate_infisical_env "development"; then
                overall_success=false
            fi
        fi
    fi
    
    # Check consistency if requested
    if [ "$CHECK_CONSISTENCY" = true ]; then
        check_consistency
        echo ""
    fi
    
    # Final summary
    echo -e "${BLUE}📊 Validation Summary:${NC}"
    if [ "$overall_success" = true ]; then
        echo -e "${GREEN}✅ All validations passed successfully!${NC}"
        echo -e "${BLUE}💡 Recommendations:${NC}"
        echo -e "  - Regularly sync environment variables from Infisical"
        echo -e "  - Keep sensitive values in Infisical, not in local files"
        echo -e "  - Review and update placeholder values"
        echo -e "  - Test applications after environment changes"
    else
        echo -e "${RED}❌ Some validations failed${NC}"
        echo -e "${BLUE}💡 Next steps:${NC}"
        echo -e "  - Fix missing or invalid environment variables"
        echo -e "  - Update Infisical with correct values"
        echo -e "  - Sync environment variables using sync-env.sh"
        echo -e "  - Re-run validation after fixes"
    fi
}

# Run main function
main "$@"
