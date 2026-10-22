import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import path, { join } from "path";
import { fileURLToPath } from "url";
import { createServer } from 'http';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import fs from 'fs';
import multer from 'multer';

// Process Crash Protection
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = createServer(app);

// Setup Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for local dev
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// File uploads setup
const uploadsDir = join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration with Strict Validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const rawExt = file.originalname.split('.').pop() || 'jpg';
        const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');
        const validExt = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(cleanExt) ? cleanExt : 'jpg';
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${validExt}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (PNG, JPG, WEBP, GIF) are allowed!'));
        }
    }
});

// Helper middleware for Multer error handling
function uploadSinglePhoto(req, res, next) {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
                }
                return res.status(400).json({ error: `Upload error: ${err.message}` });
            }
            return res.status(400).json({ error: err.message || 'File upload failed' });
        }
        next();
    });
}

// Initialize SQLite Database
const dbDir = join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = join(dbDir, 'snackdash.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Orders Table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            userId TEXT,
            customerName TEXT,
            phone TEXT,
            items TEXT,
            total REAL,
            status TEXT DEFAULT 'Preparing',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Index on orders for faster querying
        db.run(`CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders(userId)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders(createdAt)`);

        // Migration: normalize statuses to 'Preparing' for active orders
        db.run(`UPDATE orders SET status = 'Preparing' WHERE status IN ('Pending', 'Confirmed')`, (err) => {
            if (err) console.error('Migration error (status normalization):', err.message);
        });

        // Messages Table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId TEXT,
            sender TEXT,
            text TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(orderId) REFERENCES orders(id)
        )`);

        db.run(`CREATE INDEX IF NOT EXISTS idx_messages_orderId ON messages(orderId)`);

        // Feedback Table
        db.run(`CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT,
            type TEXT,
            content TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Inventory Table (with stock quantities)
        db.run(`CREATE TABLE IF NOT EXISTS inventory (
            id TEXT PRIMARY KEY,
            status TEXT DEFAULT 'in',
            stock_count INTEGER DEFAULT 0,
            sold_count INTEGER DEFAULT 0
        )`);
    });
}

// --- REST API ENDPOINTS ---

// Get Inventory
app.get('/api/inventory', (req, res) => {
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const inventoryMap = {};
        (rows || []).forEach(r => {
            inventoryMap[r.id] = {
                status: r.status,
                stock_count: r.stock_count || 0,
                sold_count: r.sold_count || 0
            };
        });
        res.json(inventoryMap);
    });
});

// Toggle Item Stock (backward compatibility)
app.post('/api/inventory/toggle', (req, res) => {
    const { id } = req.body || {};
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Valid Item ID required' });

    db.get('SELECT status FROM inventory WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        const newStatus = row ? (row.status === 'in' ? 'out' : 'in') : 'out';

        db.run(
            'INSERT INTO inventory (id, status) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET status = ?',
            [id, newStatus, newStatus],
            function (updateErr) {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                io.emit('inventory_updated', { id, status: newStatus });
                res.json({ success: true, id, status: newStatus });
            }
        );
    });
});

// Update Item Stock & Sold Counts (Scanner / Admin use)
app.post('/api/inventory/update', (req, res) => {
    const { id, stock_count, sold_count } = req.body || {};
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Valid Item ID required' });

    const sc = Math.max(0, parseInt(stock_count) || 0);
    const sd = Math.max(0, parseInt(sold_count) || 0);
    const status = sc > 0 ? 'in' : 'out';

    db.run(
        `INSERT INTO inventory (id, status, stock_count, sold_count) VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET status = ?, stock_count = ?, sold_count = ?`,
        [id, status, sc, sd, status, sc, sd],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            io.emit('inventory_updated', { id, status, stock_count: sc, sold_count: sd });
            res.json({ success: true, id, status, stock_count: sc, sold_count: sd });
        }
    );
});

// Add new product
app.post('/api/products/add', uploadSinglePhoto, (req, res) => {
    const { name, type, price } = req.body || {};
    if (!name || !type || price === undefined || price === null || isNaN(Number(price))) {
        return res.status(400).json({ error: 'Name, type, and valid numeric price are required' });
    }

    const cleanPrice = Math.max(0, Number(price));
    const id = String(name).toLowerCase().trim().replace(/\s+/g, '-');
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    db.run(
        'INSERT OR REPLACE INTO inventory (id, status, stock_count, sold_count) VALUES (?, ?, ?, ?)',
        [id, 'in', 10, 0],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            io.emit('product_added', { id, name: String(name).trim(), type: String(type).trim(), price: cleanPrice, photoUrl });
            res.json({ success: true, product: { id, name: String(name).trim(), type: String(type).trim(), price: cleanPrice, photoUrl } });
        }
    );
});

// Get all products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// Upload photo for chat
app.post('/api/chat/upload', uploadSinglePhoto, (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image photo uploaded' });
    const photoUrl = `/uploads/${req.file.filename}`;
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    res.json({ success: true, photoUrl, fullUrl: `${protocol}://${host}${photoUrl}` });
});

// AI Chatbot Helpers & Smart Engine
function getOrders() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM orders ORDER BY createdAt DESC', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function getInventory() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM inventory', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function getSmartLocalReply(userMsg, role, orders = [], inventory = []) {
    const msg = (userMsg || '').toLowerCase().trim();

    // 1. Check for specific order ID match: ORD-XXXXXX
    const orderMatch = userMsg.match(/ORD-[A-Z0-9]{4,10}/i);
    if (orderMatch) {
        const orderId = orderMatch[0].toUpperCase();
        const found = orders.find(o => o.id === orderId);
        if (found) {
            let itemsText = found.items;
            try {
                const parsed = JSON.parse(found.items);
                itemsText = parsed.map(i => `${i.name} (x${i.quantity})`).join(', ');
            } catch (e) {}
            return `📦 Order Status for **${found.id}**:\n• Customer: ${found.customerName || 'Guest'}\n• Status: **${found.status}**\n• Items: ${itemsText}\n• Total: ₹${found.total}\n• Placed: ${new Date(found.createdAt).toLocaleString()}`;
        } else {
            return `🔍 Order **${orderId}** was not found in our system. Please double check your Order ID!`;
        }
    }

    // 2. Creator / Owner / CEO
    if (msg.includes('who made') || msg.includes('who created') || msg.includes('owner') || msg.includes('ceo') || msg.includes('founder') || msg.includes('amay')) {
        return `🚀 **SnackDash** was designed, engineered, and created by **Amay Vikram Singh** (CEO & Lead Designer)!`;
    }

    // 3. Menu & Prices
    if (msg.includes('menu') || msg.includes('price') || msg.includes('cost') || msg.includes('food') || msg.includes('dishes') || msg.includes('item')) {
        return `🍜 **SnackDash Official Menu**:\n• 🍝 **Maggi**: ₹25\n• 🍜 **Yippee**: ₹25\n• 🧀 **Cheese Macaroni**: ₹50\n• 🌶️ **Masala Penne**: ₹50\n• 🍄 **Mushroom Penne**: ₹50\n• 🍪 **Dark Fantasy**: ₹15\n• 📐 **Madangles Small**: ₹35\n• 📐 **Madangles Large**: ₹70\n\nAll snacks are served hot, fresh, and delicious!`;
    }

    if (msg.includes('maggi')) return `🍝 **Maggi Noodles**: ₹25 per pack. Hot, delicious masala flavor ready in 5–10 minutes!`;
    if (msg.includes('yippee')) return `🍜 **Yippee Noodles**: ₹25 per pack. Long, non-sticky noodles packed with spicy goodness!`;
    if (msg.includes('pasta') || msg.includes('penne') || msg.includes('macaroni')) return `🍝 **Pasta Options**:\n• Cheese Macaroni: ₹50\n• Masala Penne: ₹50\n• Mushroom Penne: ₹50`;
    if (msg.includes('dark fantasy') || msg.includes('cookie') || msg.includes('sweet')) return `🍪 **Dark Fantasy**: ₹15 per pack. Chocofills cookie for instant sweet cravings!`;
    if (msg.includes('madangles')) return `📐 **Madangles**: Small ₹35 | Large ₹70. Crunchy, tangy nacho chips!`;

    // 4. Delivery & Time
    if (msg.includes('delivery') || msg.includes('time') || msg.includes('fast') || msg.includes('how long') || msg.includes('when')) {
        return `⚡ **Lightning Delivery**: Orders are prepared and delivered within **5 to 10 minutes**!`;
    }

    // 5. Recommendations
    if (msg.includes('recommend') || msg.includes('suggest') || msg.includes('best') || msg.includes('good') || msg.includes('hungry')) {
        return `🌟 **Chef's Pick**: We recommend **Cheese Macaroni (₹50)** with **Madangles (₹35)** and **Dark Fantasy (₹15)**! Ultimate snack combo! 🎉`;
    }

    // 6. Order Status General Query
    if (msg.includes('my order') || msg.includes('where is') || msg.includes('track') || msg.includes('status')) {
        if (orders.length > 0) {
            const latest = orders[0];
            return `📦 Your latest order **${latest.id}** is currently **${latest.status}**! Total: ₹${latest.total}. Estimated delivery: 5-10 mins.`;
        }
        return `📦 Please share your Order ID (e.g., \`ORD-ABC123\`) so I can locate your live status!`;
    }

    // 7. Staff Queries (Admin / Scanner)
    if (role === 'admin' || role === 'scanner') {
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const pending = orders.filter(o => o.status === 'Preparing' || o.status === 'Pending').length;
        const completed = orders.filter(o => o.status === 'Completed').length;

        if (msg.includes('revenue') || msg.includes('stat') || msg.includes('total') || msg.includes('sales')) {
            return `📊 **Staff Dashboard Stats**:\n• Total Orders: ${totalOrders}\n• Revenue: ₹${totalRevenue}\n• Pending: ${pending}\n• Completed: ${completed}`;
        }
        if (msg.includes('stock') || msg.includes('inventory')) {
            if (inventory.length === 0) return `📦 Inventory database is currently empty.`;
            const invList = inventory.map(i => `• ${i.id}: Stock ${i.stock_count || 0} | Sold ${i.sold_count || 0} (${i.status})`).join('\n');
            return `📦 **Live Inventory**:\n${invList}`;
        }
    }

    // 8. Greetings
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('sup') || msg.includes('morning') || msg.includes('evening')) {
        return `Hello! 👋 Welcome to SnackDash! I'm SnackBot. How can I help satisfy your cravings today? Ask me about our menu, delivery times, or food recommendations!`;
    }

    // 9. General default
    return `🤖 Hi! I'm SnackBot, your AI assistant for SnackDash. You can ask me about:\n• 📜 **Menu & Prices**\n• ⚡ **Delivery Time** (5-10 mins)\n• 📦 **Order Status** (provide Order ID)\n• 🌟 **Food Recommendations**`;
}

// AI Chatbot Endpoint
app.post('/api/chat/ai', async (req, res) => {
    const { message, history, role } = req.body || {};
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Valid text message is required' });
    }

    let orders = [];
    let inventory = [];
    try {
        [orders, inventory] = await Promise.all([getOrders(), getInventory()]);
    } catch (e) {
        console.error('DB fetch error in AI route:', e);
    }

    // Detect "connect to customer" command for staff
    const connectMatch = message.match(/connect\s+(?:to\s+)?(?:customer|coustomer|coustmer)\s*(.*)/i);
    if (connectMatch && (role === 'scanner' || role === 'admin')) {
        let orderId = connectMatch[1].trim().toUpperCase();
        if (orderId && !orderId.startsWith('ORD-')) orderId = 'ORD-' + orderId;
        if (orderId) {
            return res.json({
                success: true,
                reply: `Connecting you to customer for order ${orderId}...`,
                action: 'connect_to_customer',
                orderId: orderId
            });
        } else {
            return res.json({
                success: true,
                reply: 'Please provide an order ID. Example: "connect to customer ORD-ABC123"'
            });
        }
    }

    // Check for Experiential Gateway API Key
    const explabsKey = (process.env.EXPLABS_API_KEY || '').trim();
    if (explabsKey) {
        let systemPrompt = `You are SnackBot, a friendly and helpful AI assistant for SnackDash – a premium snack ordering service designed and created by Amay Vikram Singh (CEO & Designer).

Menu: Maggi ₹25, Yippee ₹25, Cheese Macaroni ₹50, Masala Penne ₹50, Mushroom Penne ₹50, Dark Fantasy ₹15, Madangles S ₹35, Madangles L ₹70.
Delivery time: 5-10 minutes.`;

        if (role === 'admin' || role === 'scanner') {
            const orderSummary = orders.length > 0
                ? orders.slice(0, 15).map(o => `${o.id}: ${o.customerName || 'Guest'}, ${o.status}, ₹${o.total}`).join('\n')
                : 'No orders yet.';
            const invSummary = inventory.length > 0
                ? inventory.map(i => `${i.id}: stock=${i.stock_count || 0}`).join(', ')
                : 'No inventory data.';

            systemPrompt += `\n\nAssisting Staff (${role}). Live Orders:\n${orderSummary}\nInventory:\n${invSummary}`;
        } else {
            systemPrompt += `\n\nKeep responses helpful, short, and polite. Credit Amay Vikram Singh as CEO & Designer if asked.`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(Array.isArray(history) ? history : []).slice(-4).map(m => ({
                role: m.sender === 'customer' ? 'user' : 'assistant',
                content: String(m.text || '')
            })),
            { role: 'user', content: message }
        ];

        try {
            const apiRes = await fetch('https://api.experientiallabs.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${explabsKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gemini-3.7-flash',
                    messages,
                    temperature: 0.7
                })
            });

            if (apiRes.ok) {
                const data = await apiRes.json();
                const reply = data.choices?.[0]?.message?.content;
                if (reply) {
                    return res.json({ success: true, reply, usage: data.usage });
                }
            }
        } catch (e) {
            console.warn(`Experiential Gateway gemini-3.7-flash call failed:`, e);
        }
    }

    // Clean OpenRouter API key (remove trailing semicolons or spaces)
    const rawKey = process.env.OPENROUTER_API_KEY || '';
    const apiKey = rawKey.replace(/;$/, '').trim();

    if (apiKey && apiKey.startsWith('sk-or-')) {
        const candidateModels = [
            'google/gemma-4-31b-it:free',
            'nvidia/nemotron-3.5-lightning:free',
            'inclusionai/ling-3.0-flash-sante:free',
            'google/gemini-2.5-flash'
        ];

        let systemPrompt = `You are SnackBot, a friendly and helpful AI assistant for SnackDash – a premium snack ordering service designed and created by Amay Vikram Singh (CEO & Designer).

Menu: Maggi ₹25, Yippee ₹25, Cheese Macaroni ₹50, Masala Penne ₹50, Mushroom Penne ₹50, Dark Fantasy ₹15, Madangles S ₹35, Madangles L ₹70.
Delivery time: 5-10 minutes.`;

        if (role === 'admin' || role === 'scanner') {
            const orderSummary = orders.length > 0
                ? orders.slice(0, 15).map(o => `${o.id}: ${o.customerName || 'Guest'}, ${o.status}, ₹${o.total}`).join('\n')
                : 'No orders yet.';
            const invSummary = inventory.length > 0
                ? inventory.map(i => `${i.id}: stock=${i.stock_count || 0}`).join(', ')
                : 'No inventory data.';

            systemPrompt += `\n\nAssisting Staff (${role}). Live Orders:\n${orderSummary}\nInventory:\n${invSummary}`;
        } else {
            systemPrompt += `\n\nKeep responses helpful, short, and polite. Credit Amay Vikram Singh as CEO & Designer if asked.`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(Array.isArray(history) ? history : []).slice(-4).map(m => ({
                role: m.sender === 'customer' ? 'user' : 'assistant',
                content: String(m.text || '')
            })),
            { role: 'user', content: message }
        ];

        for (const model of candidateModels) {
            try {
                const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://snackdash.onrender.com',
                        'X-Title': 'SnackDash'
                    },
                    body: JSON.stringify({ model, messages, temperature: 0.7 })
                });

                if (apiRes.ok) {
                    const data = await apiRes.json();
                    const reply = data.choices?.[0]?.message?.content;
                    if (reply) {
                        return res.json({ success: true, reply });
                    }
                }
            } catch (e) {
                console.warn(`OpenRouter model ${model} failed, trying next...`);
            }
        }
    }

    // Fallback to Smart Local Engine
    const reply = getSmartLocalReply(message, role, orders, inventory);
    res.json({ success: true, reply });
});

// Get all orders
app.get('/api/orders', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const orders = (rows || []).map(r => {
            let parsedItems = [];
            try {
                parsedItems = JSON.parse(r.items || '[]');
            } catch (e) {
                console.error(`Error parsing items for order ${r.id}:`, e);
            }
            return { ...r, items: parsedItems };
        });
        res.json(orders);
    });
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};

    const validStatuses = ['Preparing', 'Completed', 'Cancelled', 'Pending'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });

        io.emit('order_status_update', { id, status });
        res.json({ success: true, id, status });
    });
});

// Broadcast Maintenance State
app.post('/api/maintenance', (req, res) => {
    const { type, isLocked } = req.body || {};
    if (!type || typeof isLocked !== 'boolean') {
        return res.status(400).json({ error: 'type (string) and isLocked (boolean) are required' });
    }
    io.emit('maintenance_update', { type, isLocked });
    res.json({ success: true, type, isLocked });
});

// Get messages for an order
app.get('/api/orders/:id/messages', (req, res) => {
    const { id } = req.params;
    db.all('SELECT * FROM messages WHERE orderId = ? ORDER BY createdAt ASC', [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// Get single order details
app.get('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Order not found' });

        let parsedItems = [];
        try { parsedItems = JSON.parse(row.items || '[]'); } catch (e) { }
        const order = { ...row, items: parsedItems };
        res.json(order);
    });
});

// Get all orders for a specific user
app.get('/api/users/:userId/orders', (req, res) => {
    const { userId } = req.params;
    db.all('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const orders = (rows || []).map(r => {
            let parsedItems = [];
            try { parsedItems = JSON.parse(r.items || '[]'); } catch (e) { }
            return { ...r, items: parsedItems };
        });
        res.json(orders);
    });
});

// Submit new feedback
app.post('/api/feedback', (req, res) => {
    const { sender, type, content } = req.body || {};
    if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ error: 'Feedback content is required' });
    }

    db.run(
        `INSERT INTO feedback (sender, type, content) VALUES (?, ?, ?)`,
        [String(sender || 'Anonymous').trim(), String(type || 'General').trim(), String(content).trim()],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const newFeedback = {
                id: this.lastID,
                sender: String(sender || 'Anonymous').trim(),
                type: String(type || 'General').trim(),
                content: String(content).trim(),
                createdAt: new Date().toISOString()
            };

            io.emit('new_feedback', newFeedback);
            res.json({ success: true, feedback: newFeedback });
        }
    );
});

// Get all feedback
app.get('/api/feedback', (req, res) => {
    db.all('SELECT * FROM feedback ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// --- SOCKET.IO REAL-TIME LOGIC ---

io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id);

    socket.on('join_order_room', (orderId) => {
        if (orderId && typeof orderId === 'string') {
            socket.join(orderId);
            console.log(`[Socket] ${socket.id} joined room: ${orderId}`);
        }
    });

    socket.on('place_order', (orderData, callback) => {
        if (!orderData || typeof orderData !== 'object') {
            if (callback) callback({ success: false, error: 'Invalid order data payload' });
            return;
        }

        const { id, userId, customerName, phone, items, total } = orderData;

        if (!id || !customerName || !phone || !Array.isArray(items) || items.length === 0) {
            if (callback) callback({ success: false, error: 'Missing required order details' });
            return;
        }

        const VALID_MENU_IDS = ['maggi', 'yippee', 'pasta-cheese', 'pasta-masala', 'pasta-mushroom', 'dark-fantasy', 'madangles-s', 'madangles-l'];
        const invalidItems = items.filter(item => !item || !VALID_MENU_IDS.includes(item.id));
        if (invalidItems.length > 0) {
            const names = invalidItems.map(i => i.name || i.id || 'unknown').join(', ');
            if (callback) callback({ success: false, error: `Item not available in menu: ${names}` });
            return;
        }

        const itemsJson = JSON.stringify(items);

        db.run(
            `INSERT INTO orders (id, userId, customerName, phone, items, total, status) 
             VALUES (?, ?, ?, ?, ?, ?, 'Preparing')`,
            [id, userId || 'GUEST', customerName, phone, itemsJson, Number(total) || 0],
            function (err) {
                if (err) {
                    console.error('Error saving order:', err);
                    if (callback) callback({ success: false, error: err.message });
                    return;
                }

                const createdOrder = { ...orderData, status: 'Preparing', createdAt: new Date().toISOString() };
                io.emit('new_order', createdOrder);
                if (callback) callback({ success: true, id });
            }
        );
    });

    socket.on('send_message', (msgData, callback) => {
        if (!msgData || typeof msgData !== 'object') {
            if (callback) callback({ success: false, error: 'Invalid message payload' });
            return;
        }

        const { orderId, sender, text } = msgData;

        if (!orderId || !sender || !text || typeof text !== 'string' || !text.trim()) {
            if (callback) callback({ success: false, error: 'orderId, sender, and non-empty text required' });
            return;
        }

        const cleanText = text.trim().slice(0, 2000); // limit to 2000 chars

        db.run(
            `INSERT INTO messages (orderId, sender, text) VALUES (?, ?, ?)`,
            [orderId, sender, cleanText],
            function (err) {
                if (err) {
                    console.error('Error saving message:', err);
                    if (callback) callback({ success: false, error: err.message });
                    return;
                }

                const storedMsg = {
                    id: this.lastID,
                    orderId,
                    sender,
                    text: cleanText,
                    createdAt: new Date().toISOString()
                };

                io.to(orderId).emit('new_message', storedMsg);
                io.emit('global_new_message', storedMsg);

                if (callback) callback({ success: true, message: storedMsg });
            }
        );
    });

    socket.on('join_staff_chat', (role) => {
        const cleanRole = typeof role === 'string' ? role : 'Staff';
        socket.join('STAFF-DIRECT');
        console.log(`[Socket] ${cleanRole} (${socket.id}) joined staff chat`);
        io.to('STAFF-DIRECT').emit('staff_system', { text: `${cleanRole} joined the staff chat`, role: cleanRole });
    });

    socket.on('staff_message', (data) => {
        if (!data || typeof data !== 'object') return;
        const msg = {
            sender: data.sender || 'staff',
            text: String(data.text || '').slice(0, 2000),
            createdAt: new Date().toISOString()
        };
        io.to('STAFF-DIRECT').emit('staff_new_message', msg);
    });

    socket.on('disconnect', () => {
        console.log('[Socket] Client disconnected:', socket.id);
    });
});

// API 404 Fallback (ensures invalid API requests return JSON 404 instead of HTML)
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Serve Vite build folder
app.use(express.static(path.join(__dirname, "dist")));

// Send index.html for all unknown client-side routes (Express 5 compatible regex)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Express Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Express Error]', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Server running on port " + PORT + " with Socket.io enabled.");
});
