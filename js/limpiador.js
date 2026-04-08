import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// IMPORTANTE: Hemos añadido writeBatch aquí

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

        let productosAActualizar = [];
        let currentCollection = "";

        function formatearNombre(oldName) {
            if (!oldName) return "Camiseta Desconocida";
            let name = oldName.toUpperCase();

            let isMangaLarga = name.includes('MANGA LARGA') || name.includes('LONG SLEEVE') || name.includes('L/S');
            let isRetro = name.includes('RETRO') || name.includes('VINTAGE') || name.includes('CLASSIC');
            let isJugador = name.includes('JUGADOR') || name.includes('PLAYER') || name.includes('ADV');
            let isKids = name.includes('KIDS') || name.includes('NIÑO') || name.includes('YOUTH') || name.includes('CHILD');

            let version = "";
            if (isKids) {
                version = isMangaLarga ? "version para niños manga larga" : "version para niños";
            } else if (isRetro) {
                version = isMangaLarga ? "version retro manga larga" : "retro";
            } else if (isJugador) {
                version = isMangaLarga ? "version jugador manga larga" : "version jugador";
            } else {
                version = isMangaLarga ? "version fan manga larga" : "version fan";
            }

            let equipacion = "";
            if (name.match(/1A|1ª|PRIMERA|LOCAL|HOME/)) {
                equipacion = "local";
            } else if (name.match(/2A|2ª|SEGUNDA|VISITANTE|AWAY/)) {
                equipacion = "visitante";
            } else if (name.match(/3A|3ª|TERCERA|THIRD/)) {
                equipacion = "tercera";
            } else if (name.match(/4A|4ª|CUARTA|FOURTH/)) {
                equipacion = "cuarta";
            }

            name = name.replace(/\b([SML]|XL|XXL|XXXL|[2-5]XL)\b/g, ' ');

            let year = "";
            let seasonSeparatedMatch = name.match(/\b(\d{2,4})[\/\- ](\d{2,4})\b/);
            let fourDigitMatch = name.match(/\b(\d{4})\b/);

            if (seasonSeparatedMatch) {
                year = `${seasonSeparatedMatch[1].slice(-2)}/${seasonSeparatedMatch[2].slice(-2)}`;
                name = name.replace(seasonSeparatedMatch[0], ' ');
            } else if (fourDigitMatch) {
                let digits = fourDigitMatch[1];
                let p1 = parseInt(digits.substring(0, 2));
                let p2 = parseInt(digits.substring(2, 4));

                if ((p2 >= p1 && p2 <= p1 + 2) || (p1 === 99 && p2 === 0) || digits.startsWith("0")) {
                    if (digits.startsWith("19") || digits.startsWith("20")) {
                        if (digits === "1920") year = "19/20";
                        else if (digits === "2021") year = "20/21";
                        else year = digits; 
                    } else {
                        year = `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
                    }
                } else {
                    year = digits;
                }
                name = name.replace(digits, ' ');
            }

            const palabrasABorrar = [
                /CAMISETA DEL /g, /CAMISETA DE /g, /CAMISETA DE F[UÚ]TBOL/g, /CAMISETA/g, 
                /LONG SLEEVE/g, /SHORT SLEEVE/g, /LONG SLEEVES/g, /L\/S/g, /S\/S/g,
                /JERSEY/g, /SHIRT/g, /KIT/g, /RETRO/g, /VINTAGE/g, /CLASSIC/g,
                /MANGA LARGA/g, /MANGA CORTA/g,
                /1A EQUIPACI[OÓ]N/g, /2A EQUIPACI[OÓ]N/g, /3A EQUIPACI[OÓ]N/g, /4A EQUIPACI[OÓ]N/g,
                /1ª EQUIPACI[OÓ]N/g, /2ª EQUIPACI[OÓ]N/g, /3ª EQUIPACI[OÓ]N/g, /4ª EQUIPACI[OÓ]N/g,
                /1A/g, /1ª/g, /2A/g, /2ª/g, /3A/g, /3ª/g, /4A/g, /4ª/g,
                /PRIMERA/g, /SEGUNDA/g, /TERCERA/g, /CUARTA/g, /EQUIPACI[OÓ]N/g,
                /LOCAL/g, /VISITANTE/g, /ALTERNATIV[AO]/g, /HOME/g, /AWAY/g, /THIRD/g,
                /VERSI[OÓ]N JUGADOR/g, /JUGADOR/g, /PLAYER/g, /ADV/g, /FAN/g, /AUTHENTIC/g,
                /EDICI[OÓ]N ESPECIAL/g, /ESPECIAL/g, /EDITION/g,
                /KIDS/g, /NIÑOS/g, /NIÑO/g, /YOUTH/g, /CHILD/g
            ];

            palabrasABorrar.forEach(regex => {
                name = name.replace(regex, ' ');
            });

            let team = name.replace(/[^A-ZÁÉÍÓÚÑ ]/g, ' ').replace(/\s+/g, ' ').trim();
            team = team.split(' ').map(word => {
                if (word.length === 0) return '';
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');

            let prefijo = "del ";
            const llevaDe = ["España", "Argentina", "Francia", "Italia", "Alemania", "Brasil", "Inglaterra", "Portugal", "Holanda", "Marruecos", "Croacia", "Colombia", "Uruguay", "Mexico", "Juventus", "Roma", "Fiorentina"];
            if (llevaDe.includes(team)) {
                prefijo = "de ";
            }

            let result = `Camiseta ${prefijo}${team}`;
            if (year) result += ` ${year}`;
            if (equipacion) result += ` ${equipacion}`;
            result += ` ${version}`;

            return result.replace(/\s+/g, ' ').trim();
        }

        window.cargarProductos = async function() {
            document.getElementById('loader').classList.remove('hidden');
            document.getElementById('results-container').classList.add('hidden');
            document.getElementById('table-body').innerHTML = '';
            
            currentCollection = document.getElementById('collection-select').value;
            productosAActualizar = [];

            try {
                const querySnapshot = await getDocs(collection(db, currentCollection));
                let html = '';
                
                querySnapshot.forEach((documento) => {
                    const data = documento.data();
                    const oldName = data.name || "";
                    const newName = formatearNombre(oldName);
                    
                    // Solo actualizar si el nombre realmente cambia
                    if (oldName !== newName) {
                        productosAActualizar.push({
                            id: documento.id,
                            oldName: oldName,
                            newName: newName
                        });

                        html += `
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="p-4 text-slate-500 font-mono text-xs border-r border-slate-100">${oldName}</td>
                                <td class="p-4 text-blue-700 font-bold">${newName}</td>
                            </tr>
                        `;
                    }
                });

                document.getElementById('table-body').innerHTML = html;
                document.getElementById('count').innerText = productosAActualizar.length;
                
                document.getElementById('loader').classList.add('hidden');
                document.getElementById('results-container').classList.remove('hidden');

                if (productosAActualizar.length === 0) {
                    alert("¡Todos los productos de esta colección ya están perfectamente formateados!");
                }

            } catch (error) {
                console.error("Error al cargar:", error);
                alert("Error al conectar con Firebase: " + error.message);
                document.getElementById('loader').classList.add('hidden');
            }
        };

        window.actualizarFirebase = async function() {
            if (productosAActualizar.length === 0) return alert("No hay productos para actualizar.");
            
            const confirmar = confirm(`⚠️ Vas a modificar ${productosAActualizar.length} productos en la base de datos oficial. ¿Continuar?`);
            if (!confirmar) return;

            const btn = document.getElementById('btn-update');
            btn.innerText = "Escribiendo en Firebase...";
            btn.disabled = true;

            try {
                // INICIO DEL GUARDADO POR LOTES (BATCH)
                let batch = writeBatch(db);
                let count = 0;
                let lotesEnviados = 0;

                for (const prod of productosAActualizar) {
                    const docRef = doc(db, currentCollection, prod.id);
                    batch.update(docRef, { name: prod.newName });
                    count++;

                    // Firebase solo permite enviar lotes de 500 máximo. Cortamos cada 400 por seguridad.
                    if (count === 400) {
                        await batch.commit(); // Envía el paquete
                        lotesEnviados++;
                        batch = writeBatch(db); // Prepara el siguiente paquete
                        count = 0;
                    }
                }

                // Enviar los últimos que queden
                if (count > 0) {
                    await batch.commit();
                }

                alert(`✅ ¡ÉXITO ROTUNDO! Se han actualizado ${productosAActualizar.length} camisetas correctamente en la base de datos.`);
                
                // Limpiar caché local
                localStorage.clear();
                
                btn.innerHTML = `<span class="material-icons">check_circle</span> Actualizado Correctamente`;
                btn.classList.replace('bg-red-600', 'bg-green-600');
                btn.classList.replace('hover:bg-red-700', 'hover:bg-green-700');

            } catch (error) {
                // SI FALLA, AHORA SALTARÁ ESTA ALERTA GIGANTE
                console.error("Error fatal al actualizar:", error);
                alert(`❌ ERROR DE FIREBASE: \n\n${error.message}\n\nRevisa las reglas de seguridad de Firestore (deben estar en 'allow write: if true;')`);
                
                btn.innerText = "Error - Reintentar";
                btn.disabled = false;
            }
        };
