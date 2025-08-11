#!/bin/bash

# KB Mood Financial Diary - Environment Synchronization Script
# This script synchronizes environment variables from Infisical to local .env files

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
DEFAULT_ENVIRONMENT="development"

echo -e "${GREEN}🔄 Starting environment synchronization from Infisical...${NC}"

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --env ENVIRONMENT    Environment to sync (development, staging, production)"
    echo "  -p, --project-id ID      Infisical project ID"
    echo "  -a, --all               Sync all environments"
    echo "  -v, --validate          Validate synced variables"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e development        # Sync development environment"
    echo "  $0 --all                 # Sync all environments"
    echo "  $0 -e staging -v         # Sync staging and validate"
}

# Parse command line arguments
ENVIRONMENT=""
PROJECT_ID=""
SYNC_ALL=false
VALIDATE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -p|--project-id)
            PROJECT_ID="$2"
            shift 2
            ;;
        -a|--all)
            SYNC_ALL=true
            shift
            ;;
        -v|--validate)
            VALIDATE=true
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

# Load project ID if not provided
if [ -z "$PROJECT_ID" ]; then
    if [ -f ".infisical-project-id" ]; then
        source .infisical-project-id
        echo -e "${BLUE}📋 Using project ID: ${PROJECT_ID}${NC}"
    else
        echo -e "${RED}❌ Project ID not found. Please run infisical-setup.sh first or provide -p option.${NC}"
        exit 1
    fi
fi

# Set default environment if not provided and not syncing all
if [ -z "$ENVIRONMENT" ] && [ "$SYNC_ALL" = false ]; then
    ENVIRONMENT="$DEFAULT_ENVIRONMENT"
    echo -e "${YELLOW}⚠️  No environment specified, using default: ${ENVIRONMENT}${NC}"
fi

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if Infisical CLI is available
    if ! command -v infisical &> /dev/null; then
        echo -e "${RED}❌ Infisical CLI not found. Please install it first:${NC}"
        echo -e "${BLUE}   npm install -g @infisical/cli${NC}"
        exit 1
    fi
    
    # Check if logged in
    if ! infisical whoami > /dev/null 2>&1; then
        echo -e "${RED}❌ Not logged into Infisical. Please run 'infisical login' first.${NC}"
        exit 1
    fi
    
    # Check if Infisical is running
    if ! curl -s "${INFISICAL_HOST}/api/status" > /dev/null 2>&1; then
        echo -e "${RED}❌ Infisical is not running at ${INFISICAL_HOST}${NC}"
        echo -e "${YELLOW}💡 Please start Infisical using: docker-compose up -d infisical${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites met${NC}"
}

# Function to sync environment variables
sync_environment() {
    local env="$1"
    local output_file="$2"
    
    echo -e "${BLUE}🔄 Syncing ${env} environment to ${output_file}...${NC}"
    
    # Create backup of existing file
    if [ -f "$output_file" ]; then
        backup_file="${output_file}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$output_file" "$backup_file"
        echo -e "${YELLOW}💾 Backup created: ${backup_file}${NC}"
    fi
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "$output_file")"
    
    # Export secrets from Infisical
    echo -e "${BLUE}📤 Exporting secrets from Infisical...${NC}"
    
    if infisical secrets export --env "$env" --project-id "$PROJECT_ID" --format dotenv > "$output_file"; then
        # Add header to the file
        temp_file=$(mktemp)
        cat << EOF > "$temp_file"
# Environment variables synchronized from Infisical
# Environment: ${env}
# Project: ${PROJECT_NAME}
# Synchronized at: $(date)
# DO NOT EDIT MANUALLY - Use Infisical dashboard or sync script

EOF
        cat "$output_file" >> "$temp_file"
        mv "$temp_file" "$output_file"
        
        # Count variables
        var_count=$(grep -c "^[^#].*=" "$output_file" || true)
        echo -e "${GREEN}✅ Successfully synced ${var_count} variables to ${output_file}${NC}"
    else
        echo -e "${RED}❌ Failed to sync ${env} environment${NC}"
        return 1
    fi
}

