import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, limit, query, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const USUARIO_INSTAGRAM = "rccamis";


// Lista de todas las colecciones que existen en tu base de datos
const todasLasColecciones = [
    'laliga', 'premier', 'retro', 'national_teams', 'seriea', 
    'bundesliga', 'ligue1', 'long_sleeve', 'brasileiro', 
    'argentina', 'mls', 'ligamx'
];

window.buscarEnTodoElCatalogo = async function(query) {
    const queryMin = query.toLowerCase();
    let resultadosGlobales = [];

    // 1. Preparamos la interfaz (Ocultar inicio, mostrar catálogo)
    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('catalog-view').classList.remove('hidden');
    
    // Cambiamos el título para que el usuario sepa qué está viendo
    const tituloCatalogo = document.getElementById('category-title');
    if (tituloCatalogo) {
        tituloCatalogo.innerHTML = `Resultados para: "<span class="text-rose-600">${query}</span>"`;
    }

    // Ponemos un loader en la cuadrícula de productos
    const grid = document.getElementById('products-grid'); // ⚠️ Asegúrate de que este es el ID de tu cuadrícula
    if (grid) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <span class="material-icons animate-spin text-5xl text-rose-600">refresh</span>
                <p class="mt-4 text-slate-500 font-semibold">Buscando en todas las ligas...</p>
            </div>
        `;
    }

    // Hacemos scroll hacia los resultados
    document.getElementById('catalog-view').scrollIntoView({ behavior: 'smooth' });

    try {
        // 2. MAGIA: Buscamos en todas las colecciones a la vez
        for (const coleccionName of todasLasColecciones) {
            const snapshot = await getDocs(collection(db, coleccionName));
            snapshot.forEach(doc => {
                const data = doc.data();
                // Si el nombre de la camiseta incluye lo que el usuario ha buscado
                if (data.name && data.name.toLowerCase().includes(queryMin)) {
                    resultadosGlobales.push({ 
                        id: doc.id, 
                        ...data, 
                        coleccionOrigen: coleccionName // Guardamos de qué liga viene por si hace falta
                    });
                }
            });
        }

        // 3. Renderizamos los resultados
        if (resultadosGlobales.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <span class="material-icons text-6xl text-slate-300">search_off</span>
                    <h3 class="text-xl font-bold text-slate-700 mt-4">No se encontraron resultados</h3>
                    <p class="text-slate-500 mt-2">No tenemos ninguna camiseta que coincida con "${query}".</p>
                </div>
            `;
            return;
        }

        // ⚠️ ATENCIÓN AQUÍ ⚠️
        // Necesitas pasar 'resultadosGlobales' a la función que dibuja las tarjetas de producto.
        // Sustituye 'renderizarProductos' por el nombre real de tu función (ej: renderProducts, drawGrid, etc.)
        // O si no tienes una función separada, tendrás que copiar aquí el bucle que crea el HTML de las tarjetas.
        
        renderizarProductos(resultadosGlobales); 

    } catch (error) {
        console.error("Error en la búsqueda global:", error);
        grid.innerHTML = '<p class="col-span-full text-center py-10 text-red-500 font-bold">Ocurrió un error al buscar. Por favor, inténtalo de nuevo.</p>';
    }
};

    const firebaseConfig = {
        apiKey: "AIzaSyDCxD-IVLjXcQT1LzfLVqy7nPpTZvwEqNnw",
        authDomain: "rccamis-store.firebaseapp.com",
        projectId: "rccamis-store",
        storageBucket: "rccamis-store.appspot.com", 
        messagingSenderId: "1036696205279",
        appId: "1:1036696205279:web:4bf61aa2503a41a6c5366a"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

// ==========================================
        // MOTOR DE BÚSQUEDA GLOBAL (TODAS LAS LIGAS)
        // ==========================================
        window.buscarEnTodoElCatalogo = async function(query) {
            const todasLasColecciones = [
                'laliga', 'premier', 'retro', 'national_teams', 'seriea', 
                'bundesliga', 'ligue1', 'long_sleeve', 'brasileiro', 
                'argentina', 'mls', 'ligamx'
            ];
            
            const queryMin = query.toLowerCase();
            let resultadosGlobales = [];

            // 1. Preparar la vista
            const homeView = document.getElementById('home-view');
            const catalogView = document.getElementById('catalog-view');
            const productDetailView = document.getElementById('product-detail-view');
            
            if(homeView) homeView.classList.add('hidden');
            if(productDetailView) productDetailView.classList.add('hidden');
            if(catalogView) catalogView.classList.remove('hidden');
            
            // 2. Título y Cargando
            const sectionTitle = document.getElementById('section-title');
            const grid = document.getElementById('products-grid');
            
            if(sectionTitle) sectionTitle.innerHTML = `Resultados para: "<span class="text-rose-600">${query}</span>"`;
            if(grid) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-20">
                        <span class="material-icons animate-spin text-5xl text-rose-600">refresh</span>
                        <p class="mt-4 text-slate-500 font-semibold">Buscando en todas las ligas...</p>
                    </div>
                `;
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });

            try {
                // 3. Consultar todas las colecciones
                for (const colName of todasLasColecciones) {
                    const querySnapshot = await getDocs(collection(db, colName));
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.name && data.name.toLowerCase().includes(queryMin)) {
                            resultadosGlobales.push({ id: doc.id, ...data });
                        }
                    });
                }

                // 4. Mostrar resultados o mensaje de vacío
                if (resultadosGlobales.length === 0) {
                    grid.innerHTML = `<div class="col-span-full text-center py-20 text-slate-500">No se encontraron camisetas con ese nombre.</div>`;
                    return;
                }

                let html = '';
                resultadosGlobales.forEach(prod => {
                    const precio = prod.price || 30;
                    const imagen = prod.image || '';
                    const nombreLimpio = prod.name.replace(/'/g, "\\'");

                    html += `
                    <div onclick="showProductDetail('${prod.id}', '${nombreLimpio}', ${precio}, '${imagen}')" 
                         class="group bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:shadow-xl transition-all flex flex-col">
                        <div class="aspect-square rounded-xl overflow-hidden mb-3 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                            <img src="${imagen}" class="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500">
                        </div>
                        <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 mb-2 flex-1">${prod.name}</h3>
                        <div class="flex items-end gap-2">
                            <span class="text-xl font-black text-slate-900 dark:text-white">${precio}€</span>
                        </div>
                    </div>`;
                });
                
                grid.innerHTML = html;
                
                // Ocultar botón de "Cargar más" si existe
                const btnContainer = document.getElementById('btn-container');
                if(btnContainer) btnContainer.classList.add('hidden');

            } catch (error) {
                console.error("Error en búsqueda:", error);
                grid.innerHTML = `<div class="col-span-full text-center text-red-500">Error al conectar con la base de datos.</div>`;
            }
        };
    let allProducts = []; 
    let allLongSleeveProducts = []; 
    window.filteredDisplayProducts = []; 
    
    let currentLimitCount = 20; 
    let currentCollectionID = 'laliga'; 
    let currentProduct = null;
    let currentSelection = { size: null, manga: 'Corta', mangaPrice: 0, version: 'Aficionado', versionPrice: 0, basePrice: 0, patchPrice: 0 };
    
    window.isDiscountApplied = false;

    const categories = [
        { id: 'laliga', label: '🇪🇸 LALIGA' },
        { id: 'premier', label: '🇬🇧 PREMIER' },
        { id: 'retro', label: '🕰️ RETRO' },
        { id: 'national_teams', label: '🌍 SELECCIONES' },
        { id: 'seriea', label: '🇮🇹 SERIE A' },
        { id: 'bundesliga', label: '🇩🇪 BUNDESLIGA' },
        { id: 'ligue1', label: '🇫🇷 LIGUE 1' },
        { id: 'brasileiro', label: '🇧🇷 BRASIL' },
        { id: 'argentina', label: '🇦🇷 ARGENTINA' },
        { id: 'mls', label: '🇺🇸 MLS' },
        { id: 'ligamx', label: '🇲🇽 MÉXICO' },
        { id: 'long_sleeve', label: '🧥 M. LARGA' }
    ];

    // 🔴🔴 ESTA ES LA FUNCIÓN NUEVA DE LIMPIEZA TOTAL 🔴🔴
    function obtenerNombreBaseLimpio(nombre) {
        if (!nombre) return "";
        return nombre.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quita tildes
            // Borra cualquier palabra clave (incluida la palabra "version" suelta)
            .replace(/\b(version|fan|aficionado|jugador|player|manga|larga|corta|long|short|sleeve)\b/ig, '')
            .replace(/[^a-z0-9]/ig, ' ') // Quita barras, guiones, etc.
            .replace(/\s+/g, ' ') // Quita espacios dobles
            .trim();
    }

    // Usamos esto para que el título se vea bonito (sin estropear la búsqueda interna)
    function limpiarTituloFeo(tituloBruto) {
        if (!tituloBruto) return "";
        return tituloBruto
            .replace(/Camiseta (del |de )?/ig, '') 
            .replace(/version fan|fan version|version aficionado/ig, '') 
            .replace(/version jugador|player version/ig, '') 
            .replace(/version /ig, '') 
            .replace(/\s+/g, ' ')
            .trim();
    }

    window.preCargarMangaLarga = async function() {
        try {
            const cacheKey = 'rc_cache_long_sleeve';
            const timeKey = 'rc_time_long_sleeve';
            const cachedData = localStorage.getItem(cacheKey);
            const cacheTime = localStorage.getItem(timeKey);
            const now = Date.now();
            
            const horasValidez = 0; 

            if (cachedData && cacheTime && (now - cacheTime < horasValidez)) {
                allLongSleeveProducts = JSON.parse(cachedData);
            } else {
                const q = query(collection(db, 'long_sleeve'), limit(1000));
                const snap = await getDocs(q);
                allLongSleeveProducts = [];
                snap.forEach(doc => allLongSleeveProducts.push({ ...doc.data(), id: doc.id }));
                localStorage.setItem(cacheKey, JSON.stringify(allLongSleeveProducts));
                localStorage.setItem(timeKey, now.toString());
            }
        } catch(e) { console.error("Error pre-cargando manga larga", e); }
    }
    preCargarMangaLarga();

    window.showToast = function(message, isError = false) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `px-4 py-3 rounded-lg shadow-xl text-sm font-bold text-white flex items-center gap-2 toast-slide-up ${isError ? 'bg-red-500' : 'bg-slate-800 dark:bg-slate-700 border border-slate-600'}`;
        toast.innerHTML = `<span class="material-icons text-sm">${isError ? 'error' : 'check_circle'}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
    }

    window.toggleSizeGuide = function() { document.getElementById('size-guide-modal').classList.toggle('hidden'); }

    window.showHome = function() {
        document.getElementById('home-view').classList.remove('hidden');
        document.getElementById('catalog-view').classList.add('hidden');
        document.getElementById('product-detail-view').classList.add('hidden');
        window.scrollTo(0,0);
        history.pushState({ vista: 'inicio' }, "", window.location.pathname);
    }

    window.showCatalog = async function(collectionId) {
        document.getElementById('home-view').classList.add('hidden');
        document.getElementById('product-detail-view').classList.add('hidden');
        document.getElementById('catalog-view').classList.remove('hidden');
        
        if (currentCollectionID !== collectionId || allProducts.length === 0) {
            currentCollectionID = collectionId;
            document.getElementById('sort-select').value = 'default';
            document.getElementById('search-input').value = '';
            await loadCollectionWithCache(collectionId);
        } else {
            renderNav(); 
        }
        window.scrollTo(0,0);
        history.pushState({ vista: 'catalogo', collection: collectionId }, "", `#catalogo-${collectionId}`);
    }

    window.volverAlCatalogo = function() {
        document.getElementById('product-detail-view').classList.add('hidden');
        document.getElementById('catalog-view').classList.remove('hidden');
        window.scrollTo(0,0);
    }

    window.loadCollectionWithCache = async function(collectionId) {
        const grid = document.getElementById('products-grid');
        const loader = document.getElementById('loader-initial');
        const btnContainer = document.getElementById('btn-container');
        
        grid.innerHTML = '';
        btnContainer.classList.add('hidden');
        loader.classList.remove('hidden');
        currentLimitCount = 20; 

        renderNav();

        const cacheKey = 'rc_cache_' + collectionId;
        const timeKey = 'rc_time_' + collectionId;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(timeKey);
        const now = Date.now();
        
        const horasValidez = 0; 

        if (cachedData && cacheTime && (now - cacheTime < horasValidez)) {
            allProducts = JSON.parse(cachedData);
            aplicarOrdenYRenderizar();
        } else {
            try {
                const q = query(collection(db, collectionId), limit(1000));
                const snap = await getDocs(q);
                
                allProducts = [];
                snap.forEach(doc => {
                    const data = doc.data();
                    
                    const nombre = data.name ? data.name.toLowerCase() : '';
                    const esRetro = collectionId === 'retro' || nombre.includes('retro');
                    
                    let price = parseFloat(data.price) || 25;
                    if (esRetro) {
                        price = 30;
                    }

                    const oldPrice = esRetro ? 100 : 80;
                    
                    allProducts.push({ ...data, id: doc.id, price: price, oldPrice: oldPrice });
                });

                localStorage.setItem(cacheKey, JSON.stringify(allProducts));
                localStorage.setItem(timeKey, now.toString());

                aplicarOrdenYRenderizar();
            } catch (e) {
                console.error(e);
                showToast("Error conectando con la base de datos.", true);
                loader.classList.add('hidden');
            }
        }
    }

    window.aplicarOrdenYRenderizar = function() {
        let baseProducts = allProducts.filter(p => {
            let n = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let isJugador = n.includes('jugador') || n.includes('player');
            let isLarga = n.includes('manga larga') || n.includes('long sleeve');
            return !isJugador && !isLarga;
        });

        const sortValue = document.getElementById('sort-select').value;
        if (sortValue === 'price_asc') baseProducts.sort((a, b) => a.price - b.price);
        else if (sortValue === 'price_desc') baseProducts.sort((a, b) => b.price - a.price);
        else baseProducts.sort((a, b) => 0.5 - Math.random()); 

        window.filteredDisplayProducts = baseProducts;
        document.getElementById('product-count').innerText = baseProducts.length; 
        document.getElementById('loader-initial').classList.add('hidden');
        renderizarVistaActual();
    }

    window.renderizarVistaActual = function() {
        const productosAVisualizar = window.filteredDisplayProducts.slice(0, currentLimitCount);
        renderGrid(productosAVisualizar);

        const btnContainer = document.getElementById('btn-container');
        if (currentLimitCount >= window.filteredDisplayProducts.length) btnContainer.classList.add('hidden');
        else btnContainer.classList.remove('hidden');
    }

    window.cargarMasProductos = function() {
        currentLimitCount += 20;
        renderizarVistaActual();
    }

    document.getElementById('search-input').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const btnContainer = document.getElementById('btn-container');
        
        if(term === "") {
            renderizarVistaActual();
        } else {
            const palabras = term.split(' ').filter(word => word.length > 0);
            const filtrados = window.filteredDisplayProducts.filter(p => {
                const nombreOriginal = p.name.toLowerCase();
                const equipo = p.team ? p.team.toLowerCase() : "";
                return palabras.every(palabra => 
                    nombreOriginal.includes(palabra) || equipo.includes(palabra)
                );
            });
            renderGrid(filtrados);
            btnContainer.classList.add('hidden'); 
        }
    });

    window.applySort = function() {
        currentLimitCount = 20;
        aplicarOrdenYRenderizar();
    }

    function renderNav() {
        const menu = document.getElementById('category-menu');
        menu.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            const isActive = currentCollectionID === cat.id;
            btn.className = `whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border mr-2 ${isActive ? 'bg-slate-900 text-white border-slate-900 shadow-md dark:bg-white dark:text-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`;
            btn.innerText = cat.label;
            btn.onclick = () => showCatalog(cat.id);
            menu.appendChild(btn);
        });
        document.getElementById('section-title').innerHTML = categories.find(c => c.id === currentCollectionID)?.label || "Catálogo";
    }

    function renderGrid(productsList) {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        if(productsList.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center text-slate-400 py-10"><span class="material-icons text-5xl mb-2 opacity-50">search_off</span><p>No se encontró ninguna camiseta.</p></div>';
            return;
        }

        productsList.forEach(p => {
            const imgSrc = p.image || 'https://via.placeholder.com/300x400';
            const card = document.createElement('div');
            card.className = "group cursor-pointer bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 fade-in";
            card.onclick = () => openProduct(p.id);
            card.innerHTML = `
                <div class="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                    <img src="${imgSrc}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    <div class="absolute bottom-2 right-2 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-xs font-bold px-2 py-1 rounded shadow-md border border-slate-200 dark:border-slate-700">
                        <span class="text-[10px] text-slate-400 line-through mr-1">${p.oldPrice}€</span><span class="text-rose-600">${p.price}€</span>
                    </div>
                </div>
                <div class="p-3">
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm leading-tight h-10 line-clamp-2">${limpiarTituloFeo(p.name)}</h3>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    window.openProduct = function(productId, vieneDelBotonAtras = false) {
        currentProduct = allProducts.find(p => p.id === productId);
        if(!currentProduct) return;

        currentSelection = { size: null, manga: 'Corta', mangaPrice: 0, version: 'Aficionado', versionPrice: 0, basePrice: currentProduct.price, patchPrice: 0 };
        
        document.getElementById('custom-name').value = "";
        document.getElementById('custom-number').value = "";
        document.getElementById('patch-select').value = "Ninguno";
        document.getElementById('error-msg').classList.add('hidden');
        document.querySelectorAll('.size-btn, .manga-btn, .version-btn').forEach(b => b.classList.remove('active'));
        
        document.querySelectorAll('.manga-btn')[0].classList.add('active');
        document.querySelectorAll('.version-btn')[0].classList.add('active');

        document.getElementById('detail-image').src = currentProduct.image;
        document.getElementById('detail-title').innerText = limpiarTituloFeo(currentProduct.name);
        
        updatePriceDisplay();

        document.getElementById('catalog-view').classList.add('hidden');
        document.getElementById('product-detail-view').classList.remove('hidden');
        window.scrollTo(0,0);

        if (!vieneDelBotonAtras) {
            history.pushState({ vista: 'producto', id: productId }, "", "#producto");
        }
    }

    // 🔴🔴 ESTA ES LA FUNCIÓN NUEVA QUE CAMBIA LA FOTO 🔴🔴
    window.selectOption = function(type, value, price, btn) {
        if (type === 'version' || type === 'manga') {
            let tempVersion = (type === 'version') ? value : currentSelection.version;
            let tempManga = (type === 'manga') ? value : currentSelection.manga;
            
            let isJugador = (tempVersion === 'Jugador');
            let isMangaLarga = (tempManga === 'Larga');
            
            // Si volvemos a la opción base (Aficionado + Corta)
            if (!isJugador && !isMangaLarga) {
                document.getElementById('detail-image').src = currentProduct.image;
            } 
            // Si buscamos otra versión
            else {
                let baseNameClean = obtenerNombreBaseLimpio(currentProduct.name);
                let isAvailable = false;
                let matchedProduct = null;
                let catalogo = [...allProducts, ...allLongSleeveProducts];
                
                for (let p of catalogo) {
                    let pNameClean = obtenerNombreBaseLimpio(p.name);
                    
                    // REGLA 1: La raíz del nombre tiene que ser idéntica
                    if (baseNameClean !== pNameClean) continue;
                    
                    let pNameRaw = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    let hasJugador = pNameRaw.includes('jugador') || pNameRaw.includes('player');
                    let hasLarga = pNameRaw.includes('manga larga') || pNameRaw.includes('long sleeve');
                    
                    // REGLA 2: Tiene que ser exactamente la combinación que ha pulsado
                    if (isJugador !== hasJugador) continue;
                    if (isMangaLarga !== hasLarga) continue;
                    
                    isAvailable = true;
                    matchedProduct = p; 
                    break;
                }

                if (!isAvailable) {
                    let msg = "❌ Esta camiseta no está disponible en ";
                    if(isJugador && isMangaLarga) msg += "Versión Jugador + Manga Larga.";
                    else if(isJugador) msg += "Versión Jugador.";
                    else if(isMangaLarga) msg += "Manga Larga.";
                    else msg += "esta combinación.";
                    
                    return showToast(msg, true); // Bloqueamos si no existe
                } else {
                    // Si existe, actualizamos la foto con una precisión del 100%
                    document.getElementById('detail-image').src = matchedProduct.image;
                }
            }
        }

        if(type === 'size') {
            currentSelection.size = value;
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('error-msg').classList.add('hidden');
        } else if (type === 'manga') {
            currentSelection.manga = value;
            currentSelection.mangaPrice = price;
            document.querySelectorAll('.manga-btn').forEach(b => b.classList.remove('active'));
        } else if (type === 'version') {
            currentSelection.version = value;
            currentSelection.versionPrice = price;
            document.querySelectorAll('.version-btn').forEach(b => b.classList.remove('active'));
        }
        btn.classList.add('active');
        updatePriceDisplay();
    }

    document.getElementById('patch-select').addEventListener('change', function(e) {
        currentSelection.patchPrice = e.target.value === "Ninguno" ? 0 : 2;
        updatePriceDisplay();
    });

    document.getElementById('custom-name').addEventListener('input', updatePriceDisplay);
    document.getElementById('custom-number').addEventListener('input', updatePriceDisplay);

    function updatePriceDisplay() {
        const hasCustom = document.getElementById('custom-name').value || document.getElementById('custom-number').value;
        const customPrice = hasCustom ? 3 : 0;
        const total = currentSelection.basePrice + currentSelection.mangaPrice + currentSelection.versionPrice + currentSelection.patchPrice + customPrice;
        document.getElementById('detail-price').innerText = total + "€";

        const esRetro = currentCollectionID === 'retro' || (currentProduct && currentProduct.name && currentProduct.name.toLowerCase().includes('retro'));

        let oldPrice = 80; 
        if (esRetro) {
            oldPrice = 100;
        } else if (currentSelection.version === 'Jugador') {
            oldPrice = 90;
        }
        document.getElementById('detail-old-price').innerText = oldPrice + "€";
    }

    window.addToCartCurrentProduct = function() {
        if(!currentSelection.size) {
            document.getElementById('error-msg').classList.remove('hidden');
            return;
        }

        const customName = document.getElementById('custom-name').value.trim().toUpperCase();
        const customNumber = document.getElementById('custom-number').value.trim();
        const customPrice = (customName || customNumber) ? 3 : 0;
        const finalPrice = currentSelection.basePrice + currentSelection.mangaPrice + currentSelection.versionPrice + currentSelection.patchPrice + customPrice;

        const cartItem = {
            ...currentProduct,
            image: document.getElementById('detail-image').src, 
            finalPrice: finalPrice,
            selection: { ...currentSelection, customName, customNumber, patch: document.getElementById('patch-select').value }
        };

        let cart = JSON.parse(localStorage.getItem('rccamis_cart')) || [];
        cart.push(cartItem);
        localStorage.setItem('rccamis_cart', JSON.stringify(cart));
        
        window.updateCartUI();
        showToast("¡Añadido al carrito!");
        volverAlCatalogo(); 
    }

    window.applyDiscountCode = function() {
        const code = document.getElementById('discount-input').value.trim().toUpperCase();
        const msgEl = document.getElementById('discount-msg');
        
        if (code === 'RC24') {
            window.isDiscountApplied = true;
            msgEl.innerText = "¡Código RC24 aplicado! (-5€ por camiseta)";
            msgEl.className = "text-xs font-bold mt-2 text-green-500 block";
            updateCartUI();
        } else {
            window.isDiscountApplied = false;
            msgEl.innerText = "El código introducido no es válido.";
            msgEl.className = "text-xs font-bold mt-2 text-red-500 block";
            updateCartUI();
        }
    }

    window.updateCartUI = function() {
        const cart = JSON.parse(localStorage.getItem('rccamis_cart')) || [];
        document.getElementById('cart-badge').innerText = cart.length;
        document.getElementById('cart-badge').classList.toggle('hidden', cart.length === 0);
        
        const list = document.getElementById('cart-items');
        list.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            list.innerHTML = '<div class="flex flex-col items-center justify-center mt-10 text-slate-400"><span class="material-icons text-4xl mb-2">remove_shopping_cart</span><p>Carrito vacío</p></div>';
            window.isDiscountApplied = false;
            document.getElementById('discount-input').value = "";
            document.getElementById('discount-msg').classList.add('hidden');
        } else {
            cart.forEach((item, index) => {
                subtotal += item.finalPrice;
                let details = `<span class="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs font-bold">Talla ${item.selection.size}</span>`;
                
                if(item.selection.isMysteryBox) {
                    if(item.selection.avoid) details += `<br><span class="text-[10px] text-red-500 font-bold">Evitar: ${item.selection.avoid}</span>`;
                } else {
                    if(item.selection.version === 'Jugador') details += ` <span class="text-xs text-rose-600">+Jugador</span>`;
                    if(item.selection.manga === 'Larga') details += ` <span class="text-xs text-rose-600">+Manga Larga</span>`;
                    if(item.selection.patch !== 'Ninguno') details += `<br><span class="text-[10px] text-slate-500">Parche: ${item.selection.patch}</span>`;
                    if(item.selection.customName) details += `<br><span class="text-[10px] text-slate-500">Dorsal: ${item.selection.customNumber || ''} ${item.selection.customName}</span>`;
                }

                list.innerHTML += `
                    <div class="flex gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                        <img src="${item.image}" class="w-14 h-14 rounded object-cover border dark:border-slate-600">
                        <div class="flex-1 min-w-0">
                            <div class="font-bold text-sm truncate dark:text-white">${limpiarTituloFeo(item.name)}</div>
                            <div class="mt-1 leading-tight">${details}</div>
                        </div>
                        <div class="flex flex-col justify-between items-end">
                            <button onclick="removeItem(${index})" class="text-slate-400 hover:text-red-500 transition-colors"><span class="material-icons text-sm">close</span></button>
                            <div class="font-bold text-rose-600">${item.finalPrice}€</div>
                        </div>
                    </div>`;
            });
        }
        
        let totalFinal = subtotal;
        let discountHtml = '';

        if (window.isDiscountApplied && cart.length > 0) {
            const discountAmount = 5 * cart.length;
            totalFinal = subtotal - discountAmount;
            if(totalFinal < 0) totalFinal = 0; 
            
            discountHtml = `
                <div class="flex justify-between font-bold text-sm text-green-500 mb-2">
                    <span>Descuento RC24 (-5€/ud):</span>
                    <span>-${discountAmount}€</span>
                </div>
            `;
        }

        document.getElementById('cart-discount-container').innerHTML = discountHtml;
        document.getElementById('cart-total').innerText = totalFinal;
    }

    window.removeItem = function(index) {
        let cart = JSON.parse(localStorage.getItem('rccamis_cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('rccamis_cart', JSON.stringify(cart));
        window.updateCartUI();
    }

    window.guardarPedidoEnDashboard = async function(cart, total, metodo, transactionId = "N/A", shippingInfo = null) {
        try {
            await addDoc(collection(db, "orders"), {
                items: cart,
                total: parseFloat(total),
                metodoPago: metodo,
                estado: metodo === 'PayPal' ? 'Pagado' : 'Pendiente (Instagram)',
                transactionId: transactionId,
                shipping: shippingInfo, 
                fecha: serverTimestamp()
            });
        } catch (e) { console.error("Error guardando estadisticas: ", e); }
    }

    window.generarTextoPedido = function(cart) {
        let mensaje = "Hola RC Camis! 👋 Quiero realizar este pedido:\n\n";
        cart.forEach((item) => {
            mensaje += `👕 *${limpiarTituloFeo(item.name)}* (${item.finalPrice}€)\n`;
            mensaje += `   • Talla: ${item.selection.size}\n`;
            if(item.selection.isMysteryBox) {
                if(item.selection.avoid) mensaje += `   • Evitar: ${item.selection.avoid}\n`;
            } else {
                if(item.selection.version === 'Jugador') mensaje += `   • Versión: JUGADOR\n`;
                if(item.selection.manga === 'Larga') mensaje += `   • Manga: LARGA\n`;
                if(item.selection.patch && item.selection.patch !== 'Ninguno') mensaje += `   • Parche: ${item.selection.patch}\n`;
                if(item.selection.customName) mensaje += `   • Custom: ${item.selection.customNumber || ''} - ${item.selection.customName}\n`;
            }
            mensaje += `----------------\n`;
        });
        
        if (window.isDiscountApplied) {
            mensaje += `\n🎁 *CÓDIGO APLICADO: RC24 (-5€ por camiseta)*`;
        }
        
        const total = document.getElementById('cart-total').innerText || cart[0].finalPrice;
        mensaje += `\n💰 *TOTAL FINAL: ${total}€*\n📍 Espero info para el pago!`;
        return mensaje;
    }

    window.enviarPedidoInstagram = function() {
        const cart = JSON.parse(localStorage.getItem('rccamis_cart')) || [];
        if (cart.length === 0) return showToast("El carrito está vacío", true);
        
        const name = document.getElementById('ship-name').value;
        const address = document.getElementById('ship-address').value;
        const city = document.getElementById('ship-city').value;
        const phone = document.getElementById('ship-phone').value;

        if(!name || !address || !city || !phone) {
            return showToast("⚠️ Por favor, rellena los datos de envío obligatorios antes de confirmar", true);
        }

        const shippingInfo = {
            name, address, city, phone,
            state: document.getElementById('ship-state').value,
            zip: document.getElementById('ship-zip').value,
            country: document.getElementById('ship-country').value
        };
        
        window.guardarPedidoEnDashboard(cart, document.getElementById('cart-total').innerText, 'Instagram', "N/A", shippingInfo);

        let texto = `📍 *DATOS DE ENVÍO:*\nNombre: ${name}\nDirección: ${address}, ${city}\nTeléfono: ${phone}\n\n`;
        texto += window.generarTextoPedido(cart);

        navigator.clipboard.writeText(texto).then(() => {
            showToast("¡Pedido copiado! Abriendo Instagram...");
            setTimeout(() => { window.open(`https://ig.me/m/${USUARIO_INSTAGRAM}`, '_blank'); }, 1500);
        }).catch(err => {
            alert("Tu navegador bloqueó copiar el texto. Escríbenos a @" + USUARIO_INSTAGRAM);
        });
    }

    window.updateCartUI();

    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.vista === 'producto') {
            window.openProduct(event.state.id, true);
        } else if (event.state && event.state.vista === 'catalogo') {
            document.getElementById('home-view').classList.add('hidden');
            document.getElementById('product-detail-view').classList.add('hidden');
            document.getElementById('catalog-view').classList.remove('hidden');
        } else {
            document.getElementById('product-detail-view').classList.add('hidden');
            document.getElementById('catalog-view').classList.add('hidden');
            document.getElementById('home-view').classList.remove('hidden');
        }
    });

    history.replaceState({ vista: 'inicio' }, "", window.location.pathname);

    window.addEventListener('DOMContentLoaded', (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('cart') === 'open') {
            toggleCart();
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    });

