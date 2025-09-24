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
    {
      id: 'weather',
      title: 'Clima',
      description: 'Pronóstico del tiempo',
      endpoint: 'https://api.openweathermap.org/data/2.5',
      icon: '🌤️',
      page: 'pages/w2.html'
    },

  ];

  // Insertar recursos en el grid con diseño mejorado
const grid = document.getElementById('resources-grid');

// Función para crear e insertar las tarjetas
function createCards() {
  resources.forEach((resource, index) => {
    const card = document.createElement('div');
    card.className = `
      group relative overflow-hidden 
      backdrop-blur-md bg-white/10 
      border border-white/20 
      rounded-3xl p-8 
      hover:bg-white/20 hover:border-white/30
      transition-all duration-500 ease-out
      cursor-pointer transform hover:scale-105
      hover:shadow-2xl hover:shadow-purple-500/25
      card-hover opacity-0
    `;
    
    // Configurar animación inicial
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';
  
  const gradients = {
    'pokemon': 'from-yellow-400 to-orange-500',
    'recipes': 'from-orange-400 to-red-500', 
    'weather': 'from-blue-400 to-cyan-500'
  };
  
  card.innerHTML = `
    <!-- Efecto de brillo en hover -->
    <div class="absolute inset-0 bg-gradient-to-r ${gradients[resource.id]} opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
    
    <!-- Icono con efecto -->
    <div class="relative mb-6">
      <div class="w-20 h-20 mx-auto bg-gradient-to-r ${gradients[resource.id]} rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500">
        <span class="text-4xl filter drop-shadow-lg">${resource.icon}</span>
      </div>
    </div>
    
    <!-- Contenido -->
    <div class="relative text-center">
      <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:${gradients[resource.id]} group-hover:bg-clip-text transition-all duration-300">
        ${resource.title}
      </h3>
      <p class="text-purple-200 leading-relaxed mb-6">
        ${resource.description}
      </p>
      
      <!-- Badge de estado -->
      <div class="inline-flex items-center px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
        <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
        <span class="text-green-300 text-sm font-medium">API Activa</span>
      </div>
    </div>
    
    <!-- Flecha de navegación -->
    <div class="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
        <span class="text-white text-lg">→</span>
      </div>
    </div>
  `;
  
    card.addEventListener('click', () => {
      // Efecto de click
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        window.location.href = resource.page;
      }, 150);
    });
    
    grid.appendChild(card);
    
    // Animar la tarjeta después de un pequeño delay
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) scale(1)';
    }, index * 150 + 100);
  });
}

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

// Función para crear efectos de partículas
function createParticles() {
  const particles = document.querySelector('.particles');
  if (!particles) return;
  
  for (let i = 0; i < 3; i++) {
    const particle = document.createElement('div');
    particle.className = 'absolute rounded-full opacity-20 animate-pulse';
    
    const size = Math.random() * 100 + 50;
    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-pink-500', 'bg-cyan-500'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.classList.add(color);
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 3}s`;
    particle.style.animationDuration = `${3 + Math.random() * 2}s`;
    
    particles.appendChild(particle);
  }
}

// Función para efectos de scroll suave
function smoothScroll() {
  // Asegurarse de que las tarjetas estén disponibles
  setTimeout(() => {
    const cards = document.querySelectorAll('.card-hover');
    
    if (cards.length === 0) {
      console.log('No se encontraron tarjetas para animar');
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) scale(1)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach((card) => {
      observer.observe(card);
    });
  }, 100);
}

// Llamar a las precargas cuando la página cargue
window.addEventListener('DOMContentLoaded', function() {
  console.log('Página cargada, inicializando...');
  
  // Crear las tarjetas primero
  createCards();
  
  // Luego configurar los efectos
  setTimeout(() => {
    createParticles();
    smoothScroll();
    
    // Precargar datos en segundo plano
    preloadPokemonData();
    preloadRecipesData();
    
    // Agregar clase de carga completada
    document.body.classList.add('loaded');
  }, 200);
});