const express = require('express');
const app = express();
const port = 3000;

const heros = [
    { id: 1, name: 'Superman' },
    { id: 2, name: 'Batman' },
    { id: 3, name: 'Spiderman' }


];

app.use('/', express.static('static'));

app.get('/api/heros', (req, res) => {
    console.log(`GET request for ${req.url}`)
    res.send(heros);
});

app.listen(port, () => {
    console.log(`Listening on port ' ${port})`);
});

