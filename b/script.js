// ==========================================
// S@TRAT ANA SİSTEM ÇEKİRDEĞİ (KUSURSUZ SWIPER)
// ==========================================

let products = [];
let favorites = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let activeProductId = null,
  currentCategory = "Tümü",
  currentSelectedRating = 5,
  activePromo = null,
  selectedProductColor = null;
let isJohtoUnlocked = false,
  isMatrixUnlocked = false,
  isBestSellerActive = false,
  currentMaxPrice = 15000;
let user = localStorage.getItem("username");

const achievementsList = {
  first_blood: { title: "İlk Kan", desc: "İlk sipariş.", icon: "🩸" },
  hoarder: {
    title: "Koleksiyoncu",
    desc: "İstek listesi eklendi.",
    icon: "🎒",
  },
  wise: { title: "Bilge", desc: "İlk yorum yapıldı.", icon: "🦉" },
  secret: {
    title: "Sırların Koruyucusu",
    desc: "Johto odası bulundu.",
    icon: "🗝️",
  },
  hacker: {
    title: "Sistem Yöneticisi",
    desc: "Matrix ağına sızıldı.",
    icon: "🕶️",
  },
  dungeon_master: {
    title: "Zindan Ustası",
    desc: "404 Zindanından kaçıldı.",
    icon: "🏃",
  },
};
const validPromoCodes = {
  WINTER50: { type: "percent", value: 50 },
  LUGIA50: { type: "percent", value: 50 },
  ZINDAN50: { type: "percent", value: 50 },
};

// 🔊 SES EFEKTLERİ
const sfx = {
  slash: new Audio(
    "https://cdn.pixabay.com/download/audio/2022/03/15/audio_4045f062d3.mp3",
  ),
  coin: new Audio(
    "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3",
  ),
  hover: new Audio(
    "https://cdn.pixabay.com/download/audio/2021/08/09/audio_82c53641b9.mp3",
  ),
};
sfx.slash.volume = 0.6;
sfx.coin.volume = 0.8;
sfx.hover.volume = 0.1;
const playSFX = (type) => {
  const sound = sfx[type].cloneNode();
  sound.volume = sfx[type].volume;
  sound.play().catch(() => {});
};

// ==========================================
// 🚀 BAŞLATMA VE VERİLERİ ÇEKME
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:3000/api/products");
    if (!response.ok) throw new Error("Sunucu yanıt vermedi!");
    let rawProducts = await response.json();
    products = rawProducts.map((p) => ({
      ...p,
      desc: p.description,
      best_seller: p.best_seller === true || p.best_seller === 1,
      stock: p.stock !== undefined ? p.stock : 10,
    }));

    filterProducts();
    updateUI();
    checkTimeAndSetTheme();
    if (user) loadFavorites();

    // 🌟 İŞTE O ORİJİNAL, KUSURSUZ SWIPER KODU 🌟
    if (document.querySelector(".mySwiper")) {
      new Swiper(".mySwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        initialSlide: 1,
        coverflowEffect: {
          rotate: 30,
          stretch: 0,
          depth: 200,
          modifier: 1.2,
          slideShadows: true,
        },
        loop: true,
        autoplay: {
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
      });
    }

    const l = document.getElementById("loader");
    if (l) l.style.display = "none";
  } catch (error) {
    const l = document.getElementById("loader");
    if (l) {
      l.style.display = "block";
      l.innerHTML = `<div style="text-align:center; color:#ff4d00; margin-top:20vh;"><i class="fas fa-skull" style="font-size: 5rem; margin-bottom: 20px;"></i><h1 style="font-family: monospace; text-shadow: 0 0 15px #ff4d00;">SİSTEM BAĞLANTISI KOPTU!</h1><p>Terminalden 'node server.js' komutunu ateşle!</p></div>`;
    }
  }
});

const getStarsHTML = (r) => {
  let h = "";
  const f = Math.floor(r),
    hh = r - f >= 0.5;
  for (let i = 1; i <= 5; i++) {
    if (i <= f) h += '<i class="fas fa-star"></i>';
    else if (i === f + 1 && hh) h += '<i class="fas fa-star-half-alt"></i>';
    else h += '<i class="far fa-star"></i>';
  }
  return h;
};
const showToast = (m, t = "success") => {
  const c = document.getElementById("toast-container");
  if (!c) return;
  const tt = document.createElement("div");
  tt.className = "toast";
  tt.style.borderLeftColor = t === "success" ? "#4caf50" : "#ff4d00";
  tt.innerHTML = `${t === "success" ? '<i class="fas fa-check-circle" style="color:#4caf50;"></i>' : '<i class="fas fa-exclamation-circle" style="color:#ff4d00;"></i>'} <span>${m}</span>`;
  c.appendChild(tt);
  setTimeout(() => {
    tt.style.opacity = "0";
    setTimeout(() => tt.remove(), 300);
  }, 3000);
};
const unlockAchievement = (id) => {
  if (!user) return;
};

