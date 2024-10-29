// server.js
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Static files
app.use(express.static('public')); // 'public' klasöründe HTML, CSS, JS dosyalarınızı tutabilirsiniz

app.get('/api-key', (req, res) => {
    fs.readFile('/siteanalysis/api.txt', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading the API key');
        }
        res.send({ apiKey: data.trim() });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
