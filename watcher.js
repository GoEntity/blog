const chokidar = require('chokidar');
const simpleGit = require('simple-git');
const async = require('async');
const express = require('express'); //for webhook

const git = simpleGit();
git.cwd('E:\\Git\\GoEntity');

const watcher = chokidar.watch('E:\\Git\\GoEntity', {
  ignored: /(^|[\/\\])\..|node_modules/,
  persistent: true
});

const gitQueue = async.queue((task, callback) => {
  const { action, path } = task;

  console.log(`File ${path} :: ${action}`);
  git.add('.')
    .commit(`auto commit (::file ${action})`)
    .push('origin', 'main')
    .then(() => {
      console.log('push successful');
      callback();
    })
    .catch((err) => {
      console.error('error: ', err);
      callback(err);
    });
}, 1);

['add', 'change', 'delete'].forEach(action => {
  watcher.on(action, path => gitQueue.push({ action, path }));
});

//adding webhook
const app = express();
const port = 3000;

app.use(express.json());


app.post('/webhook', function(req, res) {
  git.pull('origin', 'main')
    .then(() => console.log('successfully pulled recent changes made on repo blog_personal_node'))
    .catch((err) => console.error('error: ', err));

  res.sendStatus(200);
});

app.listen(port, function() {
  console.log('listening on port :: ', port);
});