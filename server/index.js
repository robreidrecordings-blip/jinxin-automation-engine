const express = require('express');
const fs = require('fs');
const path = require('path');
const { requireApiKey } = require('./auth');

const app = express();
app.use(express.json());
app.use(express.static('public'));

let jobs = [];
let jobId = 1;

app.post('/job', requireApiKey, (req, res) => {
  const { product } = req.body;

  if (!product || typeof product !== 'object' || !product.title || !product.description || !product.price) {
    return res.status(400).json({ error: 'product with title, description and price is required' });
  }

  const job = { id: jobId++, product, status: 'queued', attempts: 0, locked: false };
  jobs.push(job);
  res.status(201).json(job);
});

async function processJob(job) {
  const outputHtml = `
    <html><body>
      <h1>${job.product.title}</h1>
      <p>${job.product.description}</p>
      <strong>${job.product.price}</strong>
    </body></html>
  `;
  const filePath = path.join(__dirname, '../public/products/' + job.id + '.html');
  fs.writeFileSync(filePath, outputHtml);
  job.status = 'done';
  job.locked = false;
}

setInterval(async () => {
  const job = jobs.find(j => j.status === 'queued' && !j.locked);
  if (!job) return;
  job.locked = true;
  job.status = 'running';
  try {
    await processJob(job);
  } catch (error) {
    job.status = 'error';
    job.locked = false;
    console.error(`Job ${job.id} failed`, error);
  }
}, 1000);

app.listen(3000, () => console.log('System running on port 3000'));