// ==========================================
// 🔍 ARAMA VE SİBER-ÜS (ADMİN PANELİ)
// ==========================================
const handleSearch = () => {
  const s = document
    .getElementById("product-search")
    .value.toLowerCase()
    .trim();
  const box = document.getElementById("search-suggestions");
  if (s === "admin") {
    openAdminLogin();
    document.getElementById("product-search").value = "";
    box.style.display = "none";
    return;
  }
  if (s === "ho-oh" || s === "johto") {
    unlockJohtoSecret();
    document.getElementById("product-search").value = "";
    box.style.display = "none";
    return;
  }
  if (s === "matrix" || s === "hack") {
    unlockMatrixSecret();
    document.getElementById("product-search").value = "";
    box.style.display = "none";
    return;
  }
  if (s === "404" || s === "zindan") {
    openDungeon();
    document.getElementById("product-search").value = "";
    box.style.display = "none";
    return;
  }

  filterProducts();
  if (!s) {
    box.style.display = "none";
    return;
  }
  const f = products
    .filter((p) => {
      if (p.category === "Johto Efsaneleri" && !isJohtoUnlocked) return false;
      if (p.category === "Karaborsa" && !isMatrixUnlocked) return false;
      return (
        p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s)
      );
    })
    .slice(0, 5);

  if (f.length > 0) {
    box.innerHTML = f
      .map(
        (p) =>
          `<div class="suggestion-item" onclick="selectSuggestion(${p.id})"><div class="suggestion-icon">${p.icon}</div><div><span class="suggestion-name">${p.name}</span><span class="suggestion-price" style="color:var(--secondary);font-weight:bold;font-size:0.85rem;">${p.price} TL</span></div></div>`,
      )
      .join("");
    box.style.display = "block";
  } else {
    box.innerHTML = `<div style="padding:15px;text-align:center;"><i class="fas fa-search-minus"></i><br>Sonuç bulunamadı</div>`;
    box.style.display = "block";
  }
};
const selectSuggestion = (id) => {
  document.getElementById("product-search").value = products.find(
    (p) => p.id === id,
  ).name;
  document.getElementById("search-suggestions").style.display = "none";
  openProductDetail(id);
  filterProducts();
};

const openAdminLogin = () => {
  const u = prompt("YÖNETİCİ ADI:");
  if (u !== "admin") return showToast("Erişim Reddedildi!", "error");
  const p = prompt("ŞİFRE:");
  if (p !== "123") return showToast("Hatalı Şifre!", "error");
  showToast("Yetki [ADMİN]", "success");
  openAdminPanel();
};
const openAdminPanel = () => {
  let adminModal = document.getElementById("admin-modal");
  if (!adminModal) {
    adminModal = document.createElement("div");
    adminModal.id = "admin-modal";
    adminModal.className = "modal";
    document.body.appendChild(adminModal);
  }
  const productOptions = products
    .map(
      (p) =>
        `<option value="${p.id}">${p.icon} ${p.name} (Stok: ${p.stock})</option>`,
    )
    .join("");
  adminModal.innerHTML = `
        <div class="modal-content" style="border: 2px solid #39ff14; box-shadow: 0 0 30px #39ff14; background: #050505; color: #39ff14; max-height: 90vh; overflow-y: auto;">
            <h2 style="font-family: monospace; margin-bottom: 20px; color: white;"><i class="fas fa-plus-circle" style="color:#39ff14;"></i> YENİ GANİMET ENJEKTE ET</h2>
            <input type="text" id="admin-name" placeholder="Ürün Adı" style="width:100%; margin-bottom:10px; padding:10px; background:#111; color:white; border:1px solid #39ff14;">
            <select id="admin-category" style="width:100%; margin-bottom:10px; padding:10px; background:#111; color:white; border:1px solid #39ff14;">
                <option value="Samuray Serisi">Samuray Serisi</option><option value="Şövalye Zırhı">Şövalye Zırhı</option><option value="Johto Efsaneleri">Johto Efsaneleri</option><option value="Karaborsa">Karaborsa</option><option value="Retro Macera">Retro Macera</option>
            </select>
            <input type="number" id="admin-price" placeholder="Fiyat (TL)" style="width:100%; margin-bottom:10px; padding:10px; background:#111; color:white; border:1px solid #39ff14;">
            <input type="text" id="admin-icon" placeholder="Emoji" style="width:100%; margin-bottom:10px; padding:10px; background:#111; color:white; border:1px solid #39ff14;">
            <textarea id="admin-desc" placeholder="Açıklama" style="width:100%; height:80px; margin-bottom:10px; padding:10px; background:#111; color:white; border:1px solid #39ff14;"></textarea>
            <label style="display:block; margin-bottom:10px; color:white; cursor:pointer;"><input type="checkbox" id="admin-bestseller"> Çok Satan 🔥</label>
            <button onclick="submitNewProduct()" class="btn-pay" style="width:100%; background:#39ff14; color:black; font-weight:bold; box-shadow: 0 0 10px #39ff14; margin-bottom: 25px;">SİSTEME ENJEKTE ET</button>
            <hr style="border-color: #39ff14; opacity: 0.3; margin-bottom: 25px;">
            <h2 style="font-family: monospace; margin-bottom: 20px; color: white;"><i class="fas fa-boxes" style="color:#ffd700;"></i> MEVCUT STOĞU GÜNCELLE</h2>
            <select id="admin-update-id" style="width:100%; margin-bottom:10px; padding:10px; background:#111; color:white; border:1px solid #ffd700;"><option value="" disabled selected>-- Ürünü Seç --</option>${productOptions}</select>
            <input type="number" id="admin-update-stock" placeholder="Yeni Stok Adedi" style="width:100%; margin-bottom:15px; padding:10px; background:#111; color:white; border:1px solid #ffd700;">
            <button onclick="updateStock()" class="btn-pay" style="width:100%; background:#ffd700; color:black; font-weight:bold; box-shadow: 0 0 10px #ffd700;">STOĞU GÜNCELLE</button>
        </div>`;
  openModal("admin-modal");
};

