node_modules:
  yarn install
  npm install ws

vendor:
  composer install
  composer require mercure  
  
doctrine:
  php bin/console doctrine:database:create
  php bin/console make:migration
  php bin/console doctrine:migrations:migrate

start_servers: 
  symfony serve
  node assets/js/sse-server.js
  node assets/js/index.js
  JWT_KEY='!ChangeMe!' ADDR='localhost:3000' ALLOW_ANONYMOUS=1 CORS_ALLOWED_ORIGINS=* ./mercure
