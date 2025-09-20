
# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Install PostgreSQL client and Redis tools
RUN apt-get update && apt-get install -y \
    postgresql-client \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to leverage Docker cache
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Make the init script executable
RUN chmod +x init-medusa.sh

# Expose the port the app runs on
EXPOSE 9000

# Define the command to run the application
CMD ["./init-medusa.sh"]
