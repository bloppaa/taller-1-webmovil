const LIMIT = 12;
const TOTAL_POKEMON = 1302;
const TOTAL_POKEMON_REAL = 1025;
let currentPage = 0;
let filteredPokemon = [];
let previousSearch = "";
let isRandomMode = false;
let isReversedOrder = false;

const typeES = {
  normal: "Normal",
  fighting: "Lucha",
  flying: "Volador",
  poison: "Veneno",
  ground: "Tierra",
  rock: "Roca",
  bug: "Bicho",
  ghost: "Fantasma",
  steel: "Acero",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  psychic: "Psíquico",
  ice: "Hielo",
  dragon: "Dragón",
  dark: "Siniestro",
  fairy: "Hada",
};

const typeColors = {
  grass: "lime-500",
  bug: "lime-600",
  dark: "neutral-500",
  dragon: "red-400",
  electric: "yellow-300",
  fairy: "pink-300",
  fighting: "orange-600",
  fire: "orange-500",
  flying: "cyan-400",
  ghost: "slate-500",
  ground: "yellow-600",
  ice: "cyan-500",
  normal: "neutral-400",
  poison: "purple-400",
  psychic: "pink-400",
  rock: "yellow-600",
  steel: "neutral-400",
  water: "sky-600",
};

const whiteTextTypes = [
  "poison",
  "fire",
  "water",
  "bug",
  "dragon",
  "ghost",
  "psychic",
  "dark",
  "fighting",
  "poison",
  "rock",
];

async function fetchSearchPokemon(query) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}&offset=0`
    );
    const data = await response.json();
    const urls = data.results
      .filter((pokemon) => pokemon.name.includes(query))
      .map((pokemon) => pokemon.url);
    const pokemonDetails = await Promise.all(
      urls.map((url) => getPokemonDetails(url))
    );
    return pokemonDetails;
  } catch (error) {
    console.error("Error fetching search Pokémon:", error);
  }
}

async function fetchReversePokemon() {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON_REAL}`
    );
    const data = await response.json();
    const reversedResults = data.results
      .slice(
        TOTAL_POKEMON_REAL - LIMIT * (currentPage + 1),
        TOTAL_POKEMON_REAL - LIMIT * currentPage
      )
      .reverse();
    const pokemonDetails = await Promise.all(
      reversedResults.map((pokemon) => getPokemonDetails(pokemon.url))
    );
    return pokemonDetails;
  } catch (error) {
    console.error("Error fetching reverse Pokémon:", error);
  }
}

async function fetchPokemon(limit = LIMIT, offset = 0) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );
    const data = await response.json();
    const pokemonDetails = await Promise.all(
      data.results.map((pokemon) => getPokemonDetails(pokemon.url))
    );
    return pokemonDetails;
  } catch (error) {
    console.error("Error fetching Pokémon:", error);
  }
}

function formatPokemonName(name) {
  return name
    .split("-")
    .map((part) => capitalizeFirstLetter(part))
    .join(" ");
}

async function getPokemonDetails(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    data.name = formatPokemonName(data.name);
    return data;
  } catch (error) {
    console.error("Error fetching Pokémon details:", error);
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function createPokemonCard(pokemon) {
  const template = document.getElementById("pokemon-card-template");
  const div = template.content.cloneNode(true).querySelector("a");

  if (pokemon.id <= TOTAL_POKEMON_REAL) {
    div.href = `https://www.pokemon.com/es/pokedex/${pokemon.id}`;
  }

  div.querySelector(".pokemon-image").src =
    pokemon.sprites.other["official-artwork"].front_default;
  div.querySelector(".pokemon-id").textContent = `N. ${String(
    pokemon.id
  ).padStart(4, "0")}`;
  div.querySelector(".pokemon-name").textContent = capitalizeFirstLetter(
    pokemon.name
  );

  const firstType = div.querySelector(".pokemon-type");
  firstType.textContent = capitalizeFirstLetter(
    typeES[pokemon.types[0].type.name]
  );
  firstType.classList.add(`bg-${typeColors[pokemon.types[0].type.name]}`);
  if (whiteTextTypes.includes(pokemon.types[0].type.name)) {
    firstType.classList.add("text-white");
  }

  if (pokemon.types[1]) {
    const secondType = div.querySelectorAll(".pokemon-type")[1];
    secondType.textContent = capitalizeFirstLetter(
      typeES[pokemon.types[1].type.name]
    );
    secondType.classList.add(`bg-${typeColors[pokemon.types[1].type.name]}`);
    if (whiteTextTypes.includes(pokemon.types[1].type.name)) {
      secondType.classList.add("text-white");
    }
  }

  setTimeout(() => div.classList.add("show"), 10);

  return div;
}

function isValidPokemonNumber(str) {
  const num = Number(str);
  return (
    !isNaN(num) &&
    Number.isInteger(num) &&
    num >= 1 &&
    num <= TOTAL_POKEMON_REAL
  );
}

async function searchPokemon() {
  const query = document
    .getElementById("search-input")
    .value.toLowerCase()
    .trim();

  if (!isRandomMode && query === previousSearch) return;
  previousSearch = query;

  document.getElementById("no-results-message").classList.add("hidden");
  document.getElementById("no-results-message").classList.remove("show");
  document.getElementById("pokemon-controls").classList.remove("hidden");

  if (!query) {
    currentPage = 0;
    filteredPokemon = [];
    isRandomMode = false;
    isReversedOrder = false;

    document.getElementById("pokemon-container").innerHTML = "";
    document.getElementById("load-more-button").classList.add("hidden");

    const initialPokemon = await fetchPokemon();
    displayPokemon(initialPokemon);
    document.getElementById("load-more-button").classList.remove("hidden");
    return;
  }

  document.getElementById("load-more-button").classList.add("hidden");
  document.getElementById("loading-spinner").classList.remove("hidden");
  document.getElementById("pokemon-container").innerHTML = "";

  try {
    if (isValidPokemonNumber(query)) {
      const pokemon = await getPokemonDetails(
        `https://pokeapi.co/api/v2/pokemon/${Number(query)}`
      );
      filteredPokemon = [pokemon];
    } else {
      const pokemon = await fetchSearchPokemon(query);
      filteredPokemon = pokemon.filter((p) =>
        p.name.toLowerCase().includes(query)
      );
    }
    if (filteredPokemon.length === 0) {
      showNoResultsMessage();
      return;
    }

    currentPage = 0;
    isRandomMode = false;
    isReversedOrder = false;
    displayPokemon(filteredPokemon.slice(0, LIMIT));

    document.getElementById("loading-spinner").classList.add("hidden");
  } catch (error) {
    console.error("Error searching Pokémon:", error);
  }
}

function showNoResultsMessage() {
  document.getElementById("loading-spinner").classList.add("hidden");
  document.getElementById("pokemon-controls").classList.add("hidden");

  const noResultsMessage = document.getElementById("no-results-message");
  noResultsMessage.classList.remove("hidden");
  setTimeout(() => {
    noResultsMessage.classList.add("show");
  }, 10);
}

function displayPokemon(pokemonList) {
  const container = document.getElementById("pokemon-container");
  pokemonList.forEach((pokemon, i) => {
    const card = createPokemonCard(pokemon);
    container.appendChild(card);
  });

  const totalShown = container.children.length;
  const totalAvailable =
    filteredPokemon.length > 0 ? filteredPokemon.length : TOTAL_POKEMON;
  if (totalShown >= totalAvailable) {
    document.getElementById("load-more-button").classList.add("hidden");
  } else {
    document.getElementById("load-more-button").classList.remove("hidden");
  }
}

async function loadMorePokemon() {
  if (isRandomMode) {
    loadRandomPokemon();
    return;
  }
  currentPage++;
  const offset = currentPage * LIMIT;
  if (filteredPokemon.length > 0) {
    const nextBatch = filteredPokemon.slice(offset, offset + LIMIT);
    displayPokemon(nextBatch);
  } else {
    try {
      const newPokemon = isReversedOrder
        ? await fetchReversePokemon()
        : await fetchPokemon(LIMIT, offset);
      displayPokemon(newPokemon);
    } catch (error) {
      console.error("Error loading more Pokémon:", error);
    }
  }
}

async function loadRandomPokemon() {
  const randomNumbers = [];
  while (randomNumbers.length < LIMIT) {
    const num = Math.floor(Math.random() * TOTAL_POKEMON_REAL) + 1;
    if (!randomNumbers.includes(num)) {
      randomNumbers.push(num);
    }
  }

  const pokemonDetails = await Promise.all(
    randomNumbers.map((num) =>
      getPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${num}`)
    )
  );
  document.getElementById("loading-spinner").classList.add("hidden");
  filteredPokemon = [];
  displayPokemon(pokemonDetails);
}

function resetVariables() {
  currentPage = 0;
  filteredPokemon = [];
  isRandomMode = false;
  isReversedOrder = false;
}

const orderSelect = document.getElementById("pokemon-order-select");
orderSelect.addEventListener("change", async function () {
  document.getElementById("pokemon-container").innerHTML = "";
  const order = this.value;

  if (order === "inf") {
    resetVariables();
    loadMoreBtn.classList.add("hidden");
    const pokemonList = await fetchPokemon(LIMIT, 0);
    displayPokemon(pokemonList);
    loadMoreBtn.classList.remove("hidden");
  } else if (order === "sup") {
    resetVariables();
    isReversedOrder = true;
    loadMoreBtn.classList.add("hidden");
    const pokemonList = await fetchReversePokemon();
    displayPokemon(pokemonList);
    loadMoreBtn.classList.remove("hidden");
  }
});

const randomBtn = document.getElementById("random-button");
randomBtn.addEventListener("click", () => {
  isRandomMode = true;
  document.getElementById("pokemon-container").innerHTML = "";
  document.getElementById("load-more-button").classList.add("hidden");
  document.getElementById("loading-spinner").classList.remove("hidden");
  loadRandomPokemon();
});

const loadMoreBtn = document.getElementById("load-more-button");
loadMoreBtn.addEventListener("click", loadMorePokemon);

document
  .getElementById("search-button")
  .addEventListener("click", searchPokemon);

const clearBtn = document.getElementById("clear-button");
clearBtn.addEventListener("click", function () {
  searchInput.value = "";
  clearBtn.style.display = "none";
});

const searchInput = document.getElementById("search-input");
searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    searchPokemon();
  }
});

searchInput.addEventListener("input", function () {
  clearBtn.style.display = this.value ? "block" : "none";
});

(async () => {
  const pokemonList = await fetchPokemon();
  document.getElementById("search-input").value = "";
  orderSelect.value = "inf";
  displayPokemon(pokemonList);
})();
