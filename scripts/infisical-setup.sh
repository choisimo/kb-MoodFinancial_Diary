#!/bin/bash

# KB Mood Financial Diary - Infisical Setup Script (PRD Implementation)
# This script sets up Infisical projects and environments for the KB Mood Financial Diary project
# Updated for latest Infisical CLI compatibility

set -e

echo "🚀 Starting Infisical setup for KB Mood Financial Diary (PRD Implementation)..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
INFISICAL_HOST="${INFISICAL_API_URL:-http://localhost:8222}"
PROJECT_NAME="MoodFinancial-Diary"
ENVIRONMENTS=("development" "staging" "production")
SERVICES=("backend" "frontend" "ai")

echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "  Host: ${INFISICAL_HOST}"
echo -e "  Project: ${PROJECT_NAME}"
echo -e "  Environments: ${ENVIRONMENTS[*]}"
echo -e "  Services: ${SERVICES[*]}"
echo ""

# Function to check if Infisical CLI is installed
check_infisical_cli() {
    echo -e "${BLUE}🔍 Checking Infisical CLI installation...${NC}"
    if ! command -v infisical &> /dev/null; then
        echo -e "${RED}❌ Infisical CLI is not installed${NC}"
        echo -e "${YELLOW}💡 Please install Infisical CLI:${NC}"
        echo -e "  curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash"
        echo -e "  sudo apt-get update && sudo apt-get install infisical"
        exit 1
    else
        echo -e "${GREEN}✅ Infisical CLI is installed${NC}"
        infisical --version
    fi
}

# Function to check if Infisical is running
check_infisical_running() {
    echo -e "${BLUE}🔍 Checking if Infisical is running...${NC}"
    if curl -s "${INFISICAL_HOST}/api/status" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Infisical is running at ${INFISICAL_HOST}${NC}"
    else
        echo -e "${RED}❌ Infisical is not running at ${INFISICAL_HOST}${NC}"
        echo -e "${YELLOW}💡 Please start Infisical using: docker-compose up -d infisical${NC}"
        exit 1
    fi
}

# Function to login to Infisical
login_infisical() {
    echo -e "${BLUE}🔐 Logging into Infisical...${NC}"
    echo -e "${YELLOW}Please follow the instructions to authenticate with Infisical${NC}"
    
    # Set the domain for CLI
    export INFISICAL_API_URL="${INFISICAL_HOST}/api"
    
    # Login (this will open browser or provide CLI instructions)
    if infisical login --domain "${INFISICAL_HOST}/api"; then
        echo -e "${GREEN}✅ Successfully logged into Infisical${NC}"
    else
        echo -e "${RED}❌ Failed to login to Infisical${NC}"
        exit 1
    fi
}

# Function to create project
create_project() {
    echo -e "${BLUE}📁 Creating project: ${PROJECT_NAME}${NC}"
    
    # Check if project already exists using init command
    if [ -f ".infisical.json" ] && grep -q "${PROJECT_NAME}" .infisical.json 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Project ${PROJECT_NAME} already initialized${NC}"
        PROJECT_ID=$(cat .infisical.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    else
        # Initialize new project (this will create the project if it doesn't exist)
        echo -e "${BLUE}Please select or create project '${PROJECT_NAME}' when prompted${NC}"
        if infisical init; then
            echo -e "${GREEN}✅ Initialized project: ${PROJECT_NAME}${NC}"
            if [ -f ".infisical.json" ]; then
                PROJECT_ID=$(cat .infisical.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
            else
                echo -e "${RED}❌ Failed to find project ID in .infisical.json${NC}"
                exit 1
            fi
        else
            echo -e "${RED}❌ Failed to initialize project${NC}"
            exit 1
        fi
    fi
    
    echo "PROJECT_ID=${PROJECT_ID}" > .infisical-project-id
    echo -e "${BLUE}💾 Saved project ID to .infisical-project-id${NC}"
}

# Function to setup project structure
setup_project_structure() {
    echo -e "${BLUE}🏗️  Setting up project structure...${NC}"
    
    # Get project ID
    if [ -f ".infisical-project-id" ]; then
        source .infisical-project-id
    else
        echo -e "${RED}❌ Project ID not found. Please run create_project first.${NC}"
        exit 1
    fi
    
    echo -e "${PURPLE}📂 Creating folder structure for environments and services:${NC}"
    
    for env in "${ENVIRONMENTS[@]}"; do
        echo -e "${BLUE}  Environment: ${env}${NC}"
        
        for service in "${SERVICES[@]}"; do
            folder_path="/${service}"
            echo -e "    Creating folder: ${folder_path}"
            
            # Note: Folder creation via CLI is not directly supported in current Infisical CLI
            # This will be handled by creating secrets with the appropriate paths
            echo -e "    ${YELLOW}Folder will be created when secrets are added${NC}"
        done
    done
}

# Function to migrate secrets from .env files
migrate_secrets() {
    echo -e "${BLUE}🔄 Migrating secrets from .env files...${NC}"
    
    # Get project ID
    if [ -f ".infisical-project-id" ]; then
        source .infisical-project-id
    else
        echo -e "${RED}❌ Project ID not found. Please run create_project first.${NC}"
        exit 1
    fi
    
    # Backend secrets migration
    echo -e "${PURPLE}🔧 Migrating Backend secrets...${NC}"
    migrate_backend_secrets
    
    # Frontend secrets migration
    echo -e "${PURPLE}🎨 Migrating Frontend secrets...${NC}"
    migrate_frontend_secrets
    
    # AI service secrets migration
    echo -e "${PURPLE}🤖 Migrating AI service secrets...${NC}"
    migrate_ai_secrets
}

# Function to migrate backend secrets
migrate_backend_secrets() {
    local env_files=(".env" ".env.staging" ".env.production")
    local environments=("development" "staging" "production")
    
    for i in "${!env_files[@]}"; do
        local env_file="${env_files[$i]}"
        local env="${environments[$i]}"
        
        if [ -f "$env_file" ]; then
            echo -e "  ${BLUE}Processing $env_file for $env environment${NC}"
            
            # Read and process each line
            while IFS= read -r line || [[ -n "$line" ]]; do
                # Skip comments and empty lines
                if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
                    continue
                fi
                
                # Extract key=value pairs
                if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
                    local key="${BASH_REMATCH[1]}"
                    local value="${BASH_REMATCH[2]}"
                    
                    # Remove quotes from value
                    value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']*$//')
                    
                    # Skip empty values
                    if [ -z "$value" ]; then
                        continue
                    fi
                    
                    # Determine if this is a backend secret
                    if is_backend_secret "$key"; then
                        echo -e "    ${GREEN}Setting backend secret: $key${NC}"
                        if ! infisical secrets set "$key" "$value" --env "$env" --path "/backend" --projectId "$PROJECT_ID" 2>/dev/null; then
                            echo -e "    ${YELLOW}⚠️  Failed to set $key (environment may not exist)${NC}"
                        fi
                    fi
                fi
            done < "$env_file"
        else
            echo -e "  ${YELLOW}⚠️  $env_file not found, skipping${NC}"
        fi
    done
}

# Function to migrate frontend secrets
migrate_frontend_secrets() {
    # Frontend secrets are typically in environment-specific files or hardcoded
    local frontend_secrets=(
        "REACT_APP_API_BASE_URL=http://localhost:8090"
        "REACT_APP_AI_API_URL=http://localhost:8085"
        "VITE_KAKAO_MAP_KEY=your-kakao-map-key"
    )
    
    for env in "${ENVIRONMENTS[@]}"; do
        echo -e "  ${BLUE}Setting frontend secrets for $env${NC}"
        
        for secret in "${frontend_secrets[@]}"; do
            local key=$(echo "$secret" | cut -d'=' -f1)
            local value=$(echo "$secret" | cut -d'=' -f2-)
            
            # Adjust values based on environment
            case "$env" in
                "staging")
                    value=$(echo "$value" | sed 's/localhost:8090/staging-api.yourdomain.com/g')
                    value=$(echo "$value" | sed 's/localhost:8085/staging-ai.yourdomain.com/g')
                    ;;
                "production")
                    value=$(echo "$value" | sed 's/localhost:8090/api.yourdomain.com/g')
                    value=$(echo "$value" | sed 's/localhost:8085/ai.yourdomain.com/g')
                    ;;
            esac
            
            echo -e "    ${GREEN}Setting frontend secret: $key${NC}"
            if ! infisical secrets set "$key" "$value" --env "$env" --path "/frontend" --projectId "$PROJECT_ID" 2>/dev/null; then
                echo -e "    ${YELLOW}⚠️  Failed to set $key (environment may not exist)${NC}"
            fi
        done
    done
}

