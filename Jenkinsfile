pipeline {
    agent any
    environment {
        NODE_VERSION = '18'
    }
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/darsh132/jenkins-test.git'
            }
        }
        stage('Install Dependencies') {
            steps {
                script {
                    def nodejs = tool name: 'NodeJS 18', type: 'NodeJSInstallation'
                    env.PATH = "${nodejs}\\bin;${env.PATH}"
                }
                bat 'npm install'
            }
        }
        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }
        stage('Test') {
            steps {
                bat 'npm test -- --watchAll=false'
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
