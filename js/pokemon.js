const LIMIT = 12;
const TOTAL_POKEMON = 1302;
let currentPage = 0;
let filteredPokemon = [];
let previousSearch = "";

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

async function getPokemonDetails(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
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
  const div = template.content.cloneNode(true).querySelector("div");

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

async function searchPokemon() {
  const query = document
    .getElementById("search-input")
    .value.toLowerCase()
    .trim();

  if (query === previousSearch) return;
  previousSearch = query;

  if (!query) {
    filteredPokemon = [];
    currentPage = 0;

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
    const pokemon = await fetchPokemon(TOTAL_POKEMON, 0);
    filteredPokemon = pokemon.filter((p) =>
      p.name.toLowerCase().includes(query)
    );
    if (filteredPokemon.length === 0) {
      showNoResultsMessage();
      return;
    }
    displayPokemon(filteredPokemon.slice(0, LIMIT));

    document.getElementById("loading-spinner").classList.add("hidden");
  } catch (error) {
    console.error("Error searching Pokémon:", error);
  }
}

function showNoResultsMessage() {
  document.getElementById("loading-spinner").classList.add("hidden");
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
  console.log({ totalShown, totalAvailable });
  if (totalShown === totalAvailable) {
    document.getElementById("load-more-button").classList.add("hidden");
  } else {
    document.getElementById("load-more-button").classList.remove("hidden");
  }
}

async function loadMorePokemon() {
  currentPage++;
  const offset = currentPage * LIMIT;
  if (filteredPokemon.length > 0) {
    const nextBatch = filteredPokemon.slice(offset, offset + LIMIT);
    displayPokemon(nextBatch);
  } else {
    try {
      const newPokemon = await fetchPokemon(LIMIT, offset);
      displayPokemon(newPokemon);
    } catch (error) {
      console.error("Error loading more Pokémon:", error);
    }
  }
}

document
  .getElementById("load-more-button")
  .addEventListener("click", loadMorePokemon);

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
  displayPokemon(pokemonList);
})();
