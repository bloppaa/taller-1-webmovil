const API_CONFIG = {
    SPOONACULAR: {
        BASE_URL: 'https://api.spoonacular.com/recipes',
        API_KEY: '76c335c80985436eac192d8007276bc5',
        ENDPOINTS: {
            RANDOM: '/random',
            SEARCH: '/complexSearch',
            DETAIL: '/information'
        }
    }
};

class RecipesAPI {
    constructor() {
        this.apiKey = API_CONFIG.SPOONACULAR.API_KEY;
        this.baseURL = API_CONFIG.SPOONACULAR.BASE_URL;
    }

    async getRandomRecipes(number = 6) {
        try {
            const response = await fetch(
                `${this.baseURL}${API_CONFIG.SPOONACULAR.ENDPOINTS.RANDOM}?number=${number}&apiKey=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.recipes;
        } catch (error) {
            console.error('Error fetching random recipes:', error);
            throw error;
        }
    }

    async searchRecipes(query, number = 12) {
        try {
            const response = await fetch(
                `${this.baseURL}${API_CONFIG.SPOONACULAR.ENDPOINTS.SEARCH}?query=${encodeURIComponent(query)}&number=${number}&apiKey=${this.apiKey}&addRecipeInformation=true`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error searching recipes:', error);
            throw error;
        }
    }

    async getRecipeDetails(id) {
        try {
            const response = await fetch(
                `${this.baseURL}/${id}${API_CONFIG.SPOONACULAR.ENDPOINTS.DETAIL}?apiKey=${this.apiKey}&includeNutrition=true`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            throw error;
        }
    }
}

// Exportar para uso global
window.RecipesAPI = RecipesAPI;