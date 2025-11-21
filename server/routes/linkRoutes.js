const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const { nanoid } = require('nanoid');

const generateCode = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

router.post('/', async (req, res) => {
    const { originalUrl, customCode } = req.body;

    if (!originalUrl) {
        return res.status(400).json({ message: 'Original URL is required' });
    }

    try {
        new URL(originalUrl);
    } catch (err) {
        return res.status(400).json({ message: 'Invalid URL format' });
    }

    try {
        let code = customCode;

        if (code) {
            const existingLink = await Link.findOne({ code });
            if (existingLink) {
                return res.status(409).json({ message: 'Code already in use' });
            }
        } else {
            let isUnique = false;
            while (!isUnique) {
                code = generateCode(6);
                const existing = await Link.findOne({ code });
                if (!existing) isUnique = true;
            }
        }

        const link = await Link.create({
            originalUrl,
            code,
        });

        res.status(201).json(link);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const links = await Link.find().sort({ createdAt: -1 });
        res.json(links);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:code', async (req, res) => {
    try {
        const link = await Link.findOne({ code: req.params.code });
        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }
        res.json(link);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:code', async (req, res) => {
    try {
        const link = await Link.findOneAndDelete({ code: req.params.code });
        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }
        res.json({ message: 'Link removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
