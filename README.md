# Goiaba Servers - Unified E-commerce and Content Platform

This project is a fully integrated, dockerized platform that combines a **Medusa.js** e-commerce engine with a **Strapi** headless CMS. The platform features a unified Docker setup for easy deployment and development.

## Architecture

The platform is built on a microservices architecture with all services orchestrated by a single Docker Compose file:

### Core Services

- **Medusa Server (`medusa`):** E-commerce API engine for products, orders, and marketplace functionality
- **Strapi CMS (`strapi`):** Headless CMS for content management


### Data Layer

- **Medusa Database (`medusa-db`):** PostgreSQL database for e-commerce data
- **Strapi Database (`strapi-db`):** PostgreSQL database for CMS content
- **Redis (`medusa-redis`):** Caching and session storage for Medusa

### Network

- **Default Docker Network:** All services communicate via Docker's default bridge network

## Features

- **E-commerce Engine:** Full-featured e-commerce API with Medusa.js
- **Digital Products:** Support for digital product fulfillment
- **Headless CMS:** Flexible content management with Strapi
- **Unified Docker Setup:** Single docker-compose.yml for all services
- **Development Ready:** Hot reload and development configurations
- **Testing Suite:** Comprehensive health checks and API tests
- **Environment Management:** Separate configurations for development and production

## Tech Stack

- **E-commerce:** [Medusa.js](https://medusajs.com/)
- **CMS:** [Strapi](https://strapi.io/)
- **Backend:** [Node.js](https://nodejs.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/), [Redis](https://redis.io/)

- **Orchestration:** [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install/)

## Quick Start

### Option 1: Automated Setup (Recommended)

1. **Clone the repository:**

   ```bash
   git clone https://github.com/roicoroy/goiaba-servers.git
   cd goiaba-servers
   ```

2. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

### Option 2: Manual Setup

1. **Clone and navigate:**

   ```bash
   git clone https://github.com/roicoroy/goiaba-servers.git
   cd goiaba-servers
   ```

2. **Start all services:**

   ```bash
   docker-compose up -d --build
   ```

3. **Check service status:**
   ```bash
   docker-compose ps
   ```

## Service URLs

Once running, access the services at:

| Service           | URL                            | Description              |
| ----------------- | ------------------------------ | ------------------------ |
| **Medusa API**    | `http://localhost:9000`        | E-commerce API endpoints |
| **Medusa Health** | `http://localhost:9000/health` | Health check endpoint    |
| **Strapi API**    | `http://localhost:1337`        | CMS API endpoints        |
| **Strapi Admin**  | `http://localhost:1337/admin`  | CMS admin panel          |


## Port Mapping

| Service   | Internal Port | External Port |
| --------- | ------------- | ------------- |
| Medusa    | 9000          | 9000          |
| Strapi    | 1337          | 1337          |
| Medusa DB | 5432          | 5432          |
| Strapi DB | 5432          | 5434          |
| Redis     | 6379          | 6379          |


## Project Structure

```
goiaba-servers/
├── .devcontainer/          # Docker configuration files
│   ├── docker-compose.yml  # Main Docker Compose configuration
│   ├── docker-setup.sh     # Docker setup script
│   ├── manage.sh           # Docker management script

├── medusa-server/          # Medusa e-commerce server
├── strapi-server/          # Strapi CMS server
├── tests/                  # Test suites
└── setup.sh               # Main setup script
```

## Management Commands

### From Root Directory
```bash
# Initial setup
./setup.sh
```

### From .devcontainer Directory
```bash
cd .devcontainer

# First time setup - copy environment file
cp .env.example .env  # Customize as needed

# Management script
./manage.sh start    # Start all services
./manage.sh stop     # Stop all services
./manage.sh restart  # Restart all services
./manage.sh build    # Build and start services
./manage.sh logs     # View logs
./manage.sh status   # Check service status
./manage.sh tunnel   # Start external access tunnel
./manage.sh clean    # Clean up everything

# Direct Docker commands
docker-compose up -d          # Start services
docker-compose up -d --build  # Build and start
docker-compose logs -f        # View logs
docker-compose down           # Stop services
docker-compose down -v        # Clean up (remove volumes)
```

## Testing

This project includes a suite of tests to ensure the stability of the unified authentication system and the individual services.

- **Run all tests:**

  ```bash
  npm test
  ```

- **Run specific tests:**

  - `npm run test:medusa`: Tests the Medusa integration.
  - `npm run test:strapi`: Tests the Strapi integration.
  - `npm run test:cross-service`: Tests the interaction between services.
  - `npm run test:security`: Runs security-related tests.

You can also use the provided Postman collection (`Unified-Auth-Postman-Collection.json`) to test the API endpoints.

## License

This project is licensed under the MIT License.

npx medusa db:setup && npx medusa db:create && npx medusa db:migrate

npx medusa user --email roicoroy@yahoo.com.br --password Rwbento123!

## 🌐 External Access (Tunneling)

Access your development environment from anywhere using LocalTunnel:

### Quick Start
```bash
cd .devcontainer
./manage.sh tunnel
```

### Setup LocalTunnel
```bash
cd .devcontainer
./setup-tunnel.sh    # Install LocalTunnel
./manage.sh tunnel   # Start tunnels
```

### Features
- ✅ **Completely free** - No signup required
- ✅ **HTTPS by default** - Secure connections
- ✅ **Easy to use** - One command to start
- ⚠️ **URLs change** - New URLs on each restart

### Manual Usage
```bash
# Install (one time)
npm install -g localtunnel

# Start individual tunnels
lt --port 9000 --subdomain your-medusa-name
lt --port 1337 --subdomain your-strapi-name
```

**⚠️ Important:** Update CORS settings in your environment files with tunnel URLs when needed!