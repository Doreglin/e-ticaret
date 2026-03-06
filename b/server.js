const express = require('express');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); 

// 🚀 MSSQL BAĞLANTI AYARLARI
const dbConfig = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-ORHPQRKD\\SQLEXPRESS;Database=satrat_db;Trusted_Connection=yes;"
};

sql.connect(dbConfig).then(() => {
    console.log('MSSQL Veritabanı Aktif! 🟢 (Tüm Sistemler Çevrimiçi)');
}).catch(err => {
    console.error('Veritabanına Girilemedi! Hata Detayı:', err.message);
});

// ==========================================
// 1. ÜRÜN API'LERİ
// ==========================================
app.get('/api/products', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM products');
        res.json(result.recordset);
    } catch (err) { res.status(500).send('Sistem Hatası'); }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, category, price, icon, desc, best_seller } = req.body;
        const bsBit = best_seller ? 1 : 0; 
        await sql.query`INSERT INTO products (name, category, price, rating, icon, description, best_seller, stock) VALUES (${name}, ${category}, ${price}, 5.0, ${icon}, ${desc}, ${bsBit}, 10)`;
        res.status(201).json({ message: "Ganimet Başarıyla Eklendi!" });
    } catch (err) { res.status(500).send('Sistem Hatası'); }
});

app.put('/api/products/stock', async (req, res) => {
    try {
        const { id, stock } = req.body;
        await sql.query`UPDATE products SET stock = ${stock} WHERE id = ${id}`;
        res.status(200).json({ message: "Stok Başarıyla Güncellendi!" });
    } catch (err) { res.status(500).send('Sistem Hatası'); }
});

// ==========================================
// 2. DETAYLI KİMLİK DOĞRULAMA (Auth)
// ==========================================
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, firstName, lastName, gender, phone } = req.body;
        const checkUser = await sql.query`SELECT * FROM users WHERE username = ${username}`;
        if (checkUser.recordset.length > 0) return res.status(400).json({ error: "Bu siber-kimlik zaten alınmış!" });
        
        await sql.query`INSERT INTO users (username, password, first_name, last_name, gender, phone) VALUES (${username}, ${password}, ${firstName}, ${lastName}, ${gender}, ${phone})`;
        res.status(201).json({ message: "Ağa başarıyla katıldın!" });
    } catch (err) { res.status(500).json({ error: "Sistem Çöktü!" }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await sql.query`SELECT * FROM users WHERE username = ${username} AND password = ${password}`;
        if (result.recordset.length > 0) res.status(200).json({ message: "Erişim Onaylandı!", user: result.recordset[0] });
        else res.status(401).json({ error: "Erişim Reddedildi: Hatalı kimlik veya şifre!" });
    } catch (err) { res.status(500).json({ error: "Sistem Çöktü!" }); }
});

// ==========================================
// 3. PROFİL VE SİPARİŞ GEÇMİŞİ ÇEKME
// ==========================================
app.get('/api/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const userQuery = await sql.query`SELECT username, first_name, last_name, gender, phone, created_at FROM users WHERE username = ${username}`;
        if (userQuery.recordset.length === 0) return res.status(404).json({ error: "Kullanıcı bulunamadı!" });
        const ordersQuery = await sql.query`SELECT * FROM orders WHERE username = ${username} ORDER BY order_date DESC`;
        res.json({ user: userQuery.recordset[0], orders: ordersQuery.recordset });
    } catch (err) { res.status(500).json({ error: "Sistem Çöktü!" }); }
});

// ==========================================
// 4. KİŞİYE ÖZEL İSTEK LİSTESİ (FAVORİLER)
// ==========================================
app.get('/api/favorites/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const result = await sql.query`SELECT product_id FROM favorites WHERE username = ${username}`;
        res.json(result.recordset.map(row => row.product_id));
    } catch (err) { res.status(500).json({ error: "Sistem Hatası" }); }
});

app.post('/api/favorites/toggle', async (req, res) => {
    try {
        const { username, product_id } = req.body;
        const check = await sql.query`SELECT * FROM favorites WHERE username = ${username} AND product_id = ${product_id}`;
        if (check.recordset.length > 0) {
            await sql.query`DELETE FROM favorites WHERE username = ${username} AND product_id = ${product_id}`;
            res.json({ status: "removed" });
        } else {
            await sql.query`INSERT INTO favorites (username, product_id) VALUES (${username}, ${product_id})`;
            res.json({ status: "added" });
        }
    } catch (err) { res.status(500).json({ error: "Sistem Çöktü!" }); }
});

// ==========================================
// 5. YORUMLAR VE PUANLAMA
// ==========================================
app.get('/api/comments/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await sql.query`SELECT * FROM comments WHERE product_id = ${productId} ORDER BY created_at DESC`;
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: "Sistem Hatası" }); }
});

app.post('/api/comments', async (req, res) => {
    try {
        const { product_id, username, text, rating } = req.body;
        await sql.query`INSERT INTO comments (product_id, username, comment_text, rating) VALUES (${product_id}, ${username}, ${text}, ${rating})`;
        await sql.query`UPDATE products SET rating = (SELECT CAST(AVG(CAST(rating AS DECIMAL(3,1))) AS DECIMAL(3,1)) FROM comments WHERE product_id = ${product_id}) WHERE id = ${product_id}`;
        res.status(201).json({ message: "Yorum başarıyla Matrix'e kazındı!" });
    } catch (err) { res.status(500).json({ error: "Sistem Çöktü!" }); }
});

// ==========================================
// 6. STOK KONTROLLÜ SİPARİŞ (CHECKOUT)
// ==========================================
app.post('/api/checkout', async (req, res) => {
    try {
        const { username, cartItems, total } = req.body; 
        for (let item of cartItems) {
            const check = await sql.query`SELECT stock, name FROM products WHERE id = ${item.product.id}`;
            const currentStock = check.recordset[0].stock;
            if (currentStock < item.quantity) return res.status(400).json({ error: `Sistem Reddi: ${check.recordset[0].name} için yeterli stok yok! (Kalan: ${currentStock})` });
        }
        for (let item of cartItems) { await sql.query`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.product.id}`; }
        
        const orderCode = 'SİP-' + Math.floor(100000 + Math.random() * 900000);
        const itemsJson = JSON.stringify(cartItems); 
        await sql.query`INSERT INTO orders (order_code, username, total_price, items_json) VALUES (${orderCode}, ${username}, ${total}, ${itemsJson})`;
        res.status(200).json({ message: "Sipariş Onaylandı! Ganimetler envanterine eklendi." });
    } catch (err) { res.status(500).json({ error: "Matrix'te bir hata oluştu!" }); }
});

app.listen(3000, () => { console.log('Siber-Mech Sunucu 3000 portunda dinleniyor... 🚀'); });