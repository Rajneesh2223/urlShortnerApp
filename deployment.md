# 🚀 Deployment Guide for TinyLink

This comprehensive guide covers multiple deployment strategies for the TinyLink application.

---

## 📋 Table of Contents

- [Option 1: Docker Deployment (Recommended)](#option-1-docker-deployment-recommended)
- [Option 2: Traditional Cloud Hosting](#option-2-traditional-cloud-hosting)
- [CI/CD with Jenkins](#cicd-with-jenkins)

---

## Option 1: Docker Deployment (Recommended)

Docker provides the most flexible and portable deployment option.

### Prerequisites

- Docker and Docker Compose installed on your server
- MongoDB Atlas account (or self-hosted MongoDB)
- Docker Hub account (for storing images)

### Quick Deploy with Docker Compose

1. **Clone the repository** on your server:
   ```bash
   git clone <your-repo-url>
   cd tinylink
   ```

2. **Set environment variables**:
   ```bash
   # Create .env file in server directory
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB URI
   
   # Create .env.local in client directory
   cd ../client
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Start with Docker Compose**:
   ```bash
   # Production mode
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Access your application**:
   - Frontend: http://your-server-ip:3000
   - Backend: http://your-server-ip:5000

### Deploy to Cloud Platforms

#### AWS (EC2 + Docker)

1. Launch an EC2 instance (Ubuntu recommended)
2. Install Docker and Docker Compose
3. Clone repository and run docker-compose
4. Configure security groups (ports 3000, 5000, 80, 443)

#### DigitalOcean (Droplet + Docker)

1. Create a Droplet with Docker pre-installed
2. SSH into droplet
3. Clone repository and run docker-compose
4. Point your domain to droplet IP

#### Google Cloud Run

```bash
# Build and push images
docker build -t gcr.io/PROJECT_ID/tinylink-server ./server
docker build -t gcr.io/PROJECT_ID/tinylink-client ./client

# Push to Google Container Registry
docker push gcr.io/PROJECT_ID/tinylink-server
docker push gcr.io/PROJECT_ID/tinylink-client

# Deploy to Cloud Run
gcloud run deploy tinylink-server --image gcr.io/PROJECT_ID/tinylink-server
gcloud run deploy tinylink-client --image gcr.io/PROJECT_ID/tinylink-client
```

---

## Option 2: Traditional Cloud Hosting

### Prerequisites

- GitHub account with code pushed
- Render account
- Vercel account
- MongoDB Atlas account

### Part 1: Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or allow from anywhere: 0.0.0.0/0)
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/tinylink`)

### Part 2: Deploy Server to Render

1. **Log in to Render** and go to Dashboard
2. Click **New +** → **Web Service**
3. Connect GitHub and select your repository
4. Configure:
   - **Name**: `tinylink-server`
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `PORT`: `5000`
6. Click **Create Web Service**
7. Copy the service URL (e.g., `https://tinylink-server.onrender.com`)

### Part 3: Deploy Client to Vercel

1. **Log in to Vercel** and go to Dashboard
2. Click **Add New...** → **Project**
3. Import your repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
5. Add **Environment Variable**:
   - `NEXT_PUBLIC_API_URL`: Your Render server URL (no trailing slash)
6. Click **Deploy**

### Part 4: Verification

1. Open your Vercel deployment URL
2. Create a short link
3. Test the redirect functionality
4. Check stats page

---

## CI/CD with Jenkins

Automate your deployment process with Jenkins.

### Prerequisites

- Jenkins server running
- Docker installed on Jenkins
- Docker Hub credentials
- GitHub repository access

### Setup Steps

1. **Install Required Jenkins Plugins**:
   - Docker Pipeline
   - Docker Plugin
   - Git Plugin
   - Credentials Binding

2. **Configure Credentials**:
   - Add Docker Hub credentials (ID: `dockerhub-credentials`)
   - Add GitHub credentials (if private repo)

3. **Create Pipeline Job**:
   - New Item → Pipeline
   - Pipeline from SCM → Git
   - Repository URL: Your GitHub repo
   - Script Path: `Jenkinsfile`

4. **Set Environment Variables**:
   - Manage Jenkins → Configure System
   - Add `DOCKER_HUB_USERNAME` environment variable

5. **Configure Webhooks** (Optional):
   - GitHub repo → Settings → Webhooks
   - Payload URL: `http://your-jenkins-url:8080/github-webhook/`
   - Content type: `application/json`

### Pipeline Stages

The Jenkinsfile includes:
- **Checkout**: Clone repository
- **Build**: Create Docker images for server and client
- **Test**: Run automated tests
- **Push**: Push images to Docker Hub (main branch only)
- **Deploy**: Deploy to production (configurable)

📖 **See [JENKINS.md](./JENKINS.md)** for detailed Jenkins setup instructions

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **HTTPS**: Use SSL certificates (Let's Encrypt for free)
3. **Firewall**: Only open necessary ports
4. **Database**: Use strong passwords and IP whitelisting
5. **Updates**: Keep dependencies and Docker images updated

---

## 🐛 Troubleshooting

### Server Won't Start

- Check MongoDB connection string
- Verify environment variables are set
- Check server logs: `docker logs tinylink-server`

### Client Can't Connect to Server

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in server
- Ensure server is running and accessible

### Docker Issues

- Clear cache: `docker system prune -a`
- Rebuild images: `docker-compose build --no-cache`
- Check logs: `docker-compose logs`

---

## 📚 Additional Resources

- [DOCKER.md](./DOCKER.md) - Complete Docker documentation
- [JENKINS.md](./JENKINS.md) - Jenkins CI/CD setup guide
- [README.md](./README.md) - Project overview and local setup

---

**Need help?** Open an issue on GitHub or check the documentation files above.
