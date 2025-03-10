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
                bat '''
                :: Set Lookup 
                 curl -X POST "http://192.168.0.150:8181/api/lookup" ^
                     -H "Content-Type: application/json" ^
                     -H "Authorization: Bearer 56576214b49c5033" ^
                     --data-raw "{"url":"http://dev-escanai"}"

                :: Set Context Method
                curl -X POST "http://192.168.0.150:8181/api/setContext" ^
                     -H "Content-Type: application/json" ^
                     -H "Authorization: Bearer 56576214b49c5033" ^
                     --data-raw "{\"contextName\":\"Custom Context\",\"authType\":\"HTTP\",\"users\":[{\"username\":\"js@escanav.com\"}],\"forcedUserMode\":true}"

                :: Set Authentication Method
                curl -X POST "http://192.168.0.150:8181/api/setAuthentication" ^
                     -H "Content-Type: application/json" ^
                     -H "Authorization: Bearer 56576214b49c5033" ^
                     --data-raw "{\"contextName\":\"Custom Context\",\"authMethod\":\"Form-based\",\"loginUrl\":\"http://dev-escanai/signin\",\"loginParams\":\"username=js@escanav.com&password=JS12JS\",\"testUrl\":\"http://dev-escanai/dashboard\"}"
                '''
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
        stage('Post-Deployment API Calls') {
            steps {
                bat '''
                :: Initiate Spider Scan
                curl -X POST "http://192.168.0.150:8181/api/spiderScan" ^
                     -H "Content-Type: application/json" ^
                     -H "Authorization: Bearer 56576214b49c5033" ^
                     --data-raw "{\"url\":\"http://dev-escanai\",\"maxChildren\":\"0\",\"recurse\":true,\"subtreeOnly\":true,\"alertLimit\":10000}"

                :: Fetch Spider Scan Data
                curl -X POST "http://192.168.0.150:8181/api/spiderScanData" ^
                     -H "Content-Type: application/json" ^
                     -H "Authorization: Bearer 56576214b49c5033" ^
                     --data-raw "{\"dateUTC\":{\"after\":\"0\"},\"spiderScanId\":{\"noteq\":\"0\"}}"
                '''
            }
        }
    }
}