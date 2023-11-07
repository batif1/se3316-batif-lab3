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

document.getElementById('search-button').addEventListener('click', async function() {
    const button = this;
    button.disabled = true;
    // Clear the previous results
                document.getElementById('superheroCards').innerHTML = ''; // Clear the previous results

                const searchCategory = document.getElementById('search-category').value;
                const searchValue = document.getElementById('search-input').value.trim().toLowerCase();
                const searchNumber = document.getElementById('search-number').value.trim().toLowerCase();

                if (searchValue === '') {
                    return; // Early return if searchValue is invalid
                }

                //If the search is by ID
                if (searchCategory === 'id'){

                    if (searchCategory === 'id' && !isNaN(searchValue)) {
                        try {
                            const filteredHeros = await search(searchCategory, searchValue, Number(searchNumber));
                            results(filteredHeros);
                        } catch (error) {
                            console.error('Search failed:', error);
                        } finally {
                            button.disabled = false; // Re-enable the button after the search is complete
                        }
                    } else {
                        button.disabled = false; // Re-enable the button if the searchCategory is not 'id'
                    }
                }

                if (searchCategory === 'name'){
                    const filteredHeros = globalHeroData.filter(hero => {
                        const heroNameLower = hero.name.toLowerCase();
                        return heroNameLower.includes(searchValue);
                    });

                }

                if (searchCategory === 'race'){
                    const filteredHeros = globalHeroData.filter(hero => {
                        const heroRaceLower = hero.Race.toLowerCase();
                        return heroRaceLower.includes(searchValue);
                    });

                    results(filteredHeros);
                }


                if(searchCategory === 'publisher'){
                    const filteredHeros = globalHeroData.filter(hero => {
                        const heroPublisherLower = hero.Publisher.toLowerCase();
                        return heroPublisherLower.includes(searchValue);
                    })
                    results(filteredHeros)
                }

                if(searchCategory === 'power'){

                    const filteredHerosByPower = globalPowersData.filter(hero => {
                        return hero[searchValue] === "True";
                    } )

                    const filteredHeros = globalHeroData.filter(hero => {
                        const heroNameLower = hero.name.toLowerCase();
                        return heroNameLower.includes(filteredHerosByPower.hero_names);
                    })

                    results(filteredHeros);
                }

                if (searchCategory === 'heros'){

                    // Convert searchValue to a number for accurate comparison
                    const searchNumber = Number(searchValue);

                    // Filter the globalHeroData array
                    const filteredHeros = globalHeroData.filter(hero => {
                        return hero.id === searchNumber;
                    });

                    // Call the results function to display the filtered heroes
                    results(filteredHeros);
                }

                if (searchCategory === 'powers'){
                    const searchValue = document.getElementById('power-search').value.trim();

                    document.getElementById('superheroCards').innerHTML = '';

                    if (searchValue === '' || isNaN(searchValue)) {
                        return; // Early return if searchValue is invalid
                    }

                    const searchNumber = Number(searchValue); // Make sure this is the correct ID format
                    let heroName = "";

                    const targetHero = globalHeroData.find(hero => hero.id === searchNumber); // Use find to get a single hero
                    if (targetHero) {
                        heroName = targetHero.name;
                    }
                    console.log(heroName);

                    const filteredPowers = globalPowersData.filter(power => power.hero_names === heroName);

                    if (filteredPowers.length > 0) {
                        const powersList = document.createElement('ul');
                        for (const [key, value] of Object.entries(filteredPowers[0])) {
                            if (value === "True") {
                                const powerItem = document.createElement('li');
                                powerItem.textContent = key;
                                powersList.appendChild(powerItem);
                            }
                        }
                        document.getElementById('superheroCards').appendChild(powersList);
                    }
                }





    });





