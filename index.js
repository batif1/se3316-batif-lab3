const express = require('express');
const app = express();
const port = 3000;
const router = express.Router();
const fs = require('fs');
const { parse } = require('path');

//MongoDB


const uri = "mongodb+srv://basharatif2003:mkQqf26u9xvDfqn@cluster0.pykducv.mongodb.net/?retryWrites=true&w=majority";

const mongoose = require('mongoose');
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
    console.error(error);
});

db.once('open', () => {
    console.log("Connected to MongoDB database!");
});


const superheroSchema = new mongoose.Schema({
    numbers: [Number]
   })

const SuperHeroListDB = mongoose.model('superHeroListDB', superheroSchema);


module.exports = SuperHeroListDB;

app.use(express.json());

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


//Test Put
router.put('/:id', async (req, res) => {
    const newpart = req.body;
    console.log("Part:", newpart);
    res.send('recieved');

});

superheroLists = {};

app.post('/api/lists', (req, res) => {
    const { listName } = req.body; //listName is an attribute of the JSON

    //Error Handling if the list already exists
    if (superheroLists[listName]) {
      return res.status(400).send('List name already exists.');
    }

    //Creating a new list at the key of the listName
    superheroLists[listName] = [];
    res.status(201).send('New superhero list created.');

    console.log(superheroLists)
  });




//Updating superhero list (A LIST HAS TO BE CREATED FIRST)
app.put('/api/lists/:listName', (req, res) => {
    const { listName } = req.params;
    const { superheroIds } = req.body;//"superheroIds" needs to be in the body

    //If the list does not exist
    if (!superheroLists[listName]) {
      return res.status(404).send('List name does not exist.');
    }

    superheroLists[listName] = superheroIds; // Replace existing list with new values
    res.send('Superhero list updated.');

    console.log(superheroLists)

  });

//GET Request for the list

app.get('/api/lists/:listName', (req, res) => {
    const { listName } = req.params;

    if (!superheroLists[listName]) {
      return res.status(404).send('List not found.');
    }

    res.json(superheroLists[listName]);
  });


//DELETE Request for the list
app.delete('/api/lists/:listName', (req, res) => {
    const { listName } = req.params;

    if (!superheroLists[listName]) {
      return res.status(404).send('List not found.');
    }

    delete superheroLists[listName];
    res.send('List deleted.');
  });

  app.get('/api/lists/information/:listName', async (req, res) => {
    const { listName } = req.params;

    // If the list does not exist
    if (!superheroLists[listName]) {
      return res.status(404).send('List not found.');
    }

    try {
      const heros = await getHeros();
      const powers = await getPowers();
      const results = [];

      for (const each of superheroLists[listName]) {
        const id = parseInt(each, 10);
        console.log("Here is the ID:")
        console.log(id);
        const hero = heros.find(h => h.id === id);
        if (hero) {
          const power = powers.find(p => p.hero_names.includes(hero.name));
          if (power) {
            results.push({
              hero: hero,
              power: power
            });
          }
        }
      }


      if (results.length > 0) {
        res.json(results); // Send the combined objects as JSON
      } else {
        res.status(404).send('Hero or Power not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
