
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    environment {
        PATH = "/Users/karthik/.docker/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${env.PATH}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo 'GitHub checkout completed.'
            }
        }

        stage('Docker Build and Start') {
            steps {
                sh '''
                    cp "$HOME/Desktop/medilink_devops/.env" .env
                    chmod 600 .env
                    docker compose up -d --build
                '''
                echo 'Docker containers started successfully.'
            }
        }

        stage('Application Health Check') {
            steps {
                sh '''
                    for i in $(seq 1 30); do
                        if curl -fsS http://localhost:8081/login.html > /dev/null &&
                           curl -fsS http://localhost:8000/api/hospitals > /dev/null; then
                            echo "MediLink is ready."
                            exit 0
                        fi
                        sleep 2
                    done

                    echo "MediLink failed to start."
                    exit 1
                '''
            }
        }

        stage('Selenium Testing') {
            steps {
                dir('selenium-tests') {
                    sh 'mvn test'
                }
                echo 'Selenium tests completed.'
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true,
                  testResults: 'selenium-tests/target/surefire-reports/*.xml'
        }

        success {
            echo 'MediLink CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }
    }
}
