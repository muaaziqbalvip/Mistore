// api/download.js - Vercel Serverless Function for Fast Downloading
const https = require('https');
const http = require('http');

module.exports = async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "Download URL is missing." });
    }

    // Determine the correct protocol
    const client = url.startsWith('https') ? https : http;

    try {
        client.get(url, (fileResponse) => {
            // Forward headers like Content-Type and Content-Length for fast, native downloading
            res.setHeader('Content-Type', fileResponse.headers['content-type'] || 'application/vnd.android.package-archive');
            if (fileResponse.headers['content-length']) {
                res.setHeader('Content-Length', fileResponse.headers['content-length']);
            }
            res.setHeader('Content-Disposition', `attachment; filename="miappstore_${Date.now()}.apk"`);

            // Stream the file directly to the user
            fileResponse.pipe(res);
        }).on('error', (err) => {
            res.status(500).json({ error: "Failed to download the file", details: err.message });
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
