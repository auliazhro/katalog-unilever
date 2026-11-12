// ================= KONFIGURASI GATEWAY WHATSAPP =================
// Ganti dengan nomor WhatsApp yang ditautkan ke bot lokal Anda (format internasional: 628...)
const waBotNumber = "6285263798948"; 

// Fungsi membuka chat WhatsApp sesuai petunjuk Modul Halaman 38
function orderProduct(namaProduk, harga) {
  const templatePesan = `Halo Unilever Official Store, saya tertarik membeli produk *${namaProduk}* seharga Rp ${Number(harga).toLocaleString('id-ID')}. Apakah stoknya masih tersedia?`;
  const url = `https://wa.me/${waBotNumber}?text=${encodeURIComponent(templatePesan)}`;
  window.open(url, '_blank');
}

let productsList = [];

// Parser CSV sederhana yang aman terhadap tanda koma di dalam tanda kutip
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const obj = {};
    headers.forEach((h, idx) => {
      let val = values[idx] ? values[idx].trim().replace(/^"|"$/g, '') : '';
      if (h === 'harga') val = Number(val) || 0;
      obj[h] = val;
    });
    return obj;
  });
}

// Membaca file data/products.csv
async function loadKatalog() {
  const grid = document.getElementById("productGrid");
  try {
    const res = await fetch("data/products.csv");
    if (!res.ok) throw new Error("Gagal mengambil file data/products.csv");
    const textData = await res.text();
    productsList = parseCSV(textData);

    renderCards(productsList.slice(0, 48)); // Menampilkan 48 produk pertama
  } catch (err) {
    grid.innerHTML = '<div class="loading">Gagal memuat katalog dari data/products.csv</div>';
    console.error(err);
  }
}

// Me-render kartu produk
function renderCards(items) {
  const grid = document.getElementById("productGrid");
  if (!items.length) {
    grid.innerHTML = '<div class="loading">Produk tidak ditemukan.</div>';
    return;
  }

  grid.innerHTML = items.map(p => {
    const safeNama = (p.nama || "").replace(/'/g, "\\'");
    const imageSrc = p.image_url || "https://via.placeholder.com/200?text=Unilever";
    const ratingText = p.rating ? `⭐ ${p.rating}` : "⭐ 5.0";
    const terjualText = p.terjual ? ` | ${p.terjual}` : "";

    return `
      <div class="card">
        <img src="${imageSrc}" alt="${p.nama}" loading="lazy">
        <span class="badge">${p.kategori || 'Produk'}</span>
        <h3>${p.nama}</h3>
        <p class="price">Rp ${Number(p.harga).toLocaleString('id-ID')}</p>
        <p class="meta">${ratingText}${terjualText}</p>
        <button class="btn-wa" onclick="orderProduct('${safeNama}', ${p.harga})">
          💬 Tanya via WhatsApp
        </button>
      </div>
    `;
  }).join("");
}

// Fitur Pencarian Realtime
document.getElementById("searchInput").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = productsList.filter(p => 
    (p.nama && p.nama.toLowerCase().includes(query)) ||
    (p.kategori && p.kategori.toLowerCase().includes(query))
  );
  renderCards(filtered.slice(0, 48));
});

loadKatalog();