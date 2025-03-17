# Use an official Node.js runtime as a base image
FROM node:21

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY tsconfig.json ./

# Install the application dependencies
RUN npm ci --legacy-peer-deps

# Copy the application code to the container
COPY src/ src/

# Expose the port on which your application will run
EXPOSE 5000

# build the app
# RUN npm run build

# Define the command to run your application
# CMD ["node", "dist/src/index.js"]
CMD ["npm", "run", "start"]
