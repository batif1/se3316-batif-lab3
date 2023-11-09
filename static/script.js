let globalHeroData = [];
let globalPowersData = [];
let globalSearchResults = [];

//Displaying heros
function results(list){
    list.forEach(hero => {
        // Create the list item
        const card = document.createElement('li');
        card.className = 'card';

        // Create and append the h2 element for name
        const name = document.createElement('h2');
        name.textContent = hero.name;
        card.appendChild(name);

        // Iterate over the hero properties
        const properties = ['id','Gender', 'Eye color', 'Race', 'Hair color', 'Height', 'Publisher', 'Skin color', 'Alignment', 'Weight'];
        properties.forEach(prop => {
          const p = document.createElement('p');
          // Some properties need to access hero object with bracket notation because of the space in key names
          p.textContent = `${prop}: ${prop.includes(" ") ? hero[prop] : hero[prop.replace(" ", "")]}`;
          card.appendChild(p);
        });

        // Correct the unit for height and weight
        card.querySelector('p:nth-of-type(6)').textContent += ' cm';
        card.querySelector('p:last-of-type').textContent += ' lbs';

        // Append the card to the container
        document.getElementById('superheroCards').appendChild(card);
      });
}


//Populating a global heros list (AJAX)
function getHeroList() {
    return fetch('/api/heros/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            globalHeroData = data; // Store the data globally
            return data; // Return the data for further processing
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}


//Populating a power heros list (AJAX)
function getPowerList() {
    return fetch('/api/powers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            globalPowersData = data; // Store the data globally
            return data; // Return the data for further processing
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

getPowerList();
getHeroList();

//http://localhost:3000/api/search/name/a?n=2


function search(field, query, n) {
    return fetch(`/api/search/${field}/${query}?n=${n}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data =>{
            globalSearchResults = data;
            return data;
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        })
}

function createList(listName) {
    return fetch('http://localhost:3000/api/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ listName: listName }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error during list creation:', error);
    });
  }


  function editList(listName, content){
    return fetch('http://localhost:3000/api/lists/{listName})', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    body: JSON.stringify({ listName: listName, content: content}),
  })
  .then(response => {
    if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .catch(error =>{
    console.error('Error during list creation:', error);
  });
}



document.getElementById('search-button').addEventListener('click', async function () {
    const button = this;
    button.disabled = true;
    // Clear the previous results
    document.getElementById('superheroCards').innerHTML = ''; // Clear the previous results

    const searchCategory = document.getElementById('search-category').value;
    const searchValue = document.getElementById('search-input').value.trim().toLowerCase();
    const searchNumber = Number(document.getElementById('search-number').value.trim().toLowerCase());

    if (searchValue === '') {
        return; // Early return if searchValue is invalid
    }

    try {
        let filteredHeros = [];
        if (searchCategory === 'id' && !isNaN(searchValue)) {
            filteredHeros = await search(searchCategory, searchValue, searchNumber);
        }
        if (searchCategory === 'race') {
            filteredHeros = await search('Race', searchValue, searchNumber);
        }
        if (searchCategory === 'name') {
            filteredHeros = await search(searchCategory, searchValue, searchNumber);
        }
        if (searchCategory === 'publisher') {
            filteredHeros = await search('Publisher', searchValue, searchNumber);
        }
        if (searchCategory === 'power'){
            const filteredHerosByPower = globalPowersData.filter(hero => hero[searchValue] === "True");
            const heroNames = filteredHerosByPower.map(hero => hero.hero_names);
            const lowercaseHeroNames = heroNames.map(name => name.toLowerCase());
            filteredHeros = globalHeroData.filter(hero => hero.name.includes(lowercaseHeroNames));
        }
        results(filteredHeros);
    } catch (error) {
        console.error('Search failed:', error);
    } finally {
        button.disabled = false; // Re-enable the button after the search is complete
    }

});


document.getElementById('list-button').addEventListener('click', async function () {
    const button = this;
    button.disabled = true;

    const textValue = document.getElementById('list-input').value.trim().toLowerCase();

    document.innerHTML = '';// Clear the previous results

    if (searchValue === '') {
        return; // Early return if searchValue is invalid
    }

    try {
        let listInformation = [];
        if (listInformation === 'create' && !isNaN(searchValue)) {
            filteredHeros = await createList(textValue);
        }

        if (searchCategory === 'edit'){
            const filteredHerosByPower = globalPowersData.filter(hero => hero[searchValue] === "True");
            const heroNames = filteredHerosByPower.map(hero => hero.hero_names);
            const lowercaseHeroNames = heroNames.map(name => name.toLowerCase());
            filteredHeros = globalHeroData.filter(hero => hero.name.includes(lowercaseHeroNames));
        }
        results(filteredHeros);
    } catch (error) {
        console.error('Search failed:', error);
    } finally {
        button.disabled = false; // Re-enable the button after the search is complete
    }

});