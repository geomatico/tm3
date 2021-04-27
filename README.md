#Taxo&Map 3.1

## Install npm, git and bower

https://nodejs.org/en/

https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

    npm install -g bower

## Install tm3

Requires git, npm and bower.

Clone this project:

    git clone https://github.com/geomatico/tm3.git

Install bower dependencies:

    bower install

Adding dependencies:

    bower install --save <bower_package>

## Install and start PostgreSQL and Geoserver

For Mac:

    cd /usr/local/geoserver/bin

    sh startup.sh

## Install and start Django REST Service

Download from https://github.com/geomatico/restmuseum

Run via runserver

    source .env

    python3 manage.py runserver 0.0.0.0:9999

Run via gunicorn

    source .env

    gunicorn -b 0.0.0.0:9999 restmuseum.wsgi
