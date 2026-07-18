import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Import PRODUCTS directly
import { PRODUCTS } from "./src/data.ts";

// Dual ESM/CJS safe resolution of filename and directory
const currentFilename = typeof __filename !== "undefined" 
  ? __filename 
  : fileURLToPath(import.meta.url);
const currentDirname = typeof __dirname !== "undefined" 
  ? __dirname 
  : path.dirname(currentFilename);

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "products-db.json");
const ORDERS_FILE = path.join(process.cwd(), "orders-db.json");

app.use(express.json());

// Real-time SSE connection tracking
let sseClients: any[] = [];

function broadcastUpdate() {
  console.log(`Broadcasting real-time update to ${sseClients.length} connected clients...`);
  sseClients.forEach((client) => {
    try {
      client.write("data: REFRESH\n\n");
    } catch (err) {
      console.error("Error writing to SSE client:", err);
    }
  });
}

// Initialize database file with defaults if not exists
function getProductsFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading products database:", err);
  }
  // Write default products to disk
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(PRODUCTS, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing default products database:", err);
  }
  return PRODUCTS;
}

function saveProductsToDisk(products: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving products to database:", err);
  }
}

// Get and save orders from disk
function getOrdersFromDisk() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading orders database:", err);
  }
  return [];
}

function saveOrdersToDisk(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving orders to database:", err);
  }
}

// Real-Time SSE Endpoint
app.get("/api/updates", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  // Keep connection alive with initial status
  res.write("data: CONNECTED\n\n");

  sseClients.push(res);

  const heartbeat = setInterval(() => {
    try {
      res.write("data: PING\n\n");
    } catch (err) {
      // client disconnected
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter((client) => client !== res);
  });
});

// API Routes - Products
app.get("/api/products", (req, res) => {
  const products = getProductsFromDisk();
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const products = getProductsFromDisk();
  const newProduct = req.body;
  if (!newProduct.id) {
    newProduct.id = `custom-${Date.now()}`;
  }
  products.unshift(newProduct);
  saveProductsToDisk(products);
  broadcastUpdate();
  res.json(products);
});

app.put("/api/products/:id", (req, res) => {
  const products = getProductsFromDisk();
  const productId = req.params.id;
  const updatedProduct = req.body;
  
  const index = products.findIndex((p: any) => p.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct };
    saveProductsToDisk(products);
    broadcastUpdate();
    res.json(products);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const products = getProductsFromDisk();
  const productId = req.params.id;
  const filtered = products.filter((p: any) => p.id !== productId);
  saveProductsToDisk(filtered);
  broadcastUpdate();
  res.json(filtered);
});

app.post("/api/products/reset", (req, res) => {
  saveProductsToDisk(PRODUCTS);
  broadcastUpdate();
  res.json(PRODUCTS);
});

// API Routes - Orders
app.get("/api/orders", (req, res) => {
  const orders = getOrdersFromDisk();
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const orders = getOrdersFromDisk();
  const newOrder = req.body;
  if (!newOrder.id) {
    newOrder.id = `order-${Date.now()}`;
  }
  orders.unshift(newOrder);
  saveOrdersToDisk(orders);
  broadcastUpdate();
  res.json(orders);
});

app.put("/api/orders/:id", (req, res) => {
  const orders = getOrdersFromDisk();
  const orderId = req.params.id;
  const updatedOrder = req.body;
  
  const index = orders.findIndex((o: any) => o.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updatedOrder };
    saveOrdersToDisk(orders);
    broadcastUpdate();
    res.json(orders[index]);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

app.delete("/api/orders/:id", (req, res) => {
  const orders = getOrdersFromDisk();
  const orderId = req.params.id;
  const filtered = orders.filter((o: any) => o.id !== orderId);
  saveOrdersToDisk(filtered);
  broadcastUpdate();
  res.json(filtered);
});

// Vite or Static Assets handling
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initServer();
