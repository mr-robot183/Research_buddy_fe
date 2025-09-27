let papers = [];
let filteredPapers = [];
let currentPDF = null;
let pdfDoc = null;
let pageNum = 1;
let pageCount = 0;
let scale = 1.0;

// Fetch PDFs from backend
async function loadPapers() {
  const res = await fetch('http://localhost:3000/pdfs');
  papers = await res.json();
  filteredPapers = papers;

  const baskets = [...new Set(papers.map(p => p.basket))];
  const basketFilter = document.getElementById('basketFilter');
  basketFilter.innerHTML = '<option value="All">All Baskets</option>';
  baskets.forEach(b => basketFilter.innerHTML += `<option value="${b}">${b}</option>`);

  renderCards(filteredPapers);
}

// Render PDF cards
function renderCards(papers) {
  const container = document.getElementById('papersContainer');
  container.innerHTML = '';
  papers.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p>Basket: ${p.basket}</p>
      <p>Completed: ${p.completed ? 'Yes' : 'No'}</p>
    `;
    card.onclick = () => openPDF(p.id);
    container.appendChild(card);
  });
}

// Filter by basket
function filterByBasket() {
  const selected = document.getElementById('basketFilter').value;
  filteredPapers = selected === 'All' ? papers : papers.filter(p => p.basket === selected);
  renderCards(filteredPapers);
}

// PDF Viewer functions
async function openPDF(id) {
  currentPDF = id;
  document.getElementById('pdfViewer').classList.remove('hidden');
  document.getElementById('papersContainer').classList.add('hidden');

  const url = `http://localhost:3000/pdf/${id}/raw`;
  pdfDoc = await pdfjsLib.getDocument(url).promise;
  pageNum = 1;
  pageCount = pdfDoc.numPages;
  document.getElementById('pageCount').innerText = pageCount;
  renderPage();
}

function renderPage() {
  pdfDoc.getPage(pageNum).then(page => {
    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    page.render({ canvasContext: ctx, viewport });
    document.getElementById('pageNum').innerText = pageNum;
  });
}

function prevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  renderPage();
}

function nextPage() {
  if (pageNum >= pageCount) return;
  pageNum++;
  renderPage();
}

function zoomIn() { scale += 0.2; renderPage(); }
function zoomOut() { scale = Math.max(0.2, scale - 0.2); renderPage(); }
function closePDF() {
  document.getElementById('pdfViewer').classList.add('hidden');
  document.getElementById('papersContainer').classList.remove('hidden');
  pdfDoc = null;
}

// Load papers on page load
window.onload = loadPapers;