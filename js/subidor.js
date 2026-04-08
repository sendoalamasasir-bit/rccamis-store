import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// IMPORTAMOS FIREBASE STORAGE PARA LAS IMÁGENES

        const firebaseConfig = {
            apiKey: "AIzaSyDCxD-IVLjXcQT1LzfLVqy7nPpTZvwEqNnw",
            authDomain: "rccamis-store.firebaseapp.com",
            projectId: "rccamis-store",
            storageBucket: "rccamis-store.firebasestorage.app",
            messagingSenderId: "1036696205279",
            appId: "1:1036696205279:web:4bf61aa2503a41a6c5366a"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const storage = getStorage(app);

        let archivosAProcesar = [];

        // MOTOR DE LIMPIEZA DE NOMBRES
        function formatearNombre(oldName) {
            // Quitar extensión
            let name = oldName.replace(/\.(jpg|jpeg|png|webp)$/i, '');
            name = name.toUpperCase();

            let isMangaLarga = name.includes('MANGA LARGA') || name.includes('LONG SLEEVE') || name.includes('L/S');
            let isRetro = name.includes('RETRO') || name.includes('VINTAGE') || name.includes('CLASSIC');
            let isJugador = name.includes('JUGADOR') || name.includes('PLAYER') || name.includes('ADV');
            let isKids = name.includes('KIDS') || name.includes('NIÑO') || name.includes('YOUTH') || name.includes('CHILD');

            let version = "";
            if (isKids) version = isMangaLarga ? "version para niños manga larga" : "version para niños";
            else if (isRetro) version = isMangaLarga ? "version retro manga larga" : "retro";
            else if (isJugador) version = isMangaLarga ? "version jugador manga larga" : "version jugador";
            else version = isMangaLarga ? "version fan manga larga" : "version fan";

            let equipacion = "";
            if (name.match(/1A|1ª|PRIMERA|LOCAL|HOME/)) equipacion = "local";
            else if (name.match(/2A|2ª|SEGUNDA|VISITANTE|AWAY/)) equipacion = "visitante";
            else if (name.match(/3A|3ª|TERCERA|THIRD/)) equipacion = "tercera";
            else if (name.match(/4A|4ª|CUARTA|FOURTH/)) equipacion = "cuarta";

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
                    } else year = `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
                } else year = digits;
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
                /EDICI[OÓ]N ESPECIAL/g, /ESPECIAL/g, /EDITION/g, /KIDS/g, /NIÑOS/g, /NIÑO/g, /YOUTH/g, /CHILD/g,
                /-/g, /_/g, /\./g
            ];

            palabrasABorrar.forEach(regex => { name = name.replace(regex, ' '); });

            let team = name.replace(/[^A-ZÁÉÍÓÚÑ ]/g, ' ').replace(/\s+/g, ' ').trim();
            team = team.split(' ').map(word => {
                if (word.length === 0) return '';
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');

            let prefijo = "del ";
            const llevaDe = ["España", "Argentina", "Francia", "Italia", "Alemania", "Brasil", "Inglaterra", "Portugal", "Holanda", "Marruecos", "Croacia", "Colombia", "Uruguay", "Mexico", "Juventus", "Roma", "Fiorentina"];
            if (llevaDe.includes(team)) prefijo = "de ";

            let result = `Camiseta ${prefijo}${team}`;
            if (year) result += ` ${year}`;
            if (equipacion) result += ` ${equipacion}`;
            result += ` ${version}`;

            return result.replace(/\s+/g, ' ').trim();
        }

        // AL SELECCIONAR ARCHIVOS
        document.getElementById('file-input').addEventListener('change', function(e) {
            archivosAProcesar = Array.from(e.target.files);
            if (archivosAProcesar.length === 0) return;

            document.getElementById('preview-container').classList.remove('hidden');
            document.getElementById('count').innerText = archivosAProcesar.length;
            
            let html = '';
            archivosAProcesar.forEach((file, index) => {
                const objectUrl = URL.createObjectURL(file);
                const nombreLimpio = formatearNombre(file.name);
                
                // Guardamos el nombre limpio para luego
                file.cleanName = nombreLimpio;

                html += `
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td class="p-2 border-r border-slate-100">
                            <img src="${objectUrl}" class="w-12 h-12 object-cover rounded shadow-sm">
                        </td>
                        <td class="p-4 text-slate-500 font-mono text-xs border-r border-slate-100">${file.name}</td>
                        <td class="p-4 text-blue-700 font-bold">${nombreLimpio}</td>
                    </tr>
                `;
            });
            document.getElementById('table-body').innerHTML = html;
        });

        function addLog(msg) {
            const logsDiv = document.getElementById('logs');
            logsDiv.innerHTML += `<div>> ${msg}</div>`;
            logsDiv.scrollTop = logsDiv.scrollHeight;
        }

        window.subirTodoAFirebase = async function() {
            if (archivosAProcesar.length === 0) return;
            
            const currentCollection = document.getElementById('collection-select').value;
            const btn = document.getElementById('btn-upload');
            const progressContainer = document.getElementById('progress-container');
            const progressBar = document.getElementById('progress-bar');
            
            const confirmar = confirm(`⚠️ Vas a subir ${archivosAProcesar.length} camisetas a la colección [${currentCollection}]. ¿Continuar?`);
            if (!confirmar) return;

            btn.disabled = true;
            btn.innerHTML = "Subiendo...";
            progressContainer.classList.remove('hidden');
            document.getElementById('logs').innerHTML = "";

            let completados = 0;

            // Precio base por defecto (Retro = 25, Resto = 20)
            const basePrice = currentCollection === 'retro' ? 25 : 20;

            for (let i = 0; i < archivosAProcesar.length; i++) {
                const file = archivosAProcesar[i];
                try {
                    addLog(`Subiendo imagen: ${file.name}...`);
                    
                    // 1. Subir imagen a Storage (Carpeta: camisetas/laliga/nombre_unico.jpg)
                    const uniqueName = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '');
                    const storageRef = ref(storage, `camisetas/${currentCollection}/${uniqueName}`);
                    
                    await uploadBytes(storageRef, file);
                    const downloadUrl = await getDownloadURL(storageRef);
                    
                    // 2. Guardar en Firestore Database
                    addLog(`Guardando producto: ${file.cleanName}...`);
                    await addDoc(collection(db, currentCollection), {
                        name: file.cleanName,
                        image: downloadUrl,
                        price: basePrice
                    });

                    completados++;
                    progressBar.style.width = `${(completados / archivosAProcesar.length) * 100}%`;
                    addLog(`✅ ¡Completado!`);

                } catch (error) {
                    console.error(error);
                    addLog(`<span class="text-red-500">❌ Error subiendo ${file.name}: ${error.message}</span>`);
                }
            }

            addLog("🎉 ¡TODOS LOS ARCHIVOS PROCESADOS!");
            btn.classList.replace('bg-green-600', 'bg-slate-800');
            btn.innerHTML = `<span class="material-icons">check_circle</span> Finalizado`;
            
            // Limpiar caché de la tienda para que se vean al momento
            localStorage.removeItem(`rc_cache_${currentCollection}`);
            localStorage.removeItem(`rc_time_${currentCollection}`);
        };
