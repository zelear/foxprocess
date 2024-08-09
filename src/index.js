const promClient = require('prom-client');
const express = require('express');
const os = require('node-os-utils');
const { randomUUID } = require('crypto');
const { readFileSync, existsSync, writeFileSync } = require('fs');

const app = express();

const appID = getID();
const port = process.env.SERVER_PORT || 61300;

const memoryUsageMb = new promClient.Gauge({
    name: 'memory_usage_mb',
    help: 'Использование ОЗУ в MB'
});
const memoryUsagePer = new promClient.Gauge({
    name: 'memory_usage_percentage',
    help: 'Использование ОЗУ в процентах'
});
const memoryTotalMb = new promClient.Gauge({
    name: 'memory_total_mb',
    help: 'Всего ОЗУ в MB'
});
const cpuUsage = new promClient.Gauge({
    name: 'cpu_usage_percentage',
    help: 'Использование процессора в процентах'
});
const cpuCores = new promClient.Gauge({
    name: 'cpu_cores',
    help: 'Ядер процессора'
});
const driveUsageGb = new promClient.Gauge({
    name: 'drive_usage_gb',
    help: 'Использование диска в ГБ'
});
const driveUsagePer = new promClient.Gauge({
    name: 'drive_usage_percentage',
    help: 'Использование диска в процентах'
});
const driveTotalGb = new promClient.Gauge({
    name: 'drive_total',
    help: 'Всего диска в ГБ'
});
const networkInputMb = new promClient.Gauge({
    name: 'network_input_mb',
    help: 'Использование сети вход'
});
const networkOutputMb = new promClient.Gauge({
    name: 'network_output_mb',
    help: 'Использование сети выход'
});

promClient.register.setDefaultLabels({
    app_id: appID
});

promClient.collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
    await updateStat();

    res.setHeader('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

app.listen(port, () => {console.log(`Сервер запущен на порту ${port}!\nID приложения: ${appID}`)});

async function getStat() {
    const memoryStat = await os.mem.info();
    const driveStat = await os.drive.info();
    const netStat = await os.netstat.inOut();
    const memory = {
        usage: memoryStat.usedMemMb,
        perUsage: 0,
        total: memoryStat.totalMemMb
    };
    const cpu = {
        usage: await os.cpu.usage(),
        cores: os.cpu.count()
    };
    const drive = {
        usage: Number(driveStat.usedGb),
        perUsag: Number(driveStat.usedPercentage),
        total: Number(driveStat.totalGb)
    };
    const network = {
        in: netStat.total.inputMb,
        out: netStat.total.outputMb
    }
    memory.perUsage = Number(((memory.usage/memory.total)*100).toFixed(2));
    
    return { memory, cpu, drive, network };
};

async function updateStat() {
    const stat = await getStat();

    memoryUsageMb.set(stat.memory.usage);
    memoryUsagePer.set(stat.memory.perUsage);
    memoryTotalMb.set(stat.memory.total);
    cpuUsage.set(stat.cpu.usage);
    cpuCores.set(stat.cpu.cores);
    driveUsageGb.set(stat.drive.usage);
    driveUsagePer.set(stat.drive.perUsag);
    driveTotalGb.set(stat.drive.total);
    networkInputMb.set(stat.network.in);
    networkOutputMb.set(stat.network.out);

};

function getID() {
    if (existsSync('data.json')) {
        const { id } = JSON.parse(readFileSync('data.json', 'utf-8'));
        return id;
    } else {
        const id = randomUUID();
        writeFileSync('data.json', JSON.stringify({ id }));
        return id;
    }
};

process.on('multipleResolves', err => console.error(err));
process.on('uncaughtException', err => console.error(err));
process.on('uncaughtExceptionMonitor', err => console.error(err));
process.on('unhandledRejection', err => console.error(err));
