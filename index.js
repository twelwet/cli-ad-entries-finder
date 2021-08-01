'use strict';

const assert = require('assert');
const {client, Settings} = require('./service');

client.bind(Settings.USERNAME, Settings.PASSWORD, (err) => {
    assert.ifError(err);
});

client.on('connect', () => {
    console.log('---');
    console.log(`Соединение установлено`);
    console.log(`Сервер: ${Settings.URL}`);
    console.log(`Пользователь: ${Settings.USERNAME}`);
});

const searchOptions = {
    sizelimit: 2000,
    scope: 'sub',
    filter: process.argv[2],
};

const entries = [];

client.search(Settings.BASE_DN, searchOptions, (err, res) => {
    assert.ifError(err);

    res.on('searchEntry', (entry) => {
        entries.push(entry);
        console.log(`${entries.length}. ${entry.object.name} [ ${entry.object.mail === undefined ? 'Почта не заведена' : entry.object.mail} ]`);
    });

    res.on('error', (err) => {
        console.log('---');
        console.log(`Найдено записей: ${entries.length}`);
        console.log('---');
        console.error('Ошибка: ' + err.message);
        process.exit(1);
    });

    res.on('end', () => {
        console.log('---');
        console.log(`Найдено записей: ${entries.length}`);
        console.log('---');
        process.exit(0);
    })
});

client.unbind((err) => {
    assert.ifError(err);
});
