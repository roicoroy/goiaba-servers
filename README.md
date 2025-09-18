# Goiaba Servers - Unified E-commerce and Content Platform

This project is a fully integrated, dockerized platform that combines a **Medusa.js** multi-vendor marketplace with a **Strapi** headless CMS. It features a unified authentication system that provides a seamless single sign-on (SSO) experience for users across both the e-commerce storefront and the content-driven parts of the application.

## Architecture

The platform is built on a microservices architecture, with the following services orchestrated by Docker Compose:

-   **Medusa Server (`medusa`):** The core e-commerce engine, responsible for products, orders, and marketplace logic.
-   **Strapi CMS (`strapi`):** A headless CMS for managing content.
-   **Nginx (`nginx`):** A reverse proxy that sits in front of all services.
-   **Databases:** Two independent PostgreSQL databases, one for Medusa (`medusa-db`) and one for Strapi (`strapi-db`).
-   **Redis (`redis`):** A Redis instance for Medusa's caching and job queue.
-   **Adminer (`strapiAdminer`):** A database management tool for the Strapi database.

All services are connected through a shared Docker network (`unified-auth-network`).

## Features

-   **Unified Authentication:** A unified authentication system between the Medusa marketplace and Strapi CMS.
-   **Multi-Vendor Marketplace:** Built on the Medusa marketplace demo, allowing multiple vendors to sell products.
-   **Headless CMS:** Flexible content management powered by Strapi.
-   **Dockerized Environment:** The entire platform is containerized, allowing for easy setup and deployment.
-   **Centralized Logging:** All service logs are accessible through Docker Compose.

## Tech Stack

-   **E-commerce:** [Medusa.js](https://medusajs.com/)
-   **CMS:** [Strapi](https://strapi.io/)
-   **Backend:** [Node.js](https://nodejs.org/)
-   **Database:** [PostgreSQL](https://www.postgresql.org/), [Redis](https://redis.io/)
-   **Web Server:** [Nginx](https://www.nginx.com/)
-   **Orchestration:** [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

## Prerequisites

Before you begin, ensure you have the following installed:

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/)
-   [Node.js](https://nodejs.org/en/download/)
-   [Yarn](https://classic.yarnpkg.com/en/docs/install/)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/roicoroy/goiaba-servers.git
    cd goiaba-servers
    ```

2.  **Run the setup script:**

    This script will check for dependencies, create necessary directories, build the Docker images, and start all the services.

    ```bash
    ./docker-setup.sh
    ```

3.  **Access the services:**

    Once the setup is complete, you can access the different parts of the platform at the following URLs:

    | Service               | URL                               |
    | --------------------- | --------------------------------- |
    | Medusa API            | `http://localhost:9000`           |
    | Medusa Admin          | `http://localhost:9000/app`       |
    | Strapi API            | `http://localhost:1337`           |
    | Strapi Admin          | `http://localhost:1337/admin`     |
    | Nginx Proxy           | `http://localhost:80`             |
    | Strapi DB Admin       | `http://localhost:9090`           |

    Default credentials for the Medusa admin are `admin@medusa-test.com` / `supersecret`. For Strapi, you will need to create an admin user on your first visit to the admin panel.

## Testing

This project includes a suite of tests to ensure the stability of the unified authentication system and the individual services.

-   **Run all tests:**

    ```bash
    npm test
    ```

-   **Run specific tests:**

    
    -   `npm run test:medusa`: Tests the Medusa integration.
    -   `npm run test:strapi`: Tests the Strapi integration.
    -   `npm run test:cross-service`: Tests the interaction between services.
    -   `npm run test:security`: Runs security-related tests.

You can also use the provided Postman collection (`Unified-Auth-Postman-Collection.json`) to test the API endpoints.

## License

This project is licensed under the MIT License.
