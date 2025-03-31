pipeline {
    agent any
    environment {
        NODE_VERSION = '18'
        NODEJS_PATH = 'C:\\Program Files\\nodejs'
        CI = 'false'  // Ensure CI is false globally
        API_KEY = '<API_KEY>' // Replace with your actual API key
    }
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/darsh132/jenkins-test.git'
            }
        }
        stage('Clean Workspace') {
            steps {
                script {
                    bat 'echo Cleaning workspace...'
                    bat 'rmdir /s /q node_modules'  // Delete node_modules if exists
                    bat 'del /f /q package-lock.json'  // Remove package-lock.json
                    bat 'del /f /q npm-shrinkwrap.json'  // Remove npm shrinkwrap if exists
                }
            }
        }
        stage('Verify Environment') {
            steps {
                script {
                    bat 'echo Current PATH=%NODEJS_PATH%'
                    bat 'where node'
                    bat 'where npm'
                }
            }
        }
        stage('Pre-Deployment API Calls') {
            steps {
                bat 'C:\\NemasisDAST\\predeployment.bat'
            }
        }
        stage('Install Dependencies') {
            steps {
                script {
                    if (!env.PATH.contains(NODEJS_PATH)) {
                        env.PATH = "${NODEJS_PATH};${env.PATH}"
                    }
                }
                bat 'node -v'
                bat 'npm -v'
            }
        }
        stage('Build') {
            steps {
                bat '''
                setlocal
                set CI=false
                npm run build
                endlocal
                '''
            }
        }
        stage('Test') {
            steps {
                bat '''
                setlocal
                set CI=false
                npm test -- --watchAll=false --passWithNoTests
                endlocal
                '''
            }
        }
        stage('Deploy') {
            steps {
                bat '''
                xcopy /E /I /Y build C:\\inetpub\\wwwroot\\my-react-app
                '''
            }
        }
        stage('Post-Deployment API Calls') {
            steps {
                bat 'C:\\NemasisDAST\\postdeployment.bat'
            }
        }
    }
}
