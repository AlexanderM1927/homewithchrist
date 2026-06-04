module.exports = {
  apps: [
    {
      name: 'HWCBackend',
      cwd: '/var/www/apps/homewithchrist/back',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}