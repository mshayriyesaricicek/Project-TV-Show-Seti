let allEpisodes = [];
let allShows = [];
const episodesCache = {};

function formatEpisodeCode(season, episodeNumber) {
  const paddedSeason = String(season).padStart(2, "0");
  const paddedEpisodeNumber = String(episodeNumber).padStart(2, "0");
  return `S${paddedSeason}E${paddedEpisodeNumber}`;
}

function createEpisodeCard(episode) {
  const article = document.createElement("article");
  article.className = "episode-card";

  const heading = document.createElement("h2");
  heading.className = "episode-title";
  heading.textContent = `${episode.name} - ${formatEpisodeCode(
    episode.season,
    episode.number,
  )}`;

  const image = document.createElement("img");
  image.className = "episode-image";
  image.src = episode.image ? episode.image.medium : "";
  image.alt = `${episode.name} episode image`;

  const meta = document.createElement("p");
  meta.className = "episode-meta";
  meta.textContent = `Season ${episode.season}, Episode ${episode.number}`;

  const summary = document.createElement("div");
  summary.className = "episode-summary";
  summary.innerHTML = episode.summary || "";

  const sourceLink = document.createElement("p");
  sourceLink.className = "episode-link";

  const link = document.createElement("a");
  link.href = episode.url || "#";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View this episode on TVMaze";

  sourceLink.appendChild(link);

  article.appendChild(heading);
  article.appendChild(image);
  article.appendChild(meta);
  article.appendChild(summary);
  article.appendChild(sourceLink);

  return article;
}

function createShowCard(show) {
  const article = document.createElement("article");
  article.className = "show-card";

  const title = document.createElement("h2");
  title.textContent = show.name;

  const image = document.createElement("img");
  image.src = show.image ? show.image.medium : "";
  image.alt = `${show.name} image`;

  const summary = document.createElement("div");
  summary.innerHTML = show.summary || "";

  article.appendChild(title);
  article.appendChild(image);
  article.appendChild(summary);

  // 👇 IMPORTANT: click → load episodes
  article.addEventListener("click", () => {
    loadEpisodesForShow(show.id);
  });

  return article;
}

function displayShows(shows) {
  const rootElement = document.getElementById("root");
  rootElement.innerHTML = "";

  shows.forEach((show) => {
    const showCard = createShowCard(show);
    rootElement.appendChild(showCard);
  });
}

function displayEpisodes(episodes) {
  const rootElement = document.getElementById("root");
  rootElement.innerHTML = "";

  episodes.forEach((episode) => {
    const episodeCard = createEpisodeCard(episode);
    rootElement.appendChild(episodeCard);
  });
}

function updateEpisodeCount(
  visibleEpisodes,
  totalEpisodes = allEpisodes.length,
) {
  const episodeCountElement = document.getElementById("episode-count");
  episodeCountElement.textContent = `Displaying ${visibleEpisodes.length}/${totalEpisodes} episodes.`;
}

function populateEpisodes(episodes) {
  const episodeSelect = document.getElementById("episodeSelect");
  episodeSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "All Episodes";
  episodeSelect.appendChild(defaultOption);

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = formatEpisodeCode(episode.season, episode.number);
    option.textContent = `${formatEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
}

function populateShows(shows) {
  const showSelect = document.getElementById("showSelect");
  showSelect.innerHTML = "";

  const sortedShows = [...shows].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );

  sortedShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

function render() {
  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");
  const activeFiltersText = document.getElementById("activeFilters");
  const helperMessage = document.getElementById("helperMessage");

  const searchTerm = (searchInput.value || "").trim().toLowerCase();
  const selectedEpisode = episodeSelect.value;

  const filteredEpisodes = allEpisodes.filter((episode) => {
    const episodeCode = formatEpisodeCode(episode.season, episode.number);
    const shortEpisodeCode =
      `S${episode.season}E${episode.number}`.toLowerCase();
    const name = (episode.name || "").toLowerCase();
    const summary = (episode.summary || "")
      .replace(/<[^>]*>/g, "")
      .toLowerCase();

    const matchesSearch =
      name.includes(searchTerm) ||
      summary.includes(searchTerm) ||
      episodeCode.toLowerCase().includes(searchTerm) ||
      shortEpisodeCode.includes(searchTerm);

    const matchesDropdown =
      selectedEpisode === "all" || episodeCode === selectedEpisode;

    return matchesSearch && matchesDropdown;
  });

  displayEpisodes(filteredEpisodes);
  updateEpisodeCount(filteredEpisodes, allEpisodes.length);

  const hasSearch = searchInput.value !== "";
  const hasDropdown = episodeSelect.value !== "all";

  if (hasSearch && hasDropdown) {
    activeFiltersText.textContent = `Filtering by: "${searchInput.value}" in ${episodeSelect.value}`;
  } else if (hasSearch) {
    activeFiltersText.textContent = `Filtering by: "${searchInput.value}"`;
  } else if (hasDropdown) {
    activeFiltersText.textContent = `Filtering by: ${episodeSelect.value}`;
  } else {
    activeFiltersText.textContent = "";
  }

  if (hasSearch || hasDropdown) {
    helperMessage.textContent =
      "Press 'Clear Filters' to reset your search and dropdown selections.";
  } else {
    helperMessage.textContent = "";
  }
}

async function fetchShows() {
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const showSelect = document.getElementById("showSelect");

  loadingMessage.textContent = "Loading shows...";
  errorMessage.textContent = "";

  try {
    const response = await fetch("https://api.tvmaze.com/shows");

    if (!response.ok) {
      throw new Error("Failed to load shows.");
    }

    allShows = await response.json();
    populateShows(allShows);

    displayShows(allShows);

    loadingMessage.textContent = "";
  } catch (error) {
    loadingMessage.textContent = "";
    errorMessage.textContent =
      "Sorry, something went wrong while loading shows.";
  }
}

async function loadEpisodesForShow(showId) {
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");
  const activeFiltersText = document.getElementById("activeFilters");
  const helperMessage = document.getElementById("helperMessage");

  loadingMessage.textContent = "Loading episodes...";
  errorMessage.textContent = "";

  try {
    if (episodesCache[showId]) {
      allEpisodes = episodesCache[showId];
    } else {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );

      if (!response.ok) {
        throw new Error("Failed to load episodes.");
      }

      const episodes = await response.json();
      episodesCache[showId] = episodes;
      allEpisodes = episodes;
    }

    searchInput.value = "";
    populateEpisodes(allEpisodes);
    episodeSelect.value = "all";

    displayEpisodes(allEpisodes);
    updateEpisodeCount(allEpisodes, allEpisodes.length);

    activeFiltersText.textContent = "";
    helperMessage.textContent = "";
    loadingMessage.textContent = "";
  } catch (error) {
    loadingMessage.textContent = "";
    errorMessage.textContent =
      "Sorry, something went wrong while loading episodes for this show.";
  }
}

function setup() {
  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");
  const showSelect = document.getElementById("showSelect");
  const clearButton = document.getElementById("clearFilters");

  searchInput.addEventListener("input", render);
  episodeSelect.addEventListener("change", render);

  showSelect.addEventListener("change", () => {
    loadEpisodesForShow(showSelect.value);
  });

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    episodeSelect.value = "all";
    render();
  });

  fetchShows();
}

window.onload = setup;
