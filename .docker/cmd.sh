#!/bin/bash
set -e
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate -n
chown www-data:www-data /app/var/data.db
node assets/js/sse-hub.js &
node assets/js/ws-hub.js &
JWT_KEY='!ChangeMe!' ADDR='0.0.0.0:3000' ./mercure --cors-allowed-origins="http://localhost:8000" &
apache2-foreground