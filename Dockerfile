# Use the official Node.js image from the Docker Hub
FROM node:23-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install && npm run build
#--only=production

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000


# Specify the command to run the application using PM2
CMD ["npm", "start"]
