
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

let jobs = [];
let jobId = 1;

// CREATE JOB
app.post('/job', (req, res) => {
  const { product } = req.body;

  const job = {
    id: jobId++,
    product,
    status: 'queued',
    attempts: 0,
    locked: false
  };

  jobs.push(job);
  res.json(job);
});

// SIMPLE WORKER LOOP
async function processJob(job) {
  const outputHtml = `
    <html>
      <body>
        <h1>${job.product.title}</h1>
        <p>${job.product.description}</p>
        <strong>${job.product.price}</strong>
      </body>
    </html>
  `;

  const filePath = path.join(__dirname, '../public/products/' + job.id + '.html');
  fs.writeFileSync(filePath, outputHtml);

  job.status = 'done';
  job.locked = false;
}

// LOOP
setInterval(async () => {
  const job = jobs.find(j => j.status === 'queued' && !j.locked);

  if (!job) return;

  job.locked = true;
  job.status = 'running';

  await processJob(job);

}, 1000);

app.listen(3000, () => {
  console.log('System running on port 3000');
});
