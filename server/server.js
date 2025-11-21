const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const linkRoutes = require('./routes/linkRoutes');
const Link = require('./models/Link');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/links', linkRoutes);

app.get('/healthz', (req, res) => {
    res.status(200).json({ ok: true });
});

app.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const link = await Link.findOne({ code });

        if (link) {
            link.clicks++;
            link.lastClickedAt = new Date();
            await link.save();

            return res.redirect(link.originalUrl);
        } else {
            return res.status(404).send('Link not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