# Function to migrate AI service secrets
migrate_ai_secrets() {
    local ai_secrets=(
        "GOOGLE_GEMINI_API_KEY=your-gemini-api-key"
        "MONGODB_URI=mongodb://mongodb:27017/"
        "MONGODB_DB_NAME=ai_analysis"
        "KAFKA_BOOTSTRAP_SERVERS=kafka:9092"
        "OPENROUTER_MODEL=qwen/qwen2.5-vl-72b-instruct:free"
    )
    
    for env in "${ENVIRONMENTS[@]}"; do
        echo -e "  ${BLUE}Setting AI service secrets for $env${NC}"
        
        for secret in "${ai_secrets[@]}"; do
            local key=$(echo "$secret" | cut -d'=' -f1)
            local value=$(echo "$secret" | cut -d'=' -f2-)
            
            echo -e "    ${GREEN}Setting AI secret: $key${NC}"
            if ! infisical secrets set "$key" "$value" --env "$env" --path "/ai" --projectId "$PROJECT_ID" 2>/dev/null; then
                echo -e "    ${YELLOW}⚠️  Failed to set $key (environment may not exist)${NC}"
            fi
        done
    done
}

# Function to check if a key is a backend secret
is_backend_secret() {
    local key="$1"
    local backend_patterns=(
        "^DB_"
        "^DATABASE_"
        "^REDIS_"
        "^JWT_"
        "^OAUTH2_"
        "^GOOGLE_"
        "^KAKAO_"
        "^SMTP_"
        "^MAIL_"
        "^FIREBASE_"
        "^SERVER_"
        "^SPRING_"
        "^CORS_"
        "^FRONTEND_URL$"
        "^UPLOAD_PATH$"
        "^MAX_FILE_SIZE$"
    )
    
    for pattern in "${backend_patterns[@]}"; do
        if [[ "$key" =~ $pattern ]]; then
            return 0
        fi
    done
    
    return 1
}

# Function to create service tokens
create_service_tokens() {
    echo -e "${BLUE}🔑 Service Token Creation Guide${NC}"
    echo -e "${YELLOW}Service tokens need to be created manually in the Infisical UI${NC}"
    echo -e "${YELLOW}Please follow these steps for each environment:${NC}"
    echo ""
    
    # Get project ID
    if [ -f ".infisical-project-id" ]; then
        source .infisical-project-id
    else
        echo -e "${RED}❌ Project ID not found${NC}"
        return 1
    fi
    
    for env in "${ENVIRONMENTS[@]}"; do
        echo -e "${BLUE}📋 For environment: ${env}${NC}"
        echo -e "    1. Go to ${INFISICAL_HOST}/project/${PROJECT_ID}/settings/tokens"
        echo -e "    2. Click 'Create Token'"
        echo -e "    3. Name: ${PROJECT_NAME}-${env}-backend-token"
        echo -e "    4. Environment: ${env}"
        echo -e "    5. Path: /backend"
        echo -e "    6. Save the token securely"
        echo ""
        
        echo -e "    ${PURPLE}Add to .env.${env}:${NC}"
        echo -e "    INFISICAL_TOKEN=<your-service-token>"
        echo -e "    INFISICAL_PROJECT_ID=${PROJECT_ID}"
        echo -e "    INFISICAL_ENVIRONMENT=${env}"
        echo ""
    done
}

# Function to generate environment files
generate_env_files() {
    echo -e "${BLUE}📄 Generating environment configuration files...${NC}"
    
    # Get project ID
    if [ -f ".infisical-project-id" ]; then
        source .infisical-project-id
    else
        echo -e "${RED}❌ Project ID not found${NC}"
        return 1
    fi
    
    for env in "${ENVIRONMENTS[@]}"; do
        local env_file=".env.${env}.infisical"
        
        echo -e "${BLUE}Creating ${env_file}${NC}"
        
        cat > "$env_file" << EOF
# Infisical Configuration for ${env} environment
# Generated by infisical-setup.sh

# Environment
ENV=${env}
SPRING_PROFILES_ACTIVE=${env}

# Infisical Settings
INFISICAL_ENABLED=true
INFISICAL_HOST=${INFISICAL_HOST}
INFISICAL_PROJECT_ID=${PROJECT_ID}
INFISICAL_ENVIRONMENT=${env}
INFISICAL_TOKEN=<SET_YOUR_SERVICE_TOKEN_HERE>

# Application Settings (non-sensitive)
SERVER_PORT=8090
APP_NAME=MoodDiary

# Note: All sensitive secrets are now managed by Infisical
# Update INFISICAL_TOKEN with your actual service token
EOF
        
        echo -e "${GREEN}✅ Created ${env_file}${NC}"
    done
    
    echo -e "${YELLOW}💡 Remember to:${NC}"
    echo -e "  1. Update INFISICAL_TOKEN in each .env.*.infisical file"
    echo -e "  2. Update your docker-compose.yml to use these files"
    echo -e "  3. Add .env.*.infisical to your .gitignore if they contain tokens"
}

