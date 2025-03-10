pipeline {
    agent any
    environment {
        NODE_VERSION = '18'
        NODEJS_PATH = 'C:\\Program Files\\nodejs' // Ensure this matches your Node.js installation path
    }
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/darsh132/jenkins-test.git'
            }
        }
        stage('Verify Environment') {
            steps {
                script {
                    bat 'echo Current PATH=%NODEJS_PATH%'
                    bat 'where node'  // Check where Node.js is installed
                    bat 'where npm'   // Check where npm is installed
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                script {
                    // Ensure Node.js is added to PATH only if not already present
                    if (!env.PATH.contains(NODEJS_PATH)) {
                        env.PATH = "${NODEJS_PATH};${env.PATH}"
                    }
                }
                bat 'node -v'  // Verify Node.js installation
                bat 'npm -v'   // Verify npm installation
                bat 'npm install --legacy-peer-deps --no-audit --no-fund --ci=false'
            }
        }
        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }
        stage('Test') {
            steps {
                bat 'npm test -- --watchAll=false --ci=false'
            }
        }
        stage('Deploy') {
            steps {
                bat '''
                xcopy /E /I /Y build C:\\inetpub\\wwwroot\\my-react-app
                '''
            }
        }
    }
}
