function actualizarPrecio() {
            const tipo = document.getElementById('mb-type').value;
            const precio = tipo === 'fan' ? '17.00' : '21.00';
            document.getElementById('price-display').innerText = precio + ' €';
        }

        function showToast(message, isError = false) {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `px-4 py-3 rounded-lg shadow-xl text-sm font-bold text-white flex items-center gap-2 toast-slide-up ${isError ? 'bg-red-500' : 'bg-slate-800 border border-slate-600'}`;
            toast.innerHTML = `<span class="material-icons text-sm">${isError ? 'error' : 'check_circle'}</span> ${message}`;
            container.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
        }

        function addMysteryBoxToCart() {
            const type = document.getElementById('mb-type').value;
            const size = document.getElementById('mb-size').value;
            const avoid = document.getElementById('mb-avoid').value.trim();

            if(!size) return showToast("Por favor, selecciona tu talla", true);

            const price = type === 'fan' ? 17 : 21;
            const name = type === 'fan' ? 'MYSTERY BOX (Versión Fan)' : 'MYSTERY BOX (Versión Retro)';

            const cartItem = {
                id: 'mystery_' + Date.now(),
                name: name,
                image: 'https://cdn-icons-png.flaticon.com/512/3138/3138307.png', // Icono de regalo representativo
                finalPrice: price,
                selection: { size: size, avoid: avoid, isMysteryBox: true }
            };

            // Leer carrito existente y añadir el nuevo producto
            let cart = JSON.parse(localStorage.getItem('rccamis_cart')) || [];
            cart.push(cartItem);
            localStorage.setItem('rccamis_cart', JSON.stringify(cart));
            
            showToast("¡Caja añadida! Redirigiendo a tu carrito...");
            
            // Redirigir a la tienda principal con el carrito abierto automáticamente
            setTimeout(() => {
                window.location.href = 'index.html?cart=open';
            }, 1500);
        }
