pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        NODE_OPTIONS = "--max-old-space-size=1536"
        JENKINS_NODE_COOKIE = "dontKillMeHWC"
        HWC_APP_DIR = "/var/www/apps/hwc/back"
    }

    stages {
        stage('Backend prepare and build') {
            tools {
                nodejs 'node-22.22.3'
            }

            steps {
                withCredentials([file(credentialsId: 'envhwc', variable: 'ENV_FILE')]) {
                    sh 'rm -f ./back/.env'
                    sh 'cp "$ENV_FILE" ./back/.env'
                }

                dir('./back') {
                    sh '''
                    set -e

                    echo "[backend] Installing dependencies..."
                    npm ci

                    echo "[backend] Building..."
                    npm run build

                    echo "[backend] Copying config into dist..."
                    rm -rf ./dist/config
                    cp -r ./config ./dist/config

                    echo "[backend] Verifying production artifact..."
                    test -f ./dist/utils/locale.js
                    '''
                }
            }
        }

        stage('Frontend prepare') {
            tools {
                nodejs 'node-22.22.3'
            }

            steps {
                withCredentials([file(credentialsId: 'envhwc-front', variable: 'ENV_FILE')]) {
                    sh 'rm -f ./front/.env'
                    sh 'cp "$ENV_FILE" ./front/.env'
                }

                dir('./front') {
                    sh '''
                    set -e

                    echo "[frontend] Installing dependencies..."
                    npm ci

                    echo "[frontend] Generating icons..."
                    npx icongenie generate -m pwa -i ./public/logo.png
                    '''
                }
            }
        }

        stage('Frontend build') {
            tools {
                nodejs 'node-22.22.3'
            }

            steps {
                dir('./front') {
                    sh '''
                    set -e

                    echo "[frontend] Building Quasar PWA..."
                    quasar build -m pwa

                    echo "[frontend] Creating version.json..."
                    echo "{\"version\":\"${BUILD_NUMBER}-$(date +%s)\"}" > ./dist/pwa/version.json

                    echo "[frontend] Copying PWA into backend public..."
                    mkdir -p ../back/public/uploads
                    find ../back/public -mindepth 1 -maxdepth 1 ! -name uploads -exec rm -rf {} +
                    mkdir -p ../back/public
                    rsync -az --delete --exclude uploads/ ./dist/pwa/ ../back/public/
                    '''
                }
            }
        }

        stage('Deploy') {
            tools {
                nodejs 'node-22.22.3'
            }

            steps {
                dir('./back') {
                    sh '''
                    set -e

                    echo "[deploy] Deploying HWC to $HWC_APP_DIR..."

                    mkdir -p "$HWC_APP_DIR"

                    # Keep the live public directory out of the destructive sync. New
                    # hashed assets are copied first and entry files are published last.
                    rsync -az --delete \
                      --exclude node_modules \
                      --exclude public/ \
                      ./ "$HWC_APP_DIR/"

                    mkdir -p "$HWC_APP_DIR/public/uploads"

                    rsync -az \
                      --exclude uploads/ \
                      --exclude index.html \
                      --exclude version.json \
                      --exclude sw.js \
                      --exclude service-worker.js \
                      ./public/ "$HWC_APP_DIR/public/"

                    for entry_file in sw.js service-worker.js version.json index.html; do
                      if [ -f "./public/$entry_file" ]; then
                        cp "./public/$entry_file" "$HWC_APP_DIR/public/$entry_file"
                      fi
                    done

                    echo "[deploy] Syncing dependencies..."
                    rsync -az --delete ./node_modules "$HWC_APP_DIR/"

                    cd "$HWC_APP_DIR"

                    echo "[deploy] Running migrations..."
                    npx sequelize-cli db:migrate

                    echo "[deploy] Running seeds..."
                    npx sequelize-cli db:seed:all || true

                    echo "[deploy] Restarting PM2..."
                    NODE_ENV=production pm2 startOrReload ecosystem.config.cjs --update-env

                    pm2 save
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            tools {
                nodejs 'node-22.22.3'
            }

            steps {
                sh '''
                set -e

                echo "[verify] PM2 list..."
                pm2 list

                echo "[verify] Checking HWC..."
                pm2 list | grep HWCBackend

                echo "[verify] Local HTTP check..."
                curl -I --max-time 10 http://127.0.0.1:8004 || true
                '''
            }
        }
    }
}