window.toggleCart = function toggleCart() {
        const modal = document.getElementById('cart-modal');
        const panel = document.getElementById('cart-panel');
        if (modal.classList.contains('hidden')) {
            modal.classList.remove('hidden');
            setTimeout(() => panel.classList.remove('translate-x-full'), 10);
        } else {
            panel.classList.add('translate-x-full');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
    }

    window.paypal.Buttons({
        style: {
            layout: 'vertical',
            color:  'gold',
            shape:  'rect',
            label:  'pay'
        },
        onClick: function(data, actions) {
            const name = document.getElementById('ship-name').value;
            const address = document.getElementById('ship-address').value;
            const city = document.getElementById('ship-city').value;
            const phone = document.getElementById('ship-phone').value;
            
            if(!name || !address || !city || !phone) {
                window.showToast("⚠️ Por favor, rellena los datos de envío antes de pagar", true);
                return actions.reject();
            } else {
                return actions.resolve();
            }
        },
        createOrder: function(data, actions) {
            const totalStr = document.getElementById('cart-total').innerText;
            const totalAmount = parseFloat(totalStr);
            
            if (isNaN(totalAmount) || totalAmount <= 0) {
                window.showToast("El carrito está vacío", true);
                return;
            }
            
            return actions.order.create({
                purchase_units: [{
                    amount: { value: totalAmount.toFixed(2) },
                    description: "Pedido RC Camis"
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(orderData) {
                const transaction = orderData.purchase_units[0].payments.captures[0];
                const cart = JSON.parse(localStorage.getItem('rccamis_cart')) || [];
                
                const shippingInfo = {
                    name: document.getElementById('ship-name').value,
                    address: document.getElementById('ship-address').value,
                    state: document.getElementById('ship-state').value,
                    city: document.getElementById('ship-city').value,
                    zip: document.getElementById('ship-zip').value,
                    country: document.getElementById('ship-country').value,
                    phone: document.getElementById('ship-phone').value
                };
                
                window.showToast("✅ ¡Pago completado con éxito!");
                
                window.guardarPedidoEnDashboard(cart, transaction.amount.value, 'PayPal', transaction.id, shippingInfo);

                let texto = "✅ *PEDIDO PAGADO POR PAYPAL*\n";
                texto += `ID Transacción: ${transaction.id}\n\n`;
                texto += `📍 *DATOS DE ENVÍO:*\n`;
                texto += `Nombre: ${shippingInfo.name}\n`;
                texto += `Dirección: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}\n`;
                texto += `CP: ${shippingInfo.zip} - ${shippingInfo.country}\n`;
                texto += `Teléfono: ${shippingInfo.phone}\n\n`;
                texto += window.generarTextoPedido(cart);
                
                navigator.clipboard.writeText(texto).catch(() => {});
                
                alert("¡Pago recibido con éxito! Hemos copiado tu pedido y tu dirección. Pégalo en nuestro Instagram para coordinar el envío rápidamente.");
                
                localStorage.removeItem('rccamis_cart');
                window.isDiscountApplied = false;
                window.updateCartUI();
                toggleCart();
                
                window.open(`https://ig.me/m/${USUARIO_INSTAGRAM}`, '_blank');
            });
        },
        onError: function(err) {
            console.error('Error de PayPal:', err);
            window.showToast("Hubo un error al procesar el pago", true);
        }
    }).render('#paypal-button-container');

// --- BUSCADOR GLOBAL MULTI-COLECCIÓN ---
document.addEventListener("DOMContentLoaded", function() {
    const globalSearchInput = document.getElementById('global-search');
    
    if(globalSearchInput) {
        globalSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if(query !== "") {
                    // Limpiamos la barra de búsqueda superior
                    globalSearchInput.value = '';
                    
                    // Llamamos a la función que buscará en todo Firebase
                    // Asegúrate de que el script de abajo esté cargado
                    if(typeof window.buscarEnTodoElCatalogo === 'function') {
                        window.buscarEnTodoElCatalogo(query);
                    } else {
                        console.error("La función buscarEnTodoElCatalogo no está definida.");
                    }
                }
            }
        });
    }
});

// Evitamos que JavaScript se congele al intentar pintar un botón que no existe
window.addEventListener('error', function(e) {
    if (e.message && e.message.includes("classList") && e.message.includes("null")) {
        console.warn("Se intentó colorear un botón de categoría inexistente. El catálogo cargará sin problemas.");
        e.preventDefault();
    }
}, true);

// Bloqueamos saltos de enlaces antiguos por si se te olvidó alguno
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href="#"]').forEach(enlace => {
        enlace.addEventListener('click', function(e) { e.preventDefault(); });
    });
});

window.showProductDetail = function(productId) {
    window.openProduct(productId);
};
