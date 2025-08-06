module.exports = {
  apps: [
    {
      name: 'qorgau-api',
      script: 'dist/src/main.js',
      instances: '1',
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'postgresql://postgres:Qqwerty1!@localhost:5432/qorgau?schema=public',
      },
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      time: true,
    },
  ],
};
