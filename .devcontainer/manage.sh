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
    clean)
        print_status "Stopping and cleaning up all services..."
        docker-compose down -v
        print_success "All services stopped and cleaned up!"
        ;;
    help|*)
        show_help
        ;;
esac