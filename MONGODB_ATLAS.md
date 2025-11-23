# Using MongoDB Atlas with TinyLink

This guide shows you how to use your MongoDB Atlas database instead of the local MongoDB container.

---

## 🎯 Quick Setup

### Option 1: Use MongoDB Atlas for Local Development

1. **Update your server/.env file**:
   ```bash
   cd server
   # If .env doesn't exist, copy from example
   cp .env.example .env
   ```

2. **Edit `server/.env`** and replace the MONGO_URI:
   ```env
   # Replace with your MongoDB Atlas connection string
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tinylink?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=development
   ```

3. **Update docker-compose.yml** to remove MongoDB dependency:

   Create a new file `docker-compose.atlas.yml`:
   ```yaml
   version: '3.8'

   services:
     # Express.js Server (using MongoDB Atlas)
     server:
       build:
         context: ./server
         dockerfile: Dockerfile
       container_name: tinylink-server
       restart: unless-stopped
       ports:
         - "5000:5000"
       env_file:
         - ./server/.env
       volumes:
         - ./server:/app
         - /app/node_modules
       networks:
         - tinylink-network
       command: npm run dev

     # Next.js Client
     client:
       build:
         context: ./client
         dockerfile: Dockerfile
         target: deps
       container_name: tinylink-client
       restart: unless-stopped
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=development
         - NEXT_PUBLIC_API_URL=http://localhost:5000
       volumes:
         - ./client:/app
         - /app/node_modules
         - /app/.next
       depends_on:
         - server
       networks:
         - tinylink-network
       command: npm run dev

   networks:
     tinylink-network:
       driver: bridge
   ```

4. **Run with MongoDB Atlas**:
   ```bash
   docker-compose -f docker-compose.atlas.yml up
   ```

---

## 🔧 Option 2: Use Environment Variables (Recommended)

Instead of hardcoding in docker-compose, use a `.env` file at the project root:

1. **Create `.env` in project root**:
   ```env
   # MongoDB Atlas Connection
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tinylink?retryWrites=true&w=majority
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Client Configuration
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

2. **Update docker-compose.yml** to use env file:
   ```yaml
   services:
     server:
       env_file:
         - .env  # Load from root .env file
   ```

---

## 🚀 Jenkins CI/CD with MongoDB Atlas

### Method 1: Jenkins Environment Variables

1. **In Jenkins**, go to your pipeline configuration
2. **Add Environment Variable**:
   - Go to: Manage Jenkins → Configure System → Global properties
   - Check "Environment variables"
   - Add:
     - Name: `MONGO_URI`
     - Value: `mongodb+srv://username:password@cluster.mongodb.net/tinylink`

3. **Update Jenkinsfile** to use the environment variable:
   ```groovy
   environment {
       MONGO_URI = credentials('mongodb-atlas-uri')  // Or use env variable
   }
   ```

### Method 2: Jenkins Credentials (More Secure)

1. **Add MongoDB URI as Secret**:
   - Go to: Manage Jenkins → Manage Credentials
   - Click "Add Credentials"
   - Kind: "Secret text"
   - Secret: Your MongoDB Atlas connection string
   - ID: `mongodb-atlas-uri`
   - Description: "MongoDB Atlas Connection String"

2. **Update Jenkinsfile**:
   ```groovy
   pipeline {
       agent any
       
       environment {
           DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')
           MONGO_URI = credentials('mongodb-atlas-uri')  // MongoDB Atlas URI
           DOCKER_HUB_REPO = 'your-dockerhub-username'
           SERVER_IMAGE = "${DOCKER_HUB_REPO}/tinylink-server"
           CLIENT_IMAGE = "${DOCKER_HUB_REPO}/tinylink-client"
           GIT_COMMIT_SHORT = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()
           BUILD_TAG = "${env.BRANCH_NAME}-${env.GIT_COMMIT_SHORT}"
       }
       
       stages {
           stage('Build Server Docker Image') {
               steps {
                   script {
                       dir('server') {
                           sh """
                               docker build \
                                   --build-arg MONGO_URI=${MONGO_URI} \
                                   -t ${SERVER_IMAGE}:${BUILD_TAG} \
                                   -t ${SERVER_IMAGE}:latest \
                                   .
                           """
                       }
                   }
               }
           }
           
           stage('Deploy') {
               steps {
                   script {
                       // Pass MONGO_URI to deployment
                       sh """
                           docker run -d \
                               -e MONGO_URI=${MONGO_URI} \
                               -e PORT=5000 \
                               -p 5000:5000 \
                               ${SERVER_IMAGE}:latest
                       """
                   }
               }
           }
       }
   }
   ```

---

## 🔒 Security Best Practices

### 1. Never Commit MongoDB URI to Git

Add to `.gitignore`:
```gitignore
.env
.env.local
.env.*.local
server/.env
```

### 2. Use Different Databases for Different Environments

```env
# Development
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/tinylink-dev

# Staging
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/tinylink-staging

# Production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/tinylink-prod
```

### 3. MongoDB Atlas IP Whitelist

In MongoDB Atlas:
1. Go to Network Access
2. Add IP Address
3. For development: Add your current IP
4. For production: Add `0.0.0.0/0` (allow from anywhere) or specific server IPs

---

## 📝 Complete Example

### Project Root `.env`
```env
# MongoDB Atlas (replace with your actual connection string)
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/tinylink?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=development

# Client
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### `docker-compose.atlas.yml`
```yaml
version: '3.8'

services:
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: tinylink-server
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=${MONGO_URI}
      - PORT=${PORT}
      - NODE_ENV=${NODE_ENV}
    volumes:
      - ./server:/app
      - /app/node_modules
    networks:
      - tinylink-network
    command: npm run dev

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
      target: deps
    container_name: tinylink-client
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=${NODE_ENV}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    volumes:
      - ./client:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - server
    networks:
      - tinylink-network
    command: npm run dev

networks:
  tinylink-network:
    driver: bridge
```

### Run Command
```bash
# Load .env and start services
docker-compose -f docker-compose.atlas.yml up
```

---

## 🧪 Testing MongoDB Atlas Connection

### Test from Server Container
```bash
# Enter server container
docker exec -it tinylink-server sh

# Test MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected!')).catch(err => console.error(err));"
```

### Check Server Logs
```bash
docker logs tinylink-server
# Should see: "MongoDB Connected: cluster0.xxxxx.mongodb.net"
```

---

## 🎯 Summary

**For Local Development**:
1. Create `.env` file with your MongoDB Atlas URI
2. Use `docker-compose.atlas.yml` (without local MongoDB)
3. Run: `docker-compose -f docker-compose.atlas.yml up`

**For Jenkins CI/CD**:
1. Add MongoDB Atlas URI as Jenkins credential (ID: `mongodb-atlas-uri`)
2. Update Jenkinsfile to use `credentials('mongodb-atlas-uri')`
3. Pass as environment variable to Docker containers

**For Production**:
1. Set `MONGO_URI` environment variable on your server
2. Use `docker-compose.prod.yml` with environment variables
3. Never commit credentials to Git

---

Need help? Check the main [DOCKER.md](./DOCKER.md) or [JENKINS.md](./JENKINS.md) documentation.
