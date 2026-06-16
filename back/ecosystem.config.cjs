module.exports = {
  apps: [
    {
      name: 'HWCBackend',
      cwd: '/var/www/apps/hwc/back',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}