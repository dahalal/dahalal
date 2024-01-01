const express = require('express');
const bodyParser = require('body-parser');
const db = require('./src/db');
const sendProductFeedback = require('./src/send-product-feedback');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());

// Your secret API key for authentication
const API_SECRET = process.env.API_SECRET || 'secret';

// Function to check if the API secret header is valid
const isValidApiSecret = (req) => {
  const apiSecretHeader = req.headers['x-api-secret'];
  return apiSecretHeader === API_SECRET;
};

app.get('/products/:id', (req, res) => {
  // Check for the API secret header
  if (!isValidApiSecret(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

  if (!row) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ product: row });
});

// Endpoint to create a new product
app.post('/products/:id', (req, res) => {
  // Check for the API secret header
  if (!isValidApiSecret(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const id = req.params.id;
  const { name, ingredients, source } = req.body;

  if (!id || !name || !ingredients || !source) {
    return res.status(400).json({ error: 'Product id, name, ingredients, and source are required' });
  }

  // Check if the product already exists
  const existingProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

  if (existingProduct) {
    // Update the existing record and timestamp
    db.prepare('UPDATE products SET name = ?, ingredients = ?, source = ?, timestamp = CURRENT_TIMESTAMP WHERE id = ?')
      .run(name, ingredients, source, id);

    res.json({ id });
  } else {
    // Insert a new record with the provided ID and timestamp
    db.prepare(
      'INSERT INTO products (id, name, ingredients, source, timestamp) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
    ).run(id, name, ingredients, source);

    res.status(201).json({ id });
  }
});

// Endpoint to create a new product
app.post('/products/:id/feedback', (req, res) => {
  // Check for the API secret header
  if (!isValidApiSecret(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const id = req.params.id;
  const { message } = req.body;

  if (!id || !message) {
    return res.status(400).json({ error: 'Product id and message are required' });
  }

  const existingProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

  if (existingProduct) {
    sendProductFeedback(existingProduct, message).then(({ data, error }) => {
      if (error) {
        console.error("Error received when trying to send product feedback", error);
        res.status(400).json({ error: error });
        return;
      }

      console.log("product feedback successfully sent", JSON.stringify(data));
      res.json({ ok: true });
    }).catch(err => {
      console.error("Error thrown when trying to send product feedback", err);
      res.status(500).json({ error: "unknown error received" });
    })
  } else {
    console.log("no product found. won't send feedback");
    res.json({ ok: true });
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});