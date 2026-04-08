import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// MISMAS CREDENCIALES DE TU TIENDA
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

        window.cargarPedidos = async function() {
            try {
                const q = query(collection(db, "orders"), orderBy("fecha", "desc"));
                const querySnapshot = await getDocs(q);
                
                let html = '';
                let totalGanado = 0;
                let mysteryBoxes = 0;
                let totalPedidos = 0;

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    totalPedidos++;
                    
                    if(data.estado === 'Pagado') totalGanado += parseFloat(data.total);

                    // Formatear Fecha
                    let fecha = "Desconocida";
                    if(data.fecha) {
                        const dateObj = data.fecha.toDate();
                        fecha = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
                    }

                    // Formatear Artículos
                    let articulosHtml = '<ul class="list-disc pl-4 space-y-1">';
                    (data.items || []).forEach(item => {
                        if(item.selection?.isMysteryBox) mysteryBoxes++;
                        
                        let extras = `<span class="text-xs text-slate-400 block mt-0.5">Talla: ${item.selection?.size || 'N/A'}`;
                        if(item.selection?.isMysteryBox && item.selection?.avoid) extras += ` | Evitar: <b class="text-red-400">${item.selection.avoid}</b>`;
                        if(item.selection?.version === 'Jugador') extras += ` | JUGADOR`;
                        if(item.selection?.customName) extras += ` | ${item.selection.customName} (${item.selection.customNumber})`;
                        extras += `</span>`;
                        
                        articulosHtml += `<li><b>${item.name}</b> ${extras}</li>`;
                    });
                    articulosHtml += '</ul>';

                    // Etiqueta de Estado
                    const badgeClass = data.estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';
                    const icon = data.metodoPago === 'PayPal' ? 'payments' : 'camera_alt';

                    html += `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="p-4 border-r border-slate-100">
                                <div class="font-bold text-slate-700">${fecha}</div>
                                <div class="text-xs text-slate-400 font-mono mt-1">Ref: ${data.transactionId || doc.id.substring(0,8)}</div>
                            </td>
                            <td class="p-4">
                                <span class="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${badgeClass}">
                                    <span class="material-icons text-[14px]">${icon}</span> ${data.estado}
                                </span>
                            </td>
                            <td class="p-4">${articulosHtml}</td>
                            <td class="p-4 text-right font-black text-lg text-slate-800">${parseFloat(data.total).toFixed(2)}€</td>
                        </tr>
                    `;
                });

                if(html === '') html = '<tr><td colspan="4" class="p-8 text-center text-slate-500">Aún no hay pedidos registrados.</td></tr>';

                document.getElementById('orders-body').innerHTML = html;
                document.getElementById('stat-revenue').innerText = totalGanado.toFixed(2) + ' €';
                document.getElementById('stat-orders').innerText = totalPedidos;
                document.getElementById('stat-mystery').innerText = mysteryBoxes;

            } catch (error) {
                console.error("Error cargando pedidos:", error);
                document.getElementById('orders-body').innerHTML = `<tr><td colspan="4" class="p-8 text-center text-red-500 font-bold">Error conectando con la base de datos de Firebase. Asegúrate de que las reglas de Firestore permiten escritura/lectura.</td></tr>`;
            }
        };

        // Cargar al inicio
        cargarPedidos();