# Function to validate setup
validate_setup() {
    echo -e "${BLUE}✅ Validating Infisical setup...${NC}"
    
    # Get project ID
    if [ -f ".infisical-project-id" ]; then
        source .infisical-project-id
        echo -e "${GREEN}✅ Project ID found: ${PROJECT_ID}${NC}"
    else
        echo -e "${RED}❌ Project ID not found${NC}"
        return 1
    fi
    
    # Check if .infisical.json exists
    if [ -f ".infisical.json" ]; then
        echo -e "${GREEN}✅ Infisical project configuration found${NC}"
    else
        echo -e "${RED}❌ Infisical project configuration missing${NC}"
        return 1
    fi
    
    # Test secret retrieval for each environment
    for env in "${ENVIRONMENTS[@]}"; do
        echo -e "${BLUE}Testing ${env} environment...${NC}"
        
        # Try to list secrets (this will fail if environment doesn't exist or no token)
        if infisical secrets --env "$env" --path "/backend" --projectId "$PROJECT_ID" >/dev/null 2>&1; then
            echo -e "  ${GREEN}✅ ${env} environment accessible${NC}"
        else
            echo -e "  ${YELLOW}⚠️  ${env} environment not accessible (may need service token)${NC}"
        fi
    done
    
    echo -e "${GREEN}🎉 Setup validation complete!${NC}"
}

# Main execution
main() {
    echo -e "${GREEN}🎯 Starting Infisical setup process...${NC}"
    
    # Check prerequisites
    check_infisical_cli
    check_infisical_running
    
    # Login to Infisical
    login_infisical
    
    # Create and initialize project
    create_project
    
    # Setup project structure
    setup_project_structure
    
    # Migrate existing secrets
    migrate_secrets
    
    # Generate environment files
    generate_env_files
    
    # Show service token creation guide
    create_service_tokens
    
    # Validate setup
    validate_setup
    
    echo -e "${GREEN}🎉 Infisical setup completed successfully!${NC}"
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo -e "  1. Create environments (development, staging, production) in Infisical UI"
    echo -e "  2. Create service tokens for each environment"
    echo -e "  3. Update .env.*.infisical files with your service tokens"
    echo -e "  4. Update your application to use InfisicalConfig"
    echo -e "  5. Test the integration with: ./validate-env.sh"
    echo ""
    echo -e "${BLUE}🔗 Useful links:${NC}"
    echo -e "  Infisical Dashboard: ${INFISICAL_HOST}"
    echo -e "  Project Settings: ${INFISICAL_HOST}/project/${PROJECT_ID}/settings"
    echo -e "  Service Tokens: ${INFISICAL_HOST}/project/${PROJECT_ID}/settings/tokens"
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}KB Mood Financial Diary - Infisical Setup Script${NC}"
    echo -e "${YELLOW}Usage: $0 [COMMAND]${NC}"
    echo ""
    echo -e "${BLUE}Commands:${NC}"
    echo -e "  setup, main          Run complete setup process"
    echo -e "  create-project       Create and initialize Infisical project"
    echo -e "  migrate-secrets      Migrate secrets from .env files"
    echo -e "  generate-env         Generate environment configuration files"
    echo -e "  create-tokens        Show service token creation guide"
    echo -e "  validate             Validate current setup"
    echo -e "  help, -h, --help     Show this help message"
    echo ""
    echo -e "${BLUE}Environment Variables:${NC}"
    echo -e "  INFISICAL_API_URL    Infisical server URL (default: http://localhost:8222)"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo -e "  $0 setup                    # Run complete setup"
    echo -e "  $0 migrate-secrets          # Only migrate secrets"
    echo -e "  INFISICAL_API_URL=https://app.infisical.com $0 setup  # Use cloud Infisical"
}

# Parse command line arguments
case "${1:-setup}" in
    "setup"|"main")
        main
        ;;
    "create-project")
        check_infisical_cli
        check_infisical_running
        login_infisical
        create_project
        ;;
    "migrate-secrets")
        migrate_secrets
        ;;
    "generate-env")
        generate_env_files
        ;;
    "create-tokens")
        create_service_tokens
        ;;
    "validate")
        validate_setup
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_usage
        exit 1
        ;;
esac
