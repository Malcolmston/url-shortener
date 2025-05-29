FROM ubuntu:latest
LABEL authors="malcolmstone"

ENTRYPOINT ["top", "-b"]

# Use an official Node.js runtime as the base image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install -g ts-node typescript
RUN npm install

# Copy application files
COPY . .

# Expose the port the app runs on (adjust if your app uses a different port)
EXPOSE 3000

# Set environment variables (optional)
ENV NODE_ENV=production

# Start the app
CMD [ "ts-node", "app.js" ]
