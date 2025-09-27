const apiUrl =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";
const cryptoList = document.getElementById("crypto-list");
const searchInput = document.getElementById("crypto-search");
const sortSelect = document.getElementById("crypto-sort");

let allCryptos = [];
let filteredCryptos = [];

async function fetchCryptos() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    allCryptos = data;
    filteredCryptos = [...allCryptos];
    displayCryptos(filteredCryptos);
  } catch (error) {
    console.error("Error fetching cryptos:", error);
    cryptoList.innerHTML =
      '<div class="text-red-600">Error al cargar criptomonedas.</div>';
  }
}

function createCryptoCard(crypto) {
  const template = document.getElementById("crypto-card-template");
  const card = template.content.cloneNode(true);

  const img = card.querySelector(".crypto-image");
  img.src = crypto.image;
  img.alt = crypto.name;
  img.onerror = function () {
    this.onerror = null;
    this.src = "../img/placeholder.jpg";
  };

  card.querySelector(".crypto-name").textContent = crypto.name;
  card.querySelector(".crypto-symbol").textContent =
    crypto.symbol.toUpperCase();
  card.querySelector(
    ".crypto-price"
  ).textContent = `$${crypto.current_price.toLocaleString()}`;
  const change = card.querySelector(".crypto-change");
  const changeValue = crypto.price_change_percentage_24h;
  change.textContent = `${changeValue > 0 ? "+" : ""}${changeValue.toFixed(
    2
  )}%`;
  change.style.color = changeValue >= 0 ? "green" : "red";

  return card;
}

function displayCryptos(cryptos) {
  cryptoList.innerHTML = "";
  if (!cryptos.length) {
    cryptoList.innerHTML =
      '<div class="text-gray-500">No se encontraron criptomonedas.</div>';
    return;
  }
  cryptos.forEach((crypto) => {
    const card = createCryptoCard(crypto);
    cryptoList.appendChild(card);
  });
}

function sortCryptos(cryptos, sortType) {
  const sorted = [...cryptos];
  switch (sortType) {
    case "market_cap_desc":
      sorted.sort((a, b) => b.market_cap - a.market_cap);
      break;
    case "market_cap_asc":
      sorted.sort((a, b) => a.market_cap - b.market_cap);
      break;
    case "price_desc":
      sorted.sort((a, b) => b.current_price - a.current_price);
      break;
    case "price_asc":
      sorted.sort((a, b) => a.current_price - b.current_price);
      break;
    case "change_desc":
      sorted.sort(
        (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
      );
      break;
    case "change_asc":
      sorted.sort(
        (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
      );
      break;
    case "name_asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name_desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      break;
  }
  return sorted;
}

searchInput.addEventListener("input", function () {
  const query = this.value.trim().toLowerCase();
  filteredCryptos = allCryptos.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(query) ||
      crypto.symbol.toLowerCase().includes(query)
  );
  const sortType = sortSelect.value;
  const sorted = sortCryptos(filteredCryptos, sortType);
  displayCryptos(sorted);
});

sortSelect.addEventListener("change", function () {
  const sortType = this.value;
  const sorted = sortCryptos(filteredCryptos, sortType);
  displayCryptos(sorted);
});

fetchCryptos();
