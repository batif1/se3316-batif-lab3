const express = require('express');
const app = express();
const port = 3000;
const router = express.Router();
const fs = require('fs');
const { parse } = require('path');

function getHeros() {
    return new Promise((resolve, reject) => {
        fs.readFile('superhero_info.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const heros = JSON.parse(data);
                    resolve(heros);
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}


// Usage with async/await:
async function fetchHeros() {
    try {
        const heros = await getHeros();
    } catch (err) {
        console.error('Error fetching heroes:', err);
    }
}

fetchHeros();


function getPowers() {
    return new Promise((resolve, reject) => {
        fs.readFile('superhero_powers.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const heros = JSON.parse(data);
                    resolve(heros);
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}

async function fetchPowers() {
    try {
        const heros = await getPowers();
    } catch (err) {
        console.error('Error fetching Powers:', err);
    }
}

fetchPowers();

function search(){

}


//middleware
app.use((req,res,next)=>{
    console.log(`${req.method} request for ${req.url}`);
    next();//keep going
});

//Serves static files
app.use('/', express.static('static'));

// Route to get a specific hero by id
router.get('/:hero_id', async (req,res)=>{
    try{
        const heros = await getHeros();
        const id = parseInt(req.params.hero_id);
        const hero = heros.find(h => h.id === id);
        if (hero) {
            res.send(hero);
        }else{
            res.status(404).send('Hero not found');
        }
    }catch(err){
        console.error('Error fetching heroes:', err);
        res.status(500).send('Server error');
    }

});

// Route to get all heros
router.get('/', async (req, res) => {
    try {
        const heros = await getHeros();
        res.send(heros);
    }catch (err) {
        console.error('Error fetching heroes:', err);
        res.status(500).send('Server error');
    }
});


//To get all powers (the whole list)
app.get('/api/powers', async (req, res) => {
    try {
        const powers = await getPowers();
        res.send(powers);
    }catch (err) {
        console.error('Error fetching powers:', err);
        res.status(500).send('Server error');
    }
});


//To get a specific power by hero
app.get('/api/powers/:hero_id', async (req, res) => {
    try{
        const powers = await getPowers();
        const heros = await getHeros();
        const id = parseInt(req.params.hero_id);
        const heroName = heros.find(h => h.id === id);
        const power = powers.find(p => p.hero_names === heroName.name);
        if (power) {
            res.send(power);
        }else{
            res.status(404).send('Power not found');
        }
    }catch (err) {
        console.error('Error fetching powers:', err);
        res.status(500).send('Server error');
    }
});

//Get all publisher names
app.get('/api/publishers', async (req, res) => {
    try {
        const heros = await getHeros();
        const publishers = heros.map(h => h.Publisher);
        res.send(publishers);
    } catch (error) {
        console.error('Error fetching publishers:', err);
        res.status(500).send('Server error');
    }
});

app.get('/api/search/:field/:query', async (req, res) => {
    try {
        const field = req.params.field;
        const pattern = req.params.query; // This is the search pattern
        const n = req.query.n ? parseInt(req.query.n, 10) : null;
        const heros = await getHeros(); // This function should return an array of heroes


        // Assuming the field is valid and exists on the hero objects
        const matchingSuperheroes = heros.filter(hero =>
            new RegExp(pattern, 'i').test(hero[field])
        );

        const limitedResults = (n && n > 0) ? matchingSuperheroes.slice(0, n) : matchingSuperheroes;
        res.json(limitedResults); // Send the result as a JSON response


    } catch (err) { // Corrected error variable name
        console.error('Error fetching heroes:', err);
        res.status(500).send('Server error');
    }
});

app.use('/api/heros', router)

app.listen(port, () => {
    console.log(`Listening on port ' ${port})`);
});

