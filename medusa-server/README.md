# Medusa2 Marketplace Demo

This is a demo project which demonstrates how to create a multivendor marketplace using [Medusa 2.0](https://medusajs.com/)

> [!NOTE]
**UPD**: all the multivendor marketplace related code was moved to [medusa-marketplace-plugin](https://github.com/Tech-Labi/medusa-marketplace-plugin), so the demo app now uses this plugin (read Part 4 below).

A four-part series articles on Medium:

- 🛠 [**Part 1**](https://medium.com/@igorkhomenko/building-a-multivendor-marketplace-with-medusa-js-2-0-a-dev-guide-f55aec971126): setting up the multi-vendor structure and understanding how to manage multiple sellers on a single Medusa instance
- 🧑‍💼 [**Part 2**](https://medium.com/@igorkhomenko/building-a-multivendor-marketplace-with-medusa-js-2-0-super-admin-d899353b0b1e): building a powerful Super Admin layer to oversee vendors, products, orders, and more
- 🎨 [**Part 3**](https://medium.com/@igorkhomenko/building-a-multivendor-marketplace-with-medusa-js-2-0-dashboard-customization-part-3-6ce584b8c1c1): customizing the Medusa Admin Dashboard to give super admins and vendors a clean, user-friendly experience
- 🎨 [**Part 4**](https://medium.com/@igorkhomenko/building-a-multivendor-marketplace-with-medusa-js-2-0-medusa-plugin-part-4-a4c7ac08f2d4): bring it all together - packaging everything into a Medusa 2 plugin 

![1_EMHanavMVUIrwCw4_ROoiw](https://github.com/user-attachments/assets/c2cee973-7704-4843-8da4-8c5e877cdc8e)

## Features

- **Multi-vendor Marketplace**: Built on Medusa 2.0 marketplace demo
- **Digital Products**: Support for digital product sales and downloads
- **Unified Authentication**: JWT-based authentication system compatible with external services
- **Admin Dashboard**: Customized Medusa admin for marketplace management
- **API Integration**: RESTful APIs for all marketplace functionality

## How to run 

### Option 1: Docker (Recommended)

Run the complete Medusa server with PostgreSQL using Docker:

```bash
docker compose up --build
```

This command will build and start both PostgreSQL and Medusa containers.

**Important:** You can only run this command after `PostgreSQL` has already been started using the docker compose up command from Option 2 (below). This is because PostgreSQL creates a network that Medusa depends on to run properly.

### Option 2: Manual Setup

1. **Start PostgreSQL**

By default, running the following command will start only the `PostgreSQL` container:

```bash
docker compose up
```

This command will use your default docker-compose.yml file to start the `PostgreSQL` service, but `Medusa` will not be started automatically. This step is required because we create a network in `PostgreSQL`, and `Medusa` depends on it.

2. **Run Medusa manually**

```bash
cd medusa-marketplace-demo
yarn
cp .env.template .env
npx medusa db:setup --db marketplace
npx medusa db:migrate
npx medusa user --email roicoroy@yahoo.com.br --password Rwbento123!
yarn dev
```

The Medusa dashboard should now be running on http://localhost:9000/app

### Option 3: NPM Scripts

Use the provided npm scripts for easier setup:

```bash
# Setup Medusa server
npm run setupMedusaServer

# Create demo user and seed data
npm run setupMedusaUserSeed

# Start local development server
npm run startMedusaLocalServer
```

## Access Points

Once running, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| Medusa API | `http://localhost:9000` | Main API endpoints |
| Medusa Admin | `http://localhost:9000/app` | Admin dashboard |
| Unified Auth | `http://localhost:9000/unified-auth` | Authentication endpoint |

## Authentication

The server includes a unified authentication system that generates JWT tokens compatible with external services. Demo credentials:

- **Email**: `roicoroy@yahoo.com.br` / **Password**: `Rwbento123!`
- **Email**: `user@example.com` / **Password**: `Password123`
- **Email**: `test@example.com` / **Password**: `password123`

## API Endpoints

### Store API
- `GET /store/products` - List products
- `GET /store/regions` - List regions
- `POST /store/carts` - Create cart
- `POST /store/carts/{id}/complete` - Complete order

### Admin API
- `GET /admin/digital-products` - List digital products
- `POST /admin/digital-products` - Create digital product
- `POST /admin/digital-products/upload/{type}` - Upload media

### Unified Auth API
- `POST /unified-auth` - Login and get unified JWT token
- `GET /unified-auth` - Get endpoint information

## Digital Products

This marketplace supports digital products with:
- **File uploads** for digital content
- **Preview and main media** types
- **Automatic fulfillment** for digital orders
- **Download protection** for purchased content

## Database Management

### Backup and Restore

You can use `pg_dump` to back up your PostgreSQL database and `psql` to restore it:

#### Backup
```bash
docker compose -f .devcontainer/docker-compose.yml exec -T postgres pg_dump -U marketplace -d marketplace > marketplace-backup.sql
```

#### Restore
```bash
cat marketplace-backup.sql | docker compose -f .devcontainer/docker-compose.yml exec -T postgres psql -U marketplace -d marketplace
```

#### Using NPM Scripts

**Create backup:**
```bash
npm run db:backup
```

**List available backups:**
```bash
npm run db:restore
```

**Restore specific backup:**
```bash
npm run db:restore-file --file=<filename>
```

**Restore latest backup:**
```bash
npm run db:restore-latest
```

## Cleanup Resources

Remove containers, networks, and volumes:

**Option 1: PostgreSQL only**
```bash
docker compose down -v
```

**Option 2: Full cleanup**
```bash
docker compose -f docker-compose.yml down -v
```

## Development

The project is built with:
- **Medusa 2.6.1** - Latest Medusa framework
- **TypeScript** - Full type safety
- **MikroORM** - Database ORM
- **Custom modules** - Digital product functionality
- **Unified middleware** - Cross-service authentication

## Testing

The marketplace includes comprehensive testing for:
- Digital product workflows
- Authentication systems
- API endpoints
- Database operations

## License

MIT License - See LICENSE file for details.

---

**Note**: This is the backend server component of the Goiaba Servers unified platform. For the complete system including Strapi CMS integration, refer to the main project documentation.