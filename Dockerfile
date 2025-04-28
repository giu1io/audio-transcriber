FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# Copying this separately prevents unnecessary reinstallation of dependencies
COPY package*.json ./
RUN npm install --omit=dev
# Bundle app source
COPY . .
# Expose the port the app runs on
EXPOSE 3000
# Define environment variable
ENV NODE_ENV=production
# Run the app
CMD [ "node", "src/server.js" ]
