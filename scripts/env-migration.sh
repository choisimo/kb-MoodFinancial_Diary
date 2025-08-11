#!/bin/bash

# KB Mood Financial Diary - Environment Variables Migration Script
# This script migrates existing .env files to Infisical

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

echo -e "${GREEN}🚀 Starting environment variables migration to Infisical...${NC}"

# Load project ID
if [ -f ".infisical-project-id" ]; then
    source .infisical-project-id
    echo -e "${BLUE}📋 Using project ID: ${PROJECT_ID}${NC}"
else
    echo -e "${RED}❌ Project ID not found. Please run infisical-setup.sh first.${NC}"
    exit 1
fi

# Function to clean and normalize environment variables
normalize_env_vars() {
    local env_file="$1"
    local temp_file=$(mktemp)
    
    echo -e "${BLUE}🧹 Normalizing environment variables from ${env_file}...${NC}"
    
    # Read the env file and normalize variables
    while IFS= read -r line || [[ -n "$line" ]]; do
        # Skip empty lines and comments
        if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi
        
        # Extract key=value pairs
        if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            
            # Remove leading/trailing whitespace from key
            key=$(echo "$key" | xargs)
            
            # Remove quotes from value if present
            value=$(echo "$value" | sed 's/^["'\'']\(.*\)["'\'']$/\1/')
            
            # Apply normalization rules
            case "$key" in
                # OAuth2 normalization
                "GOOGLE_OAUTH_CLIENT_ID")
                    key="OAUTH2_GOOGLE_CLIENT_ID"
                    ;;
                "GOOGLE_OAUTH_CLIENT_SECRET")
                    key="OAUTH2_GOOGLE_CLIENT_SECRET"
                    ;;
                "KAKAO_OAUTH_CLIENT_ID")
                    key="OAUTH2_KAKAO_CLIENT_ID"
                    ;;
                "KAKAO_OAUTH_CLIENT_SECRET")
                    key="OAUTH2_KAKAO_CLIENT_SECRET"
                    ;;
                # Database normalization - prefer individual variables over DATABASE_URL
                "DATABASE_URL"|"DATABASE_USERNAME"|"DATABASE_PASSWORD")
                    # Skip these, use individual DB_* variables instead
                    continue
                    ;;
                # SMTP normalization
                "MAIL_HOST")
                    key="SMTP_HOST"
                    ;;
                "MAIL_PORT")
                    key="SMTP_PORT"
                    ;;
                "MAIL_USERNAME")
                    key="SMTP_USERNAME"
                    ;;
                "MAIL_PASSWORD")
                    key="SMTP_PASSWORD"
                    ;;
            esac
            
            # Skip empty values for sensitive keys
            if [[ -z "$value" || "$value" == "your_"* || "$value" == "your-"* ]]; then
                case "$key" in
                    *"SECRET"*|*"PASSWORD"*|*"TOKEN"*|*"KEY"*)
                        echo -e "${YELLOW}⚠️  Skipping ${key} (empty or placeholder value)${NC}"
                        continue
                        ;;
                esac
            fi
            
            echo "${key}=${value}" >> "$temp_file"
        fi
    done < "$env_file"
    
    echo "$temp_file"
}

# Function to upload environment variables to Infisical
upload_to_infisical() {
    local env_file="$1"
    local environment="$2"
    
    echo -e "${BLUE}📤 Uploading variables from ${env_file} to ${environment} environment...${NC}"
    
    # Normalize the environment file
    normalized_file=$(normalize_env_vars "$env_file")
    
    # Count variables
    var_count=$(wc -l < "$normalized_file")
    echo -e "${BLUE}📊 Found ${var_count} variables to upload${NC}"
    
    # Upload to Infisical
    if [ -s "$normalized_file" ]; then
        # Use infisical CLI to import secrets
        if infisical secrets import --env "$environment" --project-id "$PROJECT_ID" --path "/" --format dotenv < "$normalized_file"; then
            echo -e "${GREEN}✅ Successfully uploaded ${var_count} variables to ${environment}${NC}"
        else
            echo -e "${RED}❌ Failed to upload variables to ${environment}${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  No variables to upload from ${env_file}${NC}"
    fi
    
    # Clean up temporary file
    rm -f "$normalized_file"
}

# Function to create consolidated environment variables
create_consolidated_vars() {
    local environment="$1"
    
    echo -e "${BLUE}🔧 Creating consolidated variables for ${environment}...${NC}"
    
    # Define consolidated variables based on environment
    case "$environment" in
        "development")
            cat << EOF | infisical secrets import --env "$environment" --project-id "$PROJECT_ID" --path "/" --format dotenv
