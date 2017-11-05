
# choose which image to use
FROM node:7.7.1

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

# Expose port
EXPOSE 3001

CMD [ "webpack" ]
CMD [ "node", "server/server.js"]
