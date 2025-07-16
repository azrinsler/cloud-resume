# BUILD STAGE
# Set which version of node to use
FROM node:24-alpine AS build
# Set working directory within the container
WORKDIR /app
# Copy our package and package-lock json files
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy remaining app files
COPY . .
# Build the app files
RUN npm run build

# PRODUCTION STAGE
# nginx is a web server we can use for static files
FROM nginx:stable-alpine AS production
# Copies build output from previous stage
COPY --from=build /app/dist /usr/share/nginx/html
# Port to expose on the container itself
EXPOSE 80
# Command to actually run the things
CMD ["nginx", "-g", "daemon off;"]