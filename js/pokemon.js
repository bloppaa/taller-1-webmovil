const LIMIT = 20;

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

(async () => {
  const pokemonList = await fetchPokemon();
  console.log(pokemonList);
})();