# Consolidated Development Settings
FRONTEND_URL=http://localhost:8087
CORS_ALLOWED_ORIGINS=http://localhost:8087,http://localhost:8080,http://localhost:3000
BACKEND_PORT=8090
FRONTEND_PORT=8087
NGINX_PORT=8080
SPRING_PROFILES_ACTIVE=dev
NODE_ENV=development
# AI Service Settings
OPENROUTER_MODEL=qwen/qwen2.5-vl-72b-instruct:free
# Database Settings (consolidated)
DATABASE_SHOW_SQL=true
JPA_HIBERNATE_DDL_AUTO=update
EOF
            ;;
        "staging")
            cat << EOF | infisical secrets import --env "$environment" --project-id "$PROJECT_ID" --path "/" --format dotenv
# Consolidated Staging Settings
FRONTEND_URL=http://localhost:8087
CORS_ALLOWED_ORIGINS=http://localhost:8087,http://localhost:8080
BACKEND_PORT=8090
FRONTEND_PORT=8087
NGINX_PORT=8080
SPRING_PROFILES_ACTIVE=staging
NODE_ENV=staging
# AI Service Settings
OPENROUTER_MODEL=qwen/qwen2.5-vl-72b-instruct:free
# Database Settings (consolidated)
DATABASE_SHOW_SQL=false
JPA_HIBERNATE_DDL_AUTO=validate
EOF
            ;;
        "production")
            cat << EOF | infisical secrets import --env "$environment" --project-id "$PROJECT_ID" --path "/" --format dotenv
# Consolidated Production Settings
FRONTEND_URL=https://your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com
BACKEND_PORT=8090
FRONTEND_PORT=80
NGINX_PORT=80
SPRING_PROFILES_ACTIVE=prod
NODE_ENV=production
# AI Service Settings
OPENROUTER_MODEL=qwen/qwen2.5-vl-72b-instruct:free
# Database Settings (consolidated)
DATABASE_SHOW_SQL=false
JPA_HIBERNATE_DDL_AUTO=validate
EOF
            ;;
    esac
    
    echo -e "${GREEN}✅ Created consolidated variables for ${environment}${NC}"
}

# Main migration function
migrate_environments() {
    echo -e "${BLUE}🔄 Starting migration process...${NC}"
    
    # Migration mapping: file -> environment
    declare -A migration_map=(
        [".env.example"]="development"
        ["backend-main/.env.example"]="development"
        ["frontend/.env.example"]="development"
        [".env.staging"]="staging"
        [".env.production"]="production"
    )
    
    # Migrate existing files
    for file in "${!migration_map[@]}"; do
        env="${migration_map[$file]}"
        
        if [ -f "$file" ]; then
            echo -e "${BLUE}📁 Processing ${file} -> ${env}${NC}"
            upload_to_infisical "$file" "$env"
        else
            echo -e "${YELLOW}⚠️  File not found: ${file}${NC}"
        fi
    done
    
    # Create consolidated variables for each environment
    for env in "development" "staging" "production"; do
        create_consolidated_vars "$env"
    done
}

# Function to validate migration
validate_migration() {
    echo -e "${BLUE}🔍 Validating migration...${NC}"
    
    for env in "development" "staging" "production"; do
        echo -e "${BLUE}  Checking ${env} environment...${NC}"
        
        # List secrets in environment
        secret_count=$(infisical secrets list --env "$env" --project-id "$PROJECT_ID" --format json | jq length)
        echo -e "${GREEN}    ✅ ${env}: ${secret_count} secrets${NC}"
        
        # Check for required variables
        required_vars=("JWT_SECRET" "DB_HOST" "DB_NAME" "FRONTEND_URL" "CORS_ALLOWED_ORIGINS")
        
        for var in "${required_vars[@]}"; do
            if infisical secrets get --env "$env" --project-id "$PROJECT_ID" "$var" > /dev/null 2>&1; then
                echo -e "${GREEN}      ✅ ${var} exists${NC}"
            else
                echo -e "${RED}      ❌ ${var} missing${NC}"
            fi
        done
    done
}

# Main execution
main() {
    echo -e "${GREEN}🎯 Starting environment migration process...${NC}"
    
    # Check if Infisical CLI is available
    if ! command -v infisical &> /dev/null; then
        echo -e "${RED}❌ Infisical CLI not found. Please install it first.${NC}"
        exit 1
    fi
    
    # Check if logged in
    if ! infisical whoami > /dev/null 2>&1; then
        echo -e "${RED}❌ Not logged into Infisical. Please run 'infisical login' first.${NC}"
        exit 1
    fi
    
    migrate_environments
    validate_migration
    
    echo ""
    echo -e "${GREEN}🎉 Environment migration completed successfully!${NC}"
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo -e "  1. Update your application code to use Infisical SDK"
    echo -e "  2. Test the synchronization scripts"
    echo -e "  3. Update your CI/CD pipelines"
    echo ""
}

# Run main function
main "$@"
