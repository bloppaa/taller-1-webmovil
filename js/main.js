const resources = [
    {
      id: 'pokemon',
      title: 'Pokémon',
      description: 'Información de Pokémon',
      endpoint: 'https://pokeapi.co/api/v2/pokemon',
      icon: '⚡',
      page: 'pages/pokemon.html'
    },
    {
      id: 'recipes',
      title: 'Recetas',
      description: 'Recetas de cocina deliciosas',
      endpoint: 'https://api.spoonacular.com/recipes',
      icon: '🍳',
      page: 'pages/recipes.html'
    },

  ];

  // Insertar recursos en el grid
const grid = document.getElementById('resources-grid');
resources.forEach(resource => {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer';
  card.innerHTML = `
    <div class="text-4xl mb-2">${resource.icon}</div>
    <h3 class="font-bold text-lg">${resource.title}</h3>
    <p class="text-sm text-gray-600 mt-2">${resource.description}</p>
  `;
  card.addEventListener('click', () => {
    window.location.href = resource.page;
  });
  grid.appendChild(card);
});

// Precargar datos de Pokémon para la landing
async function preloadPokemonData() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=6');
    const data = await response.json();
    
    // Mostrar mini preview en consola o podrías mostrar en UI
    console.log('Pokémon precargados:', data.results.map(p => p.name));
  } catch (error) {
    console.error('Error precargando Pokémon:', error);
  }
}

// Precargar recetas aleatorias para mostrar en preview
async function preloadRecipesData() {
  try {
    if (typeof RecipesAPI !== 'undefined') {
      const recipesAPI = new RecipesAPI();
      const recipes = await recipesAPI.getRandomRecipes(3);
      console.log('Recetas precargadas:', recipes.map(r => r.title));
    }
  } catch (error) {
    console.error('Error precargando recetas:', error);
  }
}

// Llamar a las precargas cuando la página cargue
window.addEventListener('DOMContentLoaded', function() {
  preloadPokemonData();
  preloadRecipesData();
});