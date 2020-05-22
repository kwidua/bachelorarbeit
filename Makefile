node_modules: package.json yarn.lock
	yarn install

vendor: composer.json composer.lock
	composer install  
  
doctrine: vendor
	php bin/console doctrine:database:create
	php bin/console doctrine:migrations:migrate -n

dev: node_modules vendor doctrine
	symfony serve &
	node assets/js/sse-server.js &
	node assets/js/index.js &
	JWT_KEY='!ChangeMe!' ADDR='localhost:3000' ALLOW_ANONYMOUS=1 ./mercure --cors-allowed-origins="https://localhost:8000" &
	yarn watch
