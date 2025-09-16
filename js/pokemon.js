const LIMIT = 20;

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
  bug: "lime-600",
  dark: "gray-800",
  dragon: "indigo-600",
  electric: "yellow-400",
  fairy: "pink-400",
  fighting: "red-700",
  fire: "red-500",
  flying: "cyan-300",
  ghost: "purple-700",
  grass: "green-500",
  ground: "yellow-600",
  ice: "cyan-400",
  normal: "gray-400",
  poison: "purple-500",
  psychic: "pink-600",
  rock: "yellow-800",
  steel: "gray-500",
  water: "blue-500",
};

async function fetchPokemon(offset = 0) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${offset}`
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
  firstType.textContent = capitalizeFirstLetter(pokemon.types[0].type.name);
  firstType.classList.add(`bg-${typeColors[pokemon.types[0].type.name]}`);

  if (pokemon.types[1]) {
    const secondType = div.querySelectorAll(".pokemon-type")[1];
    secondType.textContent = capitalizeFirstLetter(pokemon.types[1].type.name);
    secondType.classList.add(`bg-${typeColors[pokemon.types[1].type.name]}`);
  }

  return div;
}

function displayPokemon(pokemonList) {
  const container = document.getElementById("pokemon-container");
  pokemonList.forEach((pokemon) => {
    const card = createPokemonCard(pokemon);
    container.appendChild(card);
  });
}

(async () => {
  const pokemonList = await fetchPokemon();
  displayPokemon(pokemonList);
})();
