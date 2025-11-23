# 🔧 Jenkins CI/CD Setup Guide for TinyLink

This guide walks you through setting up Jenkins for continuous integration and deployment of the TinyLink application.

---

## 📋 Prerequisites

- **Jenkins Server** (v2.400 or higher)
- **Docker** installed on Jenkins server
- **Git** installed on Jenkins server
- **Docker Hub account** (or other container registry)
- **GitHub repository** with TinyLink code

---

## 🚀 Jenkins Installation

### Option 1: Docker (Recommended for Testing)

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

### Option 2: Native Installation

**Windows**: Download from [jenkins.io](https://www.jenkins.io/download/)

**Linux (Ubuntu/Debian)**:
```bash
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt-get update
sudo apt-get install jenkins
```

**Access Jenkins**: Open http://localhost:8080

**Initial Setup**:
1. Get initial admin password:
   ```bash
   # Docker
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   
   # Linux
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
2. Install suggested plugins
3. Create admin user

---

## 🔌 Required Jenkins Plugins

Install these plugins via **Manage Jenkins → Manage Plugins**:

1. **Docker Pipeline** - For Docker commands in pipeline
2. **Docker Plugin** - Docker integration
3. **Git Plugin** - Git repository integration
4. **Pipeline Plugin** - Pipeline support (usually pre-installed)
5. **Credentials Binding Plugin** - Secure credential management
6. **GitHub Plugin** - GitHub integration (optional, for webhooks)

### Install Plugins via CLI

```bash
# Access Jenkins container
docker exec -it jenkins bash

# Install plugins
jenkins-plugin-cli --plugins docker-workflow docker-plugin git pipeline-model-definition credentials-binding github
```

---

## 🔐 Configure Credentials

### 1. Docker Hub Credentials

1. Go to **Manage Jenkins → Manage Credentials**
2. Click **(global)** domain
3. Click **Add Credentials**
4. Configure:
   - **Kind**: Username with password
   - **Username**: Your Docker Hub username
   - **Password**: Your Docker Hub password or access token
   - **ID**: `dockerhub-credentials`
   - **Description**: Docker Hub Credentials

> [!TIP]
> Use a Docker Hub **Access Token** instead of your password for better security.
> Create one at: https://hub.docker.com/settings/security

### 2. GitHub Credentials (Optional)

For private repositories or webhooks:

1. **Add Credentials** (same as above)
2. Configure:
   - **Kind**: Username with password (or SSH key)
   - **Username**: Your GitHub username
   - **Password**: GitHub Personal Access Token
   - **ID**: `github-credentials`

**Create GitHub Token**: https://github.com/settings/tokens
- Required scopes: `repo`, `admin:repo_hook`

---

## 🏗️ Create Jenkins Pipeline

### Method 1: Pipeline from SCM (Recommended)

1. Click **New Item**
2. Enter name: `TinyLink-Pipeline`
3. Select **Pipeline**
4. Click **OK**
5. In **Pipeline** section:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: Your GitHub repo URL
   - **Credentials**: Select GitHub credentials (if private)
   - **Branch**: `*/main` (or your default branch)
   - **Script Path**: `Jenkinsfile`
6. Click **Save**

### Method 2: Direct Pipeline Script

1. Create pipeline as above
2. In **Pipeline** section:
   - **Definition**: Pipeline script
   - Paste the contents of your `Jenkinsfile`
3. Click **Save**

---

## ⚙️ Configure Environment Variables

### Set Docker Hub Username

1. Go to **Manage Jenkins → Configure System**
2. Scroll to **Global properties**
3. Check **Environment variables**
4. Add:
   - **Name**: `DOCKER_HUB_USERNAME`
   - **Value**: Your Docker Hub username
5. Click **Save**

---

## 🔗 Configure GitHub Webhooks (Optional)

For automatic builds on push:

### 1. In Jenkins

1. Open your pipeline configuration
2. Under **Build Triggers**, check:
   - ☑️ **GitHub hook trigger for GITScm polling**
3. Save

### 2. In GitHub

1. Go to your repository → **Settings → Webhooks**
2. Click **Add webhook**
3. Configure:
   - **Payload URL**: `http://your-jenkins-url:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Just the push event
4. Click **Add webhook**

> [!WARNING]
> Your Jenkins server must be publicly accessible for GitHub webhooks to work.
> For local development, use tools like [ngrok](https://ngrok.com/) or trigger builds manually.

---

## 🏃 Running the Pipeline

### Manual Trigger

1. Open your pipeline
2. Click **Build Now**
3. Watch the build progress in **Build History**
4. Click on build number → **Console Output** to view logs

### Automatic Trigger

- Push code to GitHub (if webhooks configured)
- Pipeline will automatically start

---

## 📊 Pipeline Stages Explained

The TinyLink Jenkinsfile includes these stages:

### 1. **Checkout**
- Clones the repository from GitHub
- Verifies Git commit

### 2. **Build Docker Images**
- Builds server and client images in parallel
- Tags images with branch name and commit SHA
- Tags images as `latest`

### 3. **Test**
- Runs tests (configure as needed)
- Currently placeholder - add your test commands

### 4. **Push to Registry**
- **Only runs on `main` branch**
- Pushes images to Docker Hub
- Tags: `branch-commitSHA` and `latest`

### 5. **Deploy**
- **Only runs on `main` branch**
- Placeholder for deployment logic
- Configure based on your infrastructure

---

## 🔧 Customizing the Pipeline

### Update Docker Hub Username

Edit `Jenkinsfile` and update:
```groovy
environment {
    SERVER_IMAGE = "yourusername/tinylink-server"
    CLIENT_IMAGE = "yourusername/tinylink-client"
}
```

Or set `DOCKER_HUB_USERNAME` environment variable in Jenkins.

### Add Tests

Update the **Test** stage in `Jenkinsfile`:
```groovy
stage('Test') {
    steps {
        script {
            sh 'cd server && npm install && npm test'
            sh 'cd client && npm install && npm test'
        }
    }
}
```

### Add Deployment

Update the **Deploy** stage:

**Example: Deploy to Remote Server via SSH**
```groovy
stage('Deploy') {
    when {
        branch 'main'
    }
    steps {
        script {
            sshagent(['ssh-credentials']) {
                sh '''
                    ssh user@your-server "
                        cd /path/to/app &&
                        docker-compose pull &&
                        docker-compose up -d
                    "
                '''
            }
        }
    }
}
```

**Example: Deploy to Kubernetes**
```groovy
stage('Deploy') {
    steps {
        script {
            sh 'kubectl apply -f k8s/'
            sh 'kubectl rollout restart deployment/tinylink-server'
            sh 'kubectl rollout restart deployment/tinylink-client'
        }
    }
}
```

---

## 🐛 Troubleshooting

### Docker Permission Denied

If Jenkins can't access Docker:

**Linux**:
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**Docker-in-Docker**:
```bash
docker exec -u root jenkins chmod 666 /var/run/docker.sock
```

### Pipeline Fails at Docker Push

- Verify Docker Hub credentials are correct
- Check credential ID matches `dockerhub-credentials`
- Ensure you're logged in: `docker login`

### Git Clone Fails

- For private repos, ensure GitHub credentials are configured
- Check repository URL is correct
- Verify network connectivity

### Build Hangs or Times Out

- Increase timeout in `Jenkinsfile`:
  ```groovy
  options {
      timeout(time: 60, unit: 'MINUTES')
  }
  ```

### Docker Build Cache Issues

Clear Docker cache:
```bash
docker builder prune -a
```

---

## 📧 Notifications

### Email Notifications

Add to `post` section in `Jenkinsfile`:
```groovy
post {
    success {
        emailext (
            subject: "✅ Build Successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Build completed successfully.",
            to: "your-email@example.com"
        )
    }
    failure {
        emailext (
            subject: "❌ Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Build failed. Check console output.",
            to: "your-email@example.com"
        )
    }
}
```

### Slack Notifications

Install **Slack Notification Plugin** and add:
```groovy
post {
    success {
        slackSend (
            color: 'good',
            message: "Build Successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        )
    }
}
```

---

## 📊 Monitoring Builds

### View Build History
- Pipeline page shows all builds
- Click build number for details

### Console Output
- Real-time build logs
- Useful for debugging

### Blue Ocean UI
- Install **Blue Ocean** plugin
- Modern, visual pipeline interface
- Access via Jenkins sidebar

---

## 🔒 Security Best Practices

1. **Use Access Tokens** instead of passwords
2. **Limit credential scope** to specific pipelines
3. **Enable CSRF protection** in Jenkins
4. **Use HTTPS** for Jenkins server
5. **Regular updates** - Keep Jenkins and plugins updated
6. **Backup** Jenkins configuration regularly

---

## 📚 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Docker Pipeline Plugin](https://plugins.jenkins.io/docker-workflow/)
- [Jenkins Best Practices](https://www.jenkins.io/doc/book/pipeline/pipeline-best-practices/)

---

## 🆘 Getting Help

- Check [DOCKER.md](./DOCKER.md) for Docker-specific issues
- Review [README.md](./README.md) for application setup
- Jenkins logs: `docker logs jenkins` or `/var/log/jenkins/jenkins.log`

---

**Happy Building! 🚀**
