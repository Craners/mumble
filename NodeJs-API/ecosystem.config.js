module.exports = {
  apps: [{
    name: 'API',
    script: 'server.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    output: '~/logs/out.log',
    error: '~/logs/error.log',
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm",

    args: 'one two',
    instances: 2,
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    env: {
      "NODE_ENV": "development",
    },
    env_production: {
      "NODE_ENV": "production"
    }
  }]
};
