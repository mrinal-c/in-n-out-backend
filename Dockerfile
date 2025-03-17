# Use an official Node.js runtime as a base image
FROM node:21

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm ci

# Copy the application code to the container
COPY src/ src/

# Expose the port on which your application will run
EXPOSE 5000

# Define the command to run your application
CMD ["npm", "run", "start"]
