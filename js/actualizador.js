import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

        // Agrupación de colecciones
        const coleccionesEstandar = ['laliga', 'premier', 'national_teams', 'seriea', 'bundesliga', 'ligue1', 'brasileiro', 'argentina', 'mls', 'ligamx'];
        const coleccionesRetro = ['retro'];
        const coleccionesMangaLarga = ['long_sleeve'];

        function addLog(msg) {
            const logsDiv = document.getElementById('logs');
            logsDiv.innerHTML += `<div>> ${msg}</div>`;
            logsDiv.scrollTop = logsDiv.scrollHeight;
        }

        window.iniciarActualizacion = async function() {
            const btn = document.getElementById('btn-update');
            const logContainer = document.getElementById('log-container');
            
            const doStandard = document.getElementById('check-standard').checked;
            const doRetro = document.getElementById('check-retro').checked;
            const doLongSleeve = document.getElementById('check-longsleeve').checked;

            const valStandard = parseFloat(document.getElementById('price-standard').value);
            const valRetro = parseFloat(document.getElementById('price-retro').value);
            const valLongSleeve = parseFloat(document.getElementById('price-longsleeve').value);

            // Validaciones
            if (!doStandard && !doRetro && !doLongSleeve) {
                return alert("Selecciona al menos una categoría marcando la casilla 'Actualizar estas'.");
            }
            if ((doStandard && isNaN(valStandard)) || (doRetro && isNaN(valRetro)) || (doLongSleeve && isNaN(valLongSleeve))) {
                return alert("Por favor, escribe un precio válido en las categorías seleccionadas.");
            }

            const confirmar = confirm("⚠️ ¿Estás seguro de que quieres cambiar los precios de TODA LA BASE DE DATOS en las colecciones seleccionadas?");
            if (!confirmar) return;

            btn.disabled = true;
            btn.innerHTML = `<span class="material-icons animate-spin">refresh</span> ACTUALIZANDO...`;
            logContainer.classList.remove('hidden');
            document.getElementById('logs').innerHTML = "";

            try {
                // 1. Actualizar Ligas Estándar
                if (doStandard) {
                    addLog(`Iniciando Ligas Estándar. Nuevo precio: ${valStandard}€`);
                    await procesarColecciones(coleccionesEstandar, valStandard);
                }

                // 2. Actualizar Retro
                if (doRetro) {
                    addLog(`Iniciando Retro. Nuevo precio: ${valRetro}€`);
                    await procesarColecciones(coleccionesRetro, valRetro);
                }

                // 3. Actualizar Manga Larga
                if (doLongSleeve) {
                    addLog(`Iniciando Manga Larga. Nuevo precio: ${valLongSleeve}€`);
                    await procesarColecciones(coleccionesMangaLarga, valLongSleeve);
                }

                addLog("✅ ¡PROCESO FINALIZADO CON ÉXITO!");
                addLog("💡 IMPORTANTE: Recuerda que los clientes pueden ver los precios antiguos durante 24h debido a la memoria Caché de sus navegadores. Para forzar que vean los nuevos precios, diles que recarguen la web o cambia el nombre de la variable de caché en tu index.html.");

                btn.classList.replace('bg-slate-900', 'bg-green-600');
                btn.innerHTML = `<span class="material-icons">check_circle</span> PRECIOS ACTUALIZADOS`;

            } catch (error) {
                console.error(error);
                addLog(`<span class="text-red-500">❌ ERROR CRÍTICO: ${error.message}</span>`);
                btn.disabled = false;
                btn.innerHTML = `<span class="material-icons">save</span> REINTENTAR`;
            }
        }

        async function procesarColecciones(coleccionesArray, nuevoPrecio) {
            for (const nombreColeccion of coleccionesArray) {
                addLog(`Leyendo colección: ${nombreColeccion}...`);
                const colRef = collection(db, nombreColeccion);
                const snapshot = await getDocs(colRef);
                
                let batch = writeBatch(db);
                let contador = 0;
                let totalActualizados = 0;

                for (const documento of snapshot.docs) {
                    const docRef = doc(db, nombreColeccion, documento.id);
                    batch.update(docRef, { price: nuevoPrecio });
                    contador++;
                    totalActualizados++;

                    // Firebase limita los batch a 500 operaciones. Mandamos de 400 en 400 por seguridad.
                    if (contador === 400) {
                        await batch.commit();
                        batch = writeBatch(db); // Crear nuevo batch
                        contador = 0;
                        addLog(`  Lote guardado (400 items)...`);
                    }
                }

                // Guardar los que sobren en el último batch
                if (contador > 0) {
                    await batch.commit();
                }

                addLog(`✔️ ${nombreColeccion} terminada. (${totalActualizados} productos actualizados)`);
            }
        }
