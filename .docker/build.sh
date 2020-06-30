#!/bin/bash
set -e
a2enmod rewrite

apt-get update
apt-get install -y nodejs npm wget git
npm install -g yarn
yarn install

wget -O /usr/local/bin/composer https://getcomposer.org/composer-stable.phar
chmod a+x /usr/local/bin/composer
composer install

chown -R www-data:www-data /app