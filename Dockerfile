FROM php:7.3-apache

COPY . /app

COPY .docker/vhost.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /app

RUN bash /app/.docker/build.sh

EXPOSE 3000

EXPOSE 4000

EXPOSE 5000

CMD bash /app/.docker/cmd.sh