<h1 style="text-align: center; color: #FF5300; font-size: 52px">FOXPROCESS</h1>

### Запуск
```bash
docker run -d \
   --name foxprocess \
   --network=host \
   --restart=always \
   -e SERVER_PORT=61300 \
   zelear/foxprocess:latest
```