const submitNewProduct = async () => {
  const name = document.getElementById("admin-name").value.trim(),
    category = document.getElementById("admin-category").value,
    price = document.getElementById("admin-price").value,
    icon = document.getElementById("admin-icon").value.trim(),
    desc = document.getElementById("admin-desc").value.trim(),
    best_seller = document.getElementById("admin-bestseller").checked;
  if (!name || !price || !icon)
    return showToast("Eksik veri girdiniz!", "error");
  try {
    const res = await fetch("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, price, icon, desc, best_seller }),
    });
    if (res.ok) {
      showToast("Ganimet SQL'e İşlendi!", "success");
      closeModal("admin-modal");
      setTimeout(() => location.reload(), 1500);
    } else showToast("Veritabanı Reddedildi!", "error");
  } catch (err) {
    showToast("Bağlantı Hatası!", "error");
  }
};
const updateStock = async () => {
  const id = document.getElementById("admin-update-id").value,
    stock = document.getElementById("admin-update-stock").value;
  if (!id || stock === "" || stock < 0)
    return showToast("Geçerli stok girin!", "error");
  try {
    const res = await fetch("http://localhost:3000/api/products/stock", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(id), stock: parseInt(stock) }),
    });
    if (res.ok) {
      showToast("Stok Güncellendi!", "success");
      closeModal("admin-modal");
      setTimeout(() => location.reload(), 1500);
    } else showToast("Veritabanı Reddedildi!", "error");
  } catch (err) {
    showToast("Bağlantı Hatası!", "error");
  }
};

// ==========================================
// 🎨 FİLTRELEME VE EKRANA BASMA (SADECE MANTIK)
// ==========================================
const updatePriceDisplay = () => {
  currentMaxPrice = document.getElementById("price-range").value;
  document.getElementById("price-output").innerText = currentMaxPrice + " TL";
};
const toggleBestSellers = () => {
  isBestSellerActive = !isBestSellerActive;
  const btn = document.getElementById("best-seller-btn");
  if (isBestSellerActive) {
    btn.classList.add("active");
    playSFX("hover");
  } else btn.classList.remove("active");
  filterProducts();
};
window.setCategory = (c) => {
  currentCategory = c;
  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.remove("active");
    if (b.innerText.includes(c)) b.classList.add("active");
  });
  document.getElementById("product-search").value = "";
  filterProducts();
};

const filterProducts = () => {
  const s = document.getElementById("product-search").value.toLowerCase();
  const f = products.filter((p) => {
    if (
      p.category === "Johto Efsaneleri" &&
      currentCategory !== "Johto Efsaneleri"
    )
      return false;
    if (p.category === "Karaborsa" && currentCategory !== "Karaborsa")
      return false;
    const matchesCategory =
      currentCategory === "Tümü" || p.category === currentCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(s) ||
      (p.desc && p.desc.toLowerCase().includes(s));
    const matchesPrice = p.price <= currentMaxPrice;
    const matchesBestSeller = isBestSellerActive ? p.best_seller : true;
    return (
      matchesCategory && matchesSearch && matchesPrice && matchesBestSeller
    );
  });
  renderProducts(f);
};

const renderProducts = (items) => {
  const g = document.getElementById("products-grid");
  if (!g) return;
  if (items.length === 0) {
    g.innerHTML = `<div style="grid-column:1/-1;text-align:center;"><i class="fas fa-search-minus" style="font-size:3rem;"></i><h2>Ürün bulunamadı.</h2></div>`;
    return;
  }

  g.innerHTML = items
    .map((p) => {
      const isOut = p.stock <= 0;
      const btnText = isOut ? "TÜKENDİ" : `Sepete Ekle (Stok: ${p.stock})`;
      const btnStyle = isOut
        ? "background:#555; color:#888; cursor:not-allowed; box-shadow:none;"
        : "";
      const btnAction = isOut ? "" : `onclick="addToCart(${p.id})"`;
      return `
    <div class="product-card" ${isOut ? 'style="opacity:0.7; filter:grayscale(0.5);"' : ""}>
        <button class="fav-btn ${favorites.includes(p.id) ? "active" : ""}" onclick="toggleFavorite(event, ${p.id})"><i class="${favorites.includes(p.id) ? "fas" : "far"} fa-heart"></i></button>
        <div class="product-icon" onclick="openProductDetail(${p.id})">${p.icon}</div>
        <h3 onclick="openProductDetail(${p.id})">${p.name}</h3>
        <span style="font-size:0.8rem;background:var(--bg);padding:3px 8px;border-radius:10px;">${p.category}</span>
        <div class="stars-display">${getStarsHTML(p.rating || 0)}</div>
        <p style="font-weight:bold;font-size:1.2rem;color:var(--secondary);margin-bottom:15px;">${p.price.toLocaleString("tr-TR")} TL</p>
        <button class="quick-view-btn" onclick="openProductDetail(${p.id})"><i class="fas fa-search-plus"></i> Hızlı Bakış</button>
        <button class="btn-pay" style="width:100%; transition:0.3s; ${btnStyle}" ${btnAction}>${btnText}</button>
    </div>`;
    })
    .join("");
};

// ==========================================
// 💬 DETAYLAR, YORUMLAR VE FAVORİLER (SQL)
// ==========================================
const loadFavorites = async () => {
  if (!user) {
    favorites = [];
    return updateUI();
  }
  try {
    const res = await fetch(`http://localhost:3000/api/favorites/${user}`);
    if (res.ok) {
      favorites = await res.json();
      updateUI();
      filterProducts();
    }
  } catch (err) {
    console.error(err);
  }
};

const toggleFavorite = async (e, id) => {
  e.stopPropagation();
  if (!user)
    return showToast("İstek listesi için siber-ağa giriş yapmalısın!", "error");
  try {
    const res = await fetch("http://localhost:3000/api/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, product_id: id }),
    });
    const data = await res.json();
    if (data.status === "added") {
      favorites.push(id);
      showToast("İstek Listesine Eklendi!", "success");
    } else if (data.status === "removed") {
      favorites = favorites.filter((favId) => favId !== id);
      showToast("Listeden Çıkarıldı", "error");
    }
    updateUI();
    filterProducts();
  } catch (err) {
    showToast("Bağlantı Hatası!", "error");
  }
};

const openFavorites = () => {
  const l = document.getElementById("favorites-list");
  const f = products.filter((p) => favorites.includes(p.id));
  if (f.length === 0) l.innerHTML = "<p>İstek listen boş.</p>";
  else
    l.innerHTML = f
      .map(
        (p) =>
          `<div class="cart-item"><span>${p.icon} ${p.name}</span><button class="btn-pay" onclick="addToCart(${p.id})">Ekle</button></div>`,
      )
      .join("");
  openModal("favorites-modal");
};

const openProductDetail = (id) => {
  const p = products.find((x) => x.id === id);
  activeProductId = id;
  const c = [
    { n: "Buz Mavisi", h: "#00d4ff" },
    { n: "Ateş", h: "#ff4d00" },
    { n: "Zehir", h: "#39ff14" },
  ];
  selectedProductColor = c[0];
  const isOut = p.stock <= 0;
  const btnText = isOut ? "TÜKENDİ" : "Sepete Ekle";
  const btnAction = isOut
    ? ""
    : `onclick="addToCart(${p.id});closeModal('product-detail-modal');"`;
  const btnStyle = isOut
    ? "background:#555; color:#888; cursor:not-allowed;"
    : "";
  document.getElementById("product-detail-content").innerHTML =
    `<div style="display:flex;gap:20px;align-items:center;margin-bottom:15px;"><div id="detail-icon" style="font-size:5rem;text-shadow:0 0 30px ${selectedProductColor.h};">${p.icon}</div><div><h2>${p.name}</h2><p style="color:var(--secondary);font-size:1.5rem;font-weight:bold;">${p.price.toLocaleString("tr-TR")} TL</p><div class="color-picker">${c.map((x, i) => `<div class="color-option ${i === 0 ? "active" : ""}" style="background:${x.h};" onclick="selectColor(this,'${x.h}','${x.n}')"></div>`).join("")}</div></div></div><p>${p.desc}</p><button class="btn-pay" style="width:100%;margin-top:10px;${btnStyle}" ${btnAction}>${btnText}</button>`;
  renderComments();
  openModal("product-detail-modal");
};
const selectColor = (e, h, n) => {
  selectedProductColor = { h, n };
  document.querySelectorAll(".color-option").forEach((el) => {
    el.classList.remove("active");
    el.style.borderColor = "transparent";
  });
  e.classList.add("active");
  e.style.borderColor = "white";
  document.getElementById("detail-icon").style.textShadow = `0 0 30px ${h}`;
};
window.updateStarUI = (rating) => {
  currentSelectedRating = rating;
  const container = document.querySelector(".star-selector");
  if (container) {
    container.innerHTML = [1, 2, 3, 4, 5]
      .map(
        (i) =>
          `<i class="${i <= rating ? "fas" : "far"} fa-star" style="color:#ffd700; cursor:pointer; font-size:1.3rem; margin-right:5px; text-shadow:0 0 10px #ffd700;" onclick="updateStarUI(${i})"></i>`,
      )
      .join("");
  }
};

const renderComments = async () => {
  const l = document.getElementById("comments-list");
  document.querySelector(".add-comment").innerHTML =
    `<div class="star-selector" style="margin-bottom:10px;"></div><div style="display:flex;gap:10px;"><input type="text" id="comment-input" placeholder="Siber-ağa mesaj bırak..." style="flex:1; padding:10px; background:#111; color:white; border:1px solid var(--border);"><button class="btn-pay" onclick="addComment()">Gönder</button></div>`;
  updateStarUI(5);
  l.innerHTML =
    "<p style='color:var(--secondary);'>Matrix'ten veriler çekiliyor...</p>";
  try {
    const res = await fetch(
      `http://localhost:3000/api/comments/${activeProductId}`,
    );
    if (!res.ok) throw new Error("Bağlantı Hatası");
    const comments = await res.json();
    if (comments.length > 0) {
      l.innerHTML = comments
        .map(
          (c) =>
            `<div style="background:#0a0a0a; padding:12px; margin-bottom:10px; border-radius:5px; border-left:3px solid var(--secondary); box-shadow:0 4px 6px rgba(0,0,0,0.5);"><div style="display:flex; justify-content:space-between; margin-bottom:8px;"><b style="color:var(--secondary); font-family:monospace;">@${c.username}</b><span style="font-size:0.85rem;">${getStarsHTML(c.rating)}</span></div><div style="color:#ccc; font-size:0.95rem;">${c.comment_text}</div></div>`,
        )
        .join("");
    } else
      l.innerHTML = "<p style='color:#777;'>Henüz yorum yok. İlk sen ol!</p>";
  } catch (err) {
    l.innerHTML =
      "<p style='color:#ff4d00;'>Yorumlar yüklenirken siber-hata oluştu.</p>";
  }
};

const addComment = async () => {
  if (!user)
    return showToast("Yorum yapmak için siber-ağa giriş yapmalısın!", "error");
  const text = document.getElementById("comment-input").value.trim();
  if (!text) return showToast("Boş yorum gönderilemez!", "error");
  try {
    const res = await fetch("http://localhost:3000/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: activeProductId,
        username: user,
        text: text,
        rating: currentSelectedRating,
      }),
    });
    if (res.ok) {
      showToast("Yorum Matrix'e işlendi!", "success");
      renderComments();
      fetch("http://localhost:3000/api/products")
        .then((r) => r.json())
        .then((data) => {
          products = data.map((p) => ({
            ...p,
            desc: p.description,
            best_seller: p.best_seller === true || p.best_seller === 1,
            stock: p.stock !== undefined ? p.stock : 10,
          }));
          filterProducts();
        });
    } else showToast("Yorum eklenemedi!", "error");
  } catch (err) {
    showToast("Bağlantı Hatası!", "error");
  }
};

// ==========================================
// 🔓 GERÇEK AUTH (DETAYLI KAYIT VE GİRİŞ)
// ==========================================
let currentAuthMode = "login";
const openAuthModal = (m) => {
  currentAuthMode = m;
  document.getElementById("auth-title").innerText =
    m === "login" ? "Giriş" : "Kayıt";
  document.getElementById("auth-action-btn").innerText =
    m === "login" ? "Giriş" : "Kayıt";
  let extraFields = document.getElementById("auth-extra-fields");
  if (!extraFields) {
    const passInput = document.getElementById("auth-password");
    extraFields = document.createElement("div");
    extraFields.id = "auth-extra-fields";
    passInput.parentNode.insertBefore(extraFields, passInput.nextSibling);
  }
  if (m === "register") {
    extraFields.innerHTML = `
            <input type="text" id="auth-firstname" placeholder="İsim" style="width:100%; margin-top:10px; padding:10px; background:#111; color:white; border:1px solid var(--border);">
            <input type="text" id="auth-lastname" placeholder="Soyisim" style="width:100%; margin-top:10px; padding:10px; background:#111; color:white; border:1px solid var(--border);">
            <select id="auth-gender" style="width:100%; margin-top:10px; padding:10px; background:#111; color:white; border:1px solid var(--border);">
                <option value="Belirtilmemiş" disabled selected>Cinsiyet Seç</option><option value="Erkek">Erkek</option><option value="Kadın">Kadın</option><option value="Siber-Savaşçı">Siber-Savaşçı</option>
            </select>
            <input type="text" id="auth-phone" placeholder="Telefon (Örn: 0555...)" style="width:100%; margin-top:10px; padding:10px; background:#111; color:white; border:1px solid var(--border);">`;
    extraFields.style.display = "block";
  } else extraFields.style.display = "none";
  openModal("auth-modal");
};
const switchAuthTab = (m) => openAuthModal(m);

const handleAuth = async () => {
  const u = document.getElementById("auth-username").value.trim(),
    p = document.getElementById("auth-password").value.trim();
  if (!u || !p) return showToast("Kullanıcı adı ve şifre zorunlu!", "error");
  if (currentAuthMode === "register") {
    const fn = document.getElementById("auth-firstname").value.trim(),
      ln = document.getElementById("auth-lastname").value.trim(),
      g = document.getElementById("auth-gender").value,
      ph = document.getElementById("auth-phone").value.trim();
    if (!fn || !ln || !ph || g === "Belirtilmemiş")
      return showToast("Tüm kayıt bilgilerini eksiksiz doldur!", "error");
    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: u,
          password: p,
          firstName: fn,
          lastName: ln,
          gender: g,
          phone: ph,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        switchAuthTab("login");
      } else showToast(data.error, "error");
    } catch (err) {
      showToast("Veritabanına ulaşılamadı!", "error");
    }
  } else {
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("username", u);
        user = u;
        closeModal("auth-modal");
        updateUI();
        loadFavorites();
        showToast(data.message, "success");
      } else showToast(data.error, "error");
    } catch (err) {
      showToast("Veritabanına ulaşılamadı!", "error");
    }
  }
};
const logout = () => {
  localStorage.removeItem("username");
  location.reload();
};

// ==========================================
// 👤 TAM EKRAN (SPA) SİBER-KİMLİK PROFİLİ
// ==========================================
const openProfilePage = async () => {
  if (!user) return;
  try {
    const res = await fetch(`http://localhost:3000/api/user/${user}`);
    if (!res.ok) throw new Error("Veri çekilemedi");
    const { user: userData, orders } = await res.json();

    let profilePage = document.getElementById("profile-page-container");
    if (!profilePage) {
      profilePage = document.createElement("div");
      profilePage.id = "profile-page-container";
      profilePage.style.cssText =
        "position:fixed; top:0; left:0; width:100%; height:100vh; background:var(--bg); z-index:99999; padding:5% 10%; overflow-y:auto; color:white; display:none;";
      document.body.appendChild(profilePage);
    }

    const ordersHTML =
      orders.length > 0
        ? orders
            .map(
              (o) =>
                `<div style="background:#111; padding:20px; border-left:4px solid var(--secondary); margin-bottom:15px; border-radius:8px;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;"><h4 style="color:var(--secondary); margin:0; font-family:monospace; font-size:1.2rem;">${o.order_code}</h4><span style="background:#333; padding:5px 10px; border-radius:20px; font-size:0.85rem; color:#00d4ff;">Teslim Edildi</span></div><p style="font-size:0.9rem; color:#aaa; margin-bottom:10px;">Tarih: ${new Date(o.order_date).toLocaleString("tr-TR")}</p><p style="font-weight:bold; font-size:1.3rem; color:white;">Toplam: ${o.total_price.toLocaleString("tr-TR")} TL</p></div>`,
            )
            .join("")
        : "<div style='text-align:center; padding:50px; background:#111; border-radius:10px;'><p style='color:#888;'>Henüz hiç ganimet sipariş etmedin.</p></div>";

    profilePage.innerHTML = `
            <button class="btn-outline" onclick="closeProfilePage()" style="margin-bottom:30px; border-color:#ff4d00; color:#ff4d00; padding:10px 20px; font-weight:bold;"> MAĞAZAYA DÖN</button>
            <div style="display:flex; gap:30px; flex-wrap:wrap; align-items:flex-start;">
                <div style="flex:1; min-width:300px; background:#0a0a0a; padding:40px; border-radius:15px; border:1px solid #00d4ff;">
                    <h2 style="font-family:monospace; color:#00d4ff; margin-bottom:30px; border-bottom:1px solid #333; padding-bottom:15px;">SİBER-KİMLİK VERİLERİ</h2>
                    <div style="text-align:center; margin-bottom:30px;"><img src="https://ui-avatars.com/api/?name=${userData.first_name}+${userData.last_name}&background=00d4ff&color=fff&size=120" style="border-radius:50%; border:4px solid #00d4ff;"><h3 style="margin-top:15px; font-size:1.8rem; letter-spacing:2px;">@${userData.username}</h3></div>
                    <div style="font-size:1.1rem; line-height:2;">
                        <p style="border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:10px;"><b style="color:#888; display:inline-block; width:100px;">İSİM:</b> <span style="color:white;">${userData.first_name}</span></p><p style="border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:10px;"><b style="color:#888; display:inline-block; width:100px;">SOYİSİM:</b> <span style="color:white;">${userData.last_name}</span></p><p style="border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:10px;"><b style="color:#888; display:inline-block; width:100px;">CİNSİYET:</b> <span style="color:white;">${userData.gender || "Bilinmiyor"}</span></p><p style="border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:10px;"><b style="color:#888; display:inline-block; width:100px;">İLETİŞİM:</b> <span style="color:white;">${userData.phone}</span></p>
                    </div>
                </div>
                <div style="flex:2; min-width:300px; background:#0a0a0a; padding:40px; border-radius:15px; border:1px solid #ff4d00;">
                    <h2 style="font-family:monospace; color:#ff4d00; margin-bottom:30px; border-bottom:1px solid #333; padding-bottom:15px;">GEÇMİŞ OPRERASYONLAR</h2>
                    <div style="max-height: 600px; overflow-y: auto; padding-right:15px;">${ordersHTML}</div>
                </div>
            </div>`;

    profilePage.style.display = "block"; // Animasyon kaldırıldı, direkt açılıyor
    document.body.style.overflow = "hidden";
  } catch (err) {
    showToast("Siber-Kimlik Yüklenemedi!", "error");
  }
};
window.closeProfilePage = () => {
  const profilePage = document.getElementById("profile-page-container");
  if (profilePage) {
    profilePage.style.display = "none";
    document.body.style.overflow = "auto";
  }
};

// ==========================================
// 🛒 SEPET VE STOK KONTROLLÜ CHECKOUT
// ==========================================
const toggleCart = (s) => {
  document.getElementById("cart-offcanvas").classList.toggle("open", s);
  document.getElementById("cart-overlay").classList.toggle("open", s);
};
const applyPromoCode = () => {
  const i = document
    .getElementById("promo-code-input")
    .value.trim()
    .toUpperCase();
  const m = document.getElementById("promo-message");
  if (validPromoCodes[i]) {
    activePromo = { code: i, ...validPromoCodes[i] };
    m.innerHTML = `<span style="color:#4caf50;">${i} uygulandı!</span>`;
    showToast("Uygulandı!", "success");
    updateUI();
  } else {
    m.innerHTML = `<span style="color:#ff4d00;">Geçersiz kod.</span>`;
    activePromo = null;
    updateUI();
  }
};

const addToCart = (id) => {
  const p = products.find((x) => x.id === id);
  const cn = selectedProductColor ? selectedProductColor.n : "Buz Mavisi";
  const cid = `${id}-${cn}`;
  const i = cart.find((x) => x.cartItemId === cid);
  if (i) {
    if (i.quantity >= p.stock)
      return showToast(`Stok yetersiz! (Maks: ${p.stock})`, "error");
    i.quantity++;
  } else {
    if (p.stock <= 0) return showToast("Bu ürün tükendi!", "error");
    cart.push({ cartItemId: cid, product: p, quantity: 1, color: cn });
  }
  playSFX("coin");
  showToast("Sepete eklendi!", "success");
  toggleCart(true);
  saveAndUpdate();
};
const changeQuantity = (cid, c) => {
  const i = cart.find((x) => x.cartItemId === cid);
  if (i) {
    const p = products.find((prod) => prod.id === i.product.id);
    if (c > 0 && i.quantity >= p.stock)
      return showToast(`Stok yetersiz! (Maks: ${p.stock})`, "error");
    i.quantity += c;
    if (i.quantity < 1) cart = cart.filter((x) => x.cartItemId !== cid);
    saveAndUpdate();
  }
};
const saveAndUpdate = () => {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateUI();
};

const updateUI = () => {
  document.getElementById("cart-count").innerText = cart.reduce(
    (s, i) => s + i.quantity,
    0,
  );
  document.getElementById("fav-count").innerText = favorites.length;
  const d = document.getElementById("cart-items");
  d.innerHTML = cart.length
    ? cart
        .map(
          (i) =>
            `<div class="cart-item"><span>${i.product.icon} <b>${i.product.name}</b> (${i.color})</span><div class="quantity-controls"><button class="qty-btn" onclick="changeQuantity('${i.cartItemId}',-1)">-</button> ${i.quantity} <button class="qty-btn" onclick="changeQuantity('${i.cartItemId}',1)">+</button></div><b>${(i.product.price * i.quantity).toLocaleString("tr-TR")} TL</b></div>`,
        )
        .join("")
    : "Sepet boş.";
  const sub = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  let dis = 0;
  if (activePromo && sub > 0)
    dis =
      activePromo.type === "percent"
        ? sub * (activePromo.value / 100)
        : activePromo.value;
  document.getElementById("total-price").innerText = (sub - dis).toLocaleString(
    "tr-TR",
  );
  if (user)
    document.getElementById("auth-section").innerHTML =
      `<button class="btn-outline" style="color:var(--secondary); border-color:var(--secondary);" onclick="openProfilePage()"> @${user}</button><button class="btn-outline" onclick="logout()">Çıkış</button>`;
  else
    document.getElementById("auth-section").innerHTML =
      `<button class="btn-outline" onclick="openAuthModal('login')">Giriş Yap</button>`;
};

const proceedToPayment = () => {
  if (cart.length === 0) return showToast("Sepet boş!", "error");
  toggleCart(false);
  openModal("payment-modal");
};
const completeOrder = async () => {
  if (!user)
    return showToast("Sipariş vermek için ağa bağlanmalısın!", "error");
  if (cart.length === 0) return showToast("Sepet boş!", "error");
  const totalStr = document
    .getElementById("total-price")
    .innerText.replace(/,/g, "")
    .replace(/\./g, "");
  const totalNum = parseInt(totalStr);
  try {
    const res = await fetch("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user,
        cartItems: cart,
        total: totalNum,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      unlockAchievement("first_blood");
      showToast(data.message, "success");
      cart = [];
      activePromo = null;
      saveAndUpdate();
      closeModal("payment-modal");
      setTimeout(() => location.reload(), 2000);
    } else showToast(data.error, "error");
  } catch (err) {
    showToast("Bağlantı Hatası!", "error");
  }
};

// ==========================================
// MODALLAR VE OYUNLAR (Animasyonsuz)
// ==========================================
const openModal = (id) => {
  const m = document.getElementById(id);
  m.style.display = "block";
  playSFX("slash");
};
const closeModal = (id) => {
  const m = document.getElementById(id);
  if (m) m.style.display = "none";
};
window.onclick = (e) => {
  if (e.target.classList.contains("modal")) closeModal(e.target.id);
};

let keySequence = [];
document.addEventListener("keydown", (e) => {
  keySequence.push(e.key);
  keySequence = keySequence.slice(-6);
  if (
    JSON.stringify(keySequence) ===
    JSON.stringify([
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
    ])
  ) {
    openModal("easter-egg-modal");
    unlockAchievement("secret");
  }
});
const unlockJohtoSecret = () => {
  if (isJohtoUnlocked) return;
  isJohtoUnlocked = true;
  document.body.style.background = "#4a0000";
  showToast("Johto uyandı!", "success");
  const btn = document.createElement("button");
  btn.className = "filter-btn";
  btn.innerHTML = "Johto 🔥";
  btn.onclick = () => setCategory("Johto Efsaneleri");
  document.getElementById("category-filters").appendChild(btn);
  setCategory("Johto Efsaneleri");
};
const unlockMatrixSecret = () => {
  if (isMatrixUnlocked) return;
  isMatrixUnlocked = true;
  document.documentElement.setAttribute("data-theme", "dark");
  document.body.style.background = "#000";
  showToast("HACKLENDİ", "success");
  const btn = document.createElement("button");
  btn.className = "filter-btn";
  btn.innerHTML = "KARABORSA 💻";
  btn.onclick = () => setCategory("Karaborsa");
  document.getElementById("category-filters").appendChild(btn);
  setCategory("Karaborsa");
};

let isJumping = false,
  gameScore = 0,
  gameInterval;
const openDungeon = () => {
  document.getElementById("game-area").innerHTML =
    `<div id="game-player" style="position:absolute; bottom:0; left:50px; font-size:3rem; transition:bottom 0.3s;">🤺</div><div id="game-obstacle" style="position:absolute; bottom:0; right:-50px; font-size:3rem;">🐉</div>`;
  openModal("dungeon-modal");
  startDungeonGame();
};
const closeDungeon = () => {
  closeModal("dungeon-modal");
  clearInterval(gameInterval);
};
const startDungeonGame = () => {
  gameScore = 0;
  document.getElementById("game-score").innerText = gameScore;
  document.getElementById("game-over-msg").style.display = "none";
  const o = document.getElementById("game-obstacle");
  o.style.animationDuration = "1.5s";
  o.classList.add("obstacle-animate");
  clearInterval(gameInterval);
  gameInterval = setInterval(checkCol, 50);
};
const jumpDino = () => {
  const p = document.getElementById("game-player");
  if (!p || isJumping) return;
  isJumping = true;
  p.classList.add("player-jump");
  if (
    document.getElementById("game-over-msg").style.display === "block" &&
    document.getElementById("game-over-msg").style.color === "rgb(255, 77, 77)"
  )
    startDungeonGame();
  setTimeout(() => {
    if (p) p.classList.remove("player-jump");
    isJumping = false;
    if (document.getElementById("game-over-msg").style.display === "none") {
      gameScore += 10;
      document.getElementById("game-score").innerText = gameScore;
      const o = document.getElementById("game-obstacle");
      let s = parseFloat(window.getComputedStyle(o).animationDuration);
      if (s > 0.8) o.style.animationDuration = s - 0.05 + "s";
      if (gameScore >= 50) winDungeon();
    }
  }, 300);
};
document.addEventListener("keydown", (e) => {
  if (
    e.code === "Space" &&
    document.getElementById("dungeon-modal").style.display === "block"
  ) {
    e.preventDefault();
    jumpDino();
  }
});
const checkCol = () => {
  const p = document.getElementById("game-player"),
    o = document.getElementById("game-obstacle");
  if (!p || !o) return;
  const pr = p.getBoundingClientRect(),
    or = o.getBoundingClientRect();
  if (
    or.left < pr.right - 15 &&
    or.right > pr.left + 15 &&
    pr.bottom > or.top + 10
  ) {
    o.classList.remove("obstacle-animate");
    clearInterval(gameInterval);
    document.getElementById("game-over-msg").style.display = "block";
    document.getElementById("game-over-msg").style.color = "#ff4d4d";
  }
};
const winDungeon = () => {
  clearInterval(gameInterval);
  document.getElementById("game-obstacle").classList.remove("obstacle-animate");
  document.getElementById("game-area").innerHTML = "🏆";
  document.getElementById("game-over-msg").style.display = "block";
  document.getElementById("game-over-msg").style.color = "#4caf50";
  document.getElementById("game-over-msg").innerHTML =
    "Kazandın! Kod: ZINDAN50";
};

// Müzik ve Tema Motoru Korundu
let isMusicPlaying = false,
  dBGM = new Audio(
    "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
  ),
  nBGM = new Audio(
    "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b8f72df5.mp3",
  );
dBGM.loop = true;
nBGM.loop = true;
dBGM.volume = 0.2;
nBGM.volume = 0.2;
let cBGM = null;
const checkTimeAndSetTheme = () => {
  const h = new Date().getHours(),
    ht = document.documentElement,
    i = document.querySelector("#theme-toggle i");
  if (h >= 6 && h < 20) {
    ht.setAttribute("data-theme", "light");
    if (i) i.className = "fas fa-sun";
    cBGM = dBGM;
  } else {
    ht.setAttribute("data-theme", "dark");
    if (i) i.className = "fas fa-moon";
    cBGM = nBGM;
  }
};
const toggleBGM = () => {
  const b = document.getElementById("bgm-toggle"),
    i = b.querySelector("i");
  if (isMusicPlaying) {
    if (cBGM) cBGM.pause();
    i.className = "fas fa-volume-mute";
    b.classList.remove("playing");
    isMusicPlaying = false;
  } else {
    const t = document.documentElement.getAttribute("data-theme");
    cBGM = t === "light" ? dBGM : nBGM;
    cBGM.play().catch(() => {});
    i.className = "fas fa-volume-up";
    b.classList.add("playing");
    isMusicPlaying = true;
  }
};
document.getElementById("theme-toggle").onclick = () => {
  const t =
    document.documentElement.getAttribute("data-theme") === "light"
      ? "dark"
      : "light";
  document.documentElement.setAttribute("data-theme", t);
  const i = document.querySelector("#theme-toggle i");
  if (i) i.className = t === "light" ? "fas fa-sun" : "fas fa-moon";
  if (isMusicPlaying) {
    if (cBGM) cBGM.pause();
    cBGM = t === "light" ? dBGM : nBGM;
    cBGM.play();
  }
};
