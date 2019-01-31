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
      "CONFIG": "dev.conf.json",
      "NODE_ENV": "development",
      "database": "ds249992.mlab.com:49992/mumble"
    },
    env_production: {
      "CONFIG": "conf.json",
      "NODE_ENV": "production",
      "database": "ds115854.mlab.com:15854/mumbleprod"
    }
  }]
};
