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
                bat 'echo Cleaning workspace...'
            }
        }
        stage('Verify Environment') {
            steps {
                bat 'echo Current PATH=%NODEJS_PATH%'
                bat 'where node'
                bat 'where npm'
            }
        }
        stage('Pre-Deployment API Calls') {
            steps {
                bat 'C:\\NemasisDAST\\nemasis_predeploy.bat'
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
                
                // Force clean installation
                bat '''
                echo Removing node_modules...
                if exist node_modules rmdir /s /q node_modules
                
                echo Removing package-lock.json...
                if exist package-lock.json del /f /q package-lock.json

                echo Running fresh npm install...
                npm install
                '''

                // Ensure react-scripts is installed
                bat '''
                echo Checking react-scripts...
                npm list react-scripts || (echo Installing react-scripts... & npm install react-scripts --save-dev)
                '''
            }
        }
        stage('Build') {
            steps {
                bat '''
                setlocal
                set CI=false
                npm run build || (echo Build failed! Retrying... & npm install && npm run build)
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
                bat 'xcopy /E /I /Y build C:\\inetpub\\wwwroot\\my-react-app'
            }
        }
        stage('Post-Deployment API Calls') {
            steps {
                bat 'C:\\NemasisDAST\\nemasis_postdeploy.bat'
            }
        }
    }
}
