pipeline {
    agent any
    
    environment {
        // Docker Hub credentials (configure in Jenkins)
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        
        // Image names
        SERVER_IMAGE = "${env.DOCKER_HUB_USERNAME}/tinylink-server"
        CLIENT_IMAGE = "${env.DOCKER_HUB_USERNAME}/tinylink-client"
        
        // Git commit info
        GIT_COMMIT_SHORT = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()
        BUILD_TAG = "${env.BRANCH_NAME}-${env.GIT_COMMIT_SHORT}"
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
                sh 'git rev-parse HEAD'
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Server Image') {
                    steps {
                        script {
                            echo 'Building server Docker image...'
                            dir('server') {
                                sh """
                                    docker build \
                                        -t ${SERVER_IMAGE}:${BUILD_TAG} \
                                        -t ${SERVER_IMAGE}:latest \
                                        .
                                """
                            }
                        }
                    }
                }
                
                stage('Build Client Image') {
                    steps {
                        script {
                            echo 'Building client Docker image...'
                            dir('client') {
                                sh """
                                    docker build \
                                        -t ${CLIENT_IMAGE}:${BUILD_TAG} \
                                        -t ${CLIENT_IMAGE}:latest \
                                        .
                                """
                            }
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                script {
                    // Add your test commands here
                    // Example:
                    // sh 'cd server && npm test'
                    // sh 'cd client && npm test'
                    echo 'No tests configured yet'
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo 'Pushing Docker images to registry...'
                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS_ID}") {
                        // Push server images
                        sh """
                            docker push ${SERVER_IMAGE}:${BUILD_TAG}
                            docker push ${SERVER_IMAGE}:latest
                        """
                        
                        // Push client images
                        sh """
                            docker push ${CLIENT_IMAGE}:${BUILD_TAG}
                            docker push ${CLIENT_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo 'Deployment stage - configure based on your infrastructure'
                    // Add deployment commands here
                    // Examples:
                    // - Deploy to Kubernetes: kubectl apply -f k8s/
                    // - Deploy to Docker Swarm: docker stack deploy
                    // - SSH to server and pull images: ssh user@server 'docker-compose pull && docker-compose up -d'
                    echo 'Deployment not configured - images are ready in registry'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up...'
            sh """
                docker image prune -f
            """
        }
        success {
            echo 'Pipeline completed successfully!'
            // Add notifications here (email, Slack, etc.)
        }
        failure {
            echo 'Pipeline failed!'
            // Add failure notifications here
        }
    }
}