# Function to validate environment variables
validate_environment() {
    local env_file="$1"
    local env_name="$2"
    
    echo -e "${BLUE}🔍 Validating ${env_file} (${env_name})...${NC}"
    
    if [ ! -f "$env_file" ]; then
        echo -e "${RED}❌ Environment file not found: ${env_file}${NC}"
        return 1
    fi
    
    # Define required variables based on environment
    local required_vars=()
    case "$env_name" in
        "development")
            required_vars=("JWT_SECRET" "DB_HOST" "DB_NAME" "DB_USER" "FRONTEND_URL" "CORS_ALLOWED_ORIGINS" "BACKEND_PORT")
            ;;
        "staging"|"production")
            required_vars=("JWT_SECRET" "DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD" "FRONTEND_URL" "CORS_ALLOWED_ORIGINS" "BACKEND_PORT")
            ;;
    esac
    
    local missing_vars=()
    local empty_vars=()
    
    # Check each required variable
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" "$env_file"; then
            value=$(grep "^${var}=" "$env_file" | cut -d'=' -f2- | xargs)
            if [ -z "$value" ] || [[ "$value" == "your_"* ]] || [[ "$value" == "your-"* ]]; then
                empty_vars+=("$var")
            else
                echo -e "${GREEN}  ✅ ${var}${NC}"
            fi
        else
            missing_vars+=("$var")
        fi
    done
    
    # Report missing variables
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo -e "${RED}  ❌ Missing variables:${NC}"
        for var in "${missing_vars[@]}"; do
            echo -e "${RED}    - ${var}${NC}"
        done
    fi
    
    # Report empty variables
    if [ ${#empty_vars[@]} -gt 0 ]; then
        echo -e "${YELLOW}  ⚠️  Empty or placeholder variables:${NC}"
        for var in "${empty_vars[@]}"; do
            echo -e "${YELLOW}    - ${var}${NC}"
        done
    fi
    
    # Check JWT_SECRET length
    if grep -q "^JWT_SECRET=" "$env_file"; then
        jwt_secret=$(grep "^JWT_SECRET=" "$env_file" | cut -d'=' -f2- | xargs)
        if [ ${#jwt_secret} -lt 32 ]; then
            echo -e "${RED}  ❌ JWT_SECRET is too short (${#jwt_secret} chars, minimum 32)${NC}"
        else
            echo -e "${GREEN}  ✅ JWT_SECRET length is adequate (${#jwt_secret} chars)${NC}"
        fi
    fi
    
    # Overall validation result
    if [ ${#missing_vars[@]} -eq 0 ] && [ ${#empty_vars[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ Validation passed for ${env_name}${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Validation completed with warnings for ${env_name}${NC}"
        return 1
    fi
}

# Function to sync all environments
sync_all_environments() {
    echo -e "${BLUE}🔄 Syncing all environments...${NC}"
    
    # Define environment mappings
    declare -A env_mappings=(
        ["development"]=".env"
        ["staging"]=".env.staging"
        ["production"]=".env.production"
    )
    
    local success_count=0
    local total_count=${#env_mappings[@]}
    
    for env in "${!env_mappings[@]}"; do
        output_file="${env_mappings[$env]}"
        
        if sync_environment "$env" "$output_file"; then
            ((success_count++))
            
            # Validate if requested
            if [ "$VALIDATE" = true ]; then
                validate_environment "$output_file" "$env"
            fi
        fi
        
        echo ""
    done
    
    echo -e "${BLUE}📊 Sync Summary: ${success_count}/${total_count} environments synced successfully${NC}"
    
    # Also sync backend-specific files
    echo -e "${BLUE}🔄 Syncing backend-specific environment...${NC}"
    sync_environment "development" "backend-main/.env"
    
    # Sync frontend-specific files
    echo -e "${BLUE}🔄 Syncing frontend-specific environment...${NC}"
    sync_environment "development" "frontend/.env"
}

# Function to sync single environment
sync_single_environment() {
    local env="$1"
    
    echo -e "${BLUE}🔄 Syncing ${env} environment...${NC}"
    
    # Determine output file based on environment
    local output_file
    case "$env" in
        "development")
            output_file=".env"
            ;;
        "staging")
            output_file=".env.staging"
            ;;
        "production")
            output_file=".env.production"
            ;;
        *)
            output_file=".env.${env}"
            ;;
    esac
    
    if sync_environment "$env" "$output_file"; then
        # Also sync to service-specific files for development
        if [ "$env" = "development" ]; then
            echo -e "${BLUE}🔄 Syncing to service-specific files...${NC}"
            sync_environment "$env" "backend-main/.env"
            sync_environment "$env" "frontend/.env"
        fi
        
        # Validate if requested
        if [ "$VALIDATE" = true ]; then
            validate_environment "$output_file" "$env"
        fi
        
        echo -e "${GREEN}✅ Successfully synced ${env} environment${NC}"
    else
        echo -e "${RED}❌ Failed to sync ${env} environment${NC}"
        exit 1
    fi
}

# Function to update env-manager integration
update_env_manager() {
    echo -e "${BLUE}🔧 Updating env-manager integration...${NC}"
    
    # Create env-manager integration script
    cat << 'EOF' > env-manager/infisical-integration.js
// Infisical integration for env-manager
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class InfisicalIntegration {
    constructor() {
        this.projectId = this.loadProjectId();
        this.infisicalHost = 'http://localhost:8222';
    }

    loadProjectId() {
        try {
            const projectIdFile = path.join(__dirname, '..', '.infisical-project-id');
            if (fs.existsSync(projectIdFile)) {
                const content = fs.readFileSync(projectIdFile, 'utf8');
                const match = content.match(/PROJECT_ID=(.+)/);
                return match ? match[1].trim() : null;
            }
        } catch (error) {
            console.error('Error loading project ID:', error);
        }
        return null;
    }

    async syncFromInfisical(environment = 'development') {
        return new Promise((resolve, reject) => {
            if (!this.projectId) {
                reject(new Error('Project ID not found. Please run infisical-setup.sh first.'));
                return;
            }

            const command = `infisical secrets export --env ${environment} --project-id ${this.projectId} --format dotenv`;
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Infisical sync failed: ${error.message}`));
                    return;
                }
                
                if (stderr) {
                    console.warn('Infisical warning:', stderr);
                }
                
                resolve(stdout);
            });
        });
    }

    async pushToInfisical(envVars, environment = 'development') {
        return new Promise((resolve, reject) => {
            if (!this.projectId) {
                reject(new Error('Project ID not found. Please run infisical-setup.sh first.'));
                return;
            }

            // Create temporary file with env vars
            const tempFile = path.join(__dirname, '.temp-env');
            const envContent = Object.entries(envVars)
                .map(([key, value]) => `${key}=${value}`)
                .join('\n');
            
            fs.writeFileSync(tempFile, envContent);

            const command = `infisical secrets import --env ${environment} --project-id ${this.projectId} --path "/" --format dotenv < ${tempFile}`;
            
            exec(command, (error, stdout, stderr) => {
                // Clean up temp file
                fs.unlinkSync(tempFile);
                
                if (error) {
                    reject(new Error(`Infisical push failed: ${error.message}`));
                    return;
                }
                
                if (stderr) {
                    console.warn('Infisical warning:', stderr);
                }
                
                resolve(stdout);
            });
        });
    }

    async listEnvironments() {
        return new Promise((resolve, reject) => {
            if (!this.projectId) {
                reject(new Error('Project ID not found. Please run infisical-setup.sh first.'));
                return;
            }

            const command = `infisical environments list --project-id ${this.projectId} --format json`;
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Failed to list environments: ${error.message}`));
                    return;
                }
                
                try {
                    const environments = JSON.parse(stdout);
                    resolve(environments.map(env => env.name));
                } catch (parseError) {
                    reject(new Error(`Failed to parse environments: ${parseError.message}`));
                }
            });
        });
    }
}

module.exports = InfisicalIntegration;
EOF
    
    echo -e "${GREEN}✅ Created env-manager Infisical integration${NC}"
}

# Main execution
main() {
    echo -e "${GREEN}🎯 Starting synchronization process...${NC}"
    
    check_prerequisites
    
    if [ "$SYNC_ALL" = true ]; then
        sync_all_environments
    else
        sync_single_environment "$ENVIRONMENT"
    fi
    
    update_env_manager
    
    echo ""
    echo -e "${GREEN}🎉 Environment synchronization completed successfully!${NC}"
    echo -e "${BLUE}📋 Summary:${NC}"
    echo -e "  - Environment variables synced from Infisical"
    echo -e "  - Local .env files updated"
    echo -e "  - Backups created for existing files"
    echo -e "  - env-manager integration updated"
    echo ""
    echo -e "${YELLOW}💡 Next steps:${NC}"
    echo -e "  1. Review the synced .env files"
    echo -e "  2. Update any missing or placeholder values in Infisical"
    echo -e "  3. Test your applications with the new environment variables"
    echo -e "  4. Set up automated sync in your CI/CD pipeline"
}

# Run main function
main "$@"
