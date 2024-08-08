<h1 style="text-align: center; color: #FF5300; font-size: 52px">FOXPROCESS</h1>

### Инструкция по установке
```
Для корректной работы установите NodeJS 20 и выше.
```
Команды:
```bash
mkdir /var/lib/foxprocess && cd /var/lib/foxprocess
```
```bash
git clone https://github.com/zelear/foxprocess.git .
```
```bash
npm i . && npm i -g pm2
```
```bash
pm2 start start.config.js && pm2 save
```