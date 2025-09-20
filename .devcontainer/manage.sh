#!/bin/bash

# Docker Management Script for Goiaba Servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    echo "🐳 Goiaba Servers Docker Management"
    echo ""
    echo "Usage: ./manage.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  build       Build and start services"
    echo "  logs        Show logs for all services"
    echo "  status      Show status of all services"
    echo "  tunnel      Start external access tunnel (LocalTunnel)"
    echo "  reset-db    Reset Medusa database (clean start)"
    echo "  clean       Stop and remove all containers and volumes"
    echo "  help        Show this help message"
    echo ""
}

case "${1:-help}" in
    start)
        print_status "Starting all services..."
        docker-compose up -d
        print_success "All services started!"
        ;;
    stop)
        print_status "Stopping all services..."
        docker-compose down
        print_success "All services stopped!"
        ;;
    restart)
        print_status "Restarting all services..."
        docker-compose restart
        print_success "All services restarted!"
        ;;
    build)
        print_status "Building and starting all services..."
        docker-compose up -d --build
        print_success "All services built and started!"
        ;;
    logs)
        print_status "Showing logs for all services..."
        docker-compose logs -f
        ;;
    status)
        print_status "Service status:"
        docker-compose ps
        ;;
    tunnel)
        print_status "Starting external access tunnel..."
        ./quick-tunnel.sh
        ;;
    reset-db)
        print_status "Resetting Medusa database..."
        print_warning "This will delete all data in the Medusa database!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Stopping Medusa container..."
            docker-compose stop medusa
            print_status "Resetting database..."
            docker-compose exec -T -e PGPASSWORD=${POSTGRES_PASSWORD} medusa-db psql -U marketplace -d medusa_store -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
            print_status "Restarting Medusa container..."
            docker-compose start medusa
            print_success "Database reset complete! Medusa will reinitialize automatically."
        else
            print_status "Database reset cancelled."
        fi
        ;;
    clean)
        print_status "Stopping and cleaning up all services..."
        docker-compose down -v
        print_success "All services stopped and cleaned up!"
        ;;
    help|*)
        show_help
        ;;
esac