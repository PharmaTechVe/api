# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

RUN chmod +x /usr/app/start-dev.sh

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["sh", "/usr/app/start-dev.sh"]