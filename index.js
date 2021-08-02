'use strict';

const { client, Settings } = require('./src/service');
const { showError, saveToFile } = require('./src/utils');
const getUserAdapter = require('./src/user-adapter');
const { FILE_NAME } = require('./src/constants');

client.bind(Settings.USERNAME, Settings.PASSWORD, (err) => {
  if (err) {
    showError(err);
  }
});

client.on('connect', () => {
  console.log('---');
  console.log(`Connection established.`);
  console.log(`Server: ${Settings.URL}`);
  console.log(`User: ${Settings.USERNAME}`);
});

const searchOptions = {
  scope: 'sub',
  filter: process.argv[2],
};

const entries = [];

client.search(Settings.BASE_DN, searchOptions, (err, res) => {
  if (err) {
    showError(err);
  }

  res.on('searchEntry', (entry) => {
    entries.push(JSON.stringify(getUserAdapter(entry.object)));
    console.table(`${entries.length}. ${entry.object.name} [ ${entry.object.mail === undefined ? 'mail is undefined' : entry.object.mail} ]`);
  });

  res.on('error', (err) => {
    showError(err);
  });

  res.on('end', async () => {
    console.log('---');
    console.log(`Entries found: ${entries.length}`);
    console.log('---');
    console.log(`Saving to file: '${FILE_NAME}'`);
    await saveToFile(FILE_NAME, entries);
  });
});

client.unbind((err) => {
  if (err) {
    showError(err);
  }
});
