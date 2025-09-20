docker-compose -f medusa-server/docker-compose.yml build

docker-compose -f medusa-server/docker-compose.yml up -d --build
docker-compose -f strapi-server/docker-compose.yml up -d --build


 docker-compose -f medusa-server/docker-compose.yml logs medusa