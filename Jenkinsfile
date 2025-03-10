pipeline {
    agent any
    environment {
        NODE_VERSION = '18'
        NODEJS_PATH = 'C:\\Program Files\\nodejs'
        CI = 'false'  // Ensure CI is false globally
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
                    bat 'where node'
                    bat 'where npm'
                }
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
                bat 'npm install --legacy-peer-deps --no-audit --no-fund'
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
        stage('Post Deployment API Calls') {
            steps {
                bat '''
                curl -X POST "http://192.168.0.150:8181/z" ^
                     -H "Content-Type: application/json" ^
                     -H "charsets: utf-8" ^
                     -H "X-Forwarded-For: 192.168.0.150" ^
                     -H "X-Username: admin" ^
                     --data-raw "{\\"services\\":\\"z\\",\\"head\\":\\"lookup\\",\\"action\\":\\"set\\",\\"parameters\\":{\\"dig\\":{\\"url\\":\\"http://dev-escanai\\",\\"dnsIp\\":\\"8.8.8.8\\"}}}"
                     
                curl -X POST "http://192.168.0.150:8181/z" ^
                     -H "Content-Type: application/json" ^
                     -H "charsets: utf-8" ^
                     -H "X-Forwarded-For: 192.168.0.150" ^
                     -H "X-Username: admin" ^
                     --data-raw "{\\"services\\":\\"z\\",\\"head\\":\\"spiderScanData\\",\\"parameters\\":[{\\"scanList\\":{\\"dateUTC\\":{\\"after\\":\\"0\\"},\\"spiderScanId\\":{\\"noteq\\":\\"0\\"}}}],\\"action\\":\\"get\\"}"
                     
                curl -X POST "http://192.168.0.150:8181/z" ^
                     -H "Content-Type: application/json" ^
                     -H "charsets: utf-8" ^
                     -H "X-Forwarded-For: 192.168.0.150" ^
                     -H "X-Username: admin" ^
                     --data-raw "{\\"services\\":\\"z\\",\\"head\\":\\"spiderScan\\",\\"action\\":\\"set\\",\\"parameters\\":{\\"scan\\":{\\"url\\":\\"http://dev-escanai\\",\\"maxChildren\\":\\"0\\",\\"recurse\\":true,\\"contextName\\":\\"\\",\\"subtreeOnly\\":true,\\"mode\\":true,\\"alertLimit\\":10000}},\\"parametersActiveScan\\":{\\"recurse\\":true,\\"inScopeOnly\\":false,\\"scanPolicyName\\":\\"Default Policy\\"}}"
                '''
            }
        }
    }
}
