const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

router.get('/historical/:symbol', (req, res) => {
    const { symbol } = req.params;
    exec(`python ../../model/scripts/data_preparation.py ${symbol}`, (err, stdout, stderr) => {
        if (err) {
            res.status(500).send(stderr);
        } else {
            res.send(stdout);
        }
    });
});

module.exports = router;
