let allEpisodes = [];

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
  image.src = episode.image.medium;
  image.alt = `${episode.name} episode image`;

  const meta = document.createElement("p");
  meta.className = "episode-meta";
  meta.textContent = `Season ${episode.season}, Episode ${episode.number}`;

  const summary = document.createElement("div");
  summary.className = "episode-summary";
  summary.innerHTML = episode.summary;

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

function displayEpisodes(episodes) {
  const rootElement = document.getElementById("root");
  rootElement.innerHTML = "";

  episodes.forEach((episode) => {
    const episodeCard = createEpisodeCard(episode);
    rootElement.appendChild(episodeCard);
  });
}

function updateEpisodeCount(episodes) {
  const episodeCountElement = document.getElementById("episode-count");
  episodeCountElement.textContent = `Showing ${episodes.length} episode(s)`;
}

function render() {
  const searchTerm = (
    document.getElementById("searchInput").value || ""
  ).toLowerCase();
  const selectedEpisode = document.getElementById("episodeSelect").value;
  const filteredEpisodes = allEpisodes.filter((episode) => {
    const name = (episode.name || "").toLowerCase();
    const summary = (episode.summary || "").toLowerCase();

    const matchesSearch =
      name.includes(searchTerm) || summary.includes(searchTerm);

    const matchesEpisode =
      selectedEpisode === "all" ||
      String(episode.id) === String(selectedEpisode);

    return matchesSearch && matchesEpisode;

    return name.includes(searchTerm) || summary.includes(searchTerm);
  });

  displayEpisodes(filteredEpisodes);
  updateEpisodeCount(filteredEpisodes);
}

function setup() {
  allEpisodes = getAllEpisodes();
  displayEpisodes(allEpisodes);
  updateEpisodeCount(allEpisodes);

  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");

  searchInput.addEventListener("input", render);
  episodeSelect.addEventListener("change", render);
}

window.onload = setup;
