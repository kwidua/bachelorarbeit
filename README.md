# bachelorarbeit

#### Setup:
```npm install ws```

```composer require mercure```

#### database:
```php bin/console doctrine:database:create```

```php bin/console doctrine:migrations:migrate```

#### Start servers:
* symfony: ```symfony serve```
* websocket: ```node assets/js/sse-server.js```
* sse: ```node assets/js/index.js```
* mercure: ```JWT_KEY='!ChangeMe!' ADDR='localhost:3000' ALLOW_ANONYMOUS=1 CORS_ALLOWED_ORIGINS=* ./mercure```
