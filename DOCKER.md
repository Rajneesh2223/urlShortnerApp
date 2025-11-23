# 🐳 Docker Guide for TinyLink

This guide provides comprehensive instructions for running TinyLink using Docker and Docker Compose.

---

## 📋 Prerequisites

- **Docker** (v20.10 or higher)
- **Docker Compose** (v2.0 or higher)
- **Git** (for cloning the repository)

### Install Docker

- **Windows/Mac**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: Follow the [official Docker installation guide](https://docs.docker.com/engine/install/)

Verify installation:
```bash
docker --version
docker-compose --version
```

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd tinylink
```

### 2. Set Up Environment Variables

**Server (.env)**:
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI if needed
```

**Client (.env.local)**:
```bash
cd ../client
cp .env.local.example .env.local
# Edit .env.local if needed
```

### 3. Run with Docker Compose

**Development Mode** (with hot-reload):
```bash
# From the project root
docker-compose up
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

**Production Mode**:
```bash
# Build images first
docker build -t tinylink-server:latest ./server
docker build -t tinylink-client:latest ./client

# Run production compose
docker-compose -f docker-compose.prod.yml up
```

---

## 🛠️ Building Docker Images Manually

### Build Server Image

```bash
cd server
docker build -t tinylink-server:latest .
```

### Build Client Image

```bash
cd client
docker build -t tinylink-client:latest .
```

### Run Individual Containers

**MongoDB**:
```bash
docker run -d \
  --name tinylink-mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7
```

**Server**:
```bash
docker run -d \
  --name tinylink-server \
  -p 5000:5000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/tinylink \
  -e PORT=5000 \
  tinylink-server:latest
```

**Client**:
```bash
docker run -d \
  --name tinylink-client \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:5000 \
  tinylink-client:latest
```

---

## 🔧 Docker Compose Commands

### Start Services
```bash
# Start in foreground
docker-compose up

# Start in background (detached)
docker-compose up -d

# Rebuild images before starting
docker-compose up --build
```

### Stop Services
```bash
# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs

# Follow logs
docker-compose logs -f

# Specific service
docker-compose logs server
docker-compose logs client
```

### Check Service Status
```bash
docker-compose ps
```

### Execute Commands in Containers
```bash
# Access server shell
docker-compose exec server sh

# Access client shell
docker-compose exec client sh

# Access MongoDB shell
docker-compose exec mongodb mongosh
```

---

## 🌍 Environment Variables

### Server Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://mongodb:27017/tinylink` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |

### Client Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` |
| `NODE_ENV` | Environment mode | `development` |

---

## 📦 Production Deployment

### Using Docker Hub

1. **Tag your images**:
```bash
docker tag tinylink-server:latest yourusername/tinylink-server:latest
docker tag tinylink-client:latest yourusername/tinylink-client:latest
```

2. **Push to Docker Hub**:
```bash
docker login
docker push yourusername/tinylink-server:latest
docker push yourusername/tinylink-client:latest
```

3. **Deploy on server**:
```bash
# Set environment variables
export DOCKER_REGISTRY=yourusername
export TAG=latest

# Pull and run
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🐛 Troubleshooting

### Port Already in Use

If ports 3000, 5000, or 27017 are already in use:

```bash
# Find process using port
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Kill the process or change ports in docker-compose.yml
```

### Container Won't Start

Check logs:
```bash
docker-compose logs <service-name>
```

### MongoDB Connection Issues

Ensure MongoDB is healthy:
```bash
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Clear Everything and Start Fresh

```bash
# Stop all containers
docker-compose down -v

# Remove all images
docker rmi tinylink-server tinylink-client

# Remove all volumes
docker volume prune

# Rebuild and start
docker-compose up --build
```

### Image Build Fails

Clear Docker build cache:
```bash
docker builder prune -a
```

---

## 🔍 Health Checks

All services include health checks:

**Check container health**:
```bash
docker ps
# Look for "healthy" status
```

**Manual health check**:
```bash
# Server
curl http://localhost:5000/healthz

# Client
curl http://localhost:3000

# MongoDB
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"
```

---

## 📊 Monitoring

### View Resource Usage

```bash
# All containers
docker stats

# Specific container
docker stats tinylink-server
```

### Inspect Containers

```bash
docker inspect tinylink-server
docker inspect tinylink-client
docker inspect tinylink-mongodb
```

---

## 🧹 Cleanup

### Remove Stopped Containers
```bash
docker container prune
```

### Remove Unused Images
```bash
docker image prune -a
```

### Remove Unused Volumes
```bash
docker volume prune
```

### Complete Cleanup
```bash
docker system prune -a --volumes
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)

---

**Need help?** Check the main [README.md](./README.md) or open an issue on GitHub.
