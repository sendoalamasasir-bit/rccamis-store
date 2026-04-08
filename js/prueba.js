// --- PEGA TUS CREDENCIALES AQUÍ ---
    const firebaseConfig = {
        apiKey: "TU_API_KEY",
        authDomain: "rccamis-store.firebaseapp.com",
        projectId: "rccamis-store",
        storageBucket: "rccamis-store.appspot.com",
        messagingSenderId: "TU_SENDER_ID",
        appId: "TU_APP_ID"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // --- DICCIONARIO MAESTRO DE TRADUCCIÓN ---
    const diccionario = {
        // Equipos
        " U ": " Manchester United ",
        "U ": "Manchester United ",
        " MC ": " Manchester City ",
        "Real ": "Real Madrid ",
        "Atleti ": "Atlético de Madrid ",
        "Barca": "FC Barcelona",
        
        // Atributos (Manga Larga / Retro)
        " LS": " Manga Larga",
        "LS ": "Manga Larga ",
        "Long Sleeve": "Manga Larga",
        "Retro": "Retro Classic",
        "Vintage": "Retro",
        
        // Limpieza General
        "Jersey": "Camiseta",
        "Shirt": "Camiseta",
        "T-shirt": "Camiseta",
        "YUPOO": "",
        "yupoo": ""
    };

    function log(msg, isChange = false) {
        const c = document.getElementById('console');
        const style = isChange ? 'class="change-log"' : '';
        c.innerHTML += `<div ${style}>> ${msg}</div>`;
        c.scrollTop = c.scrollHeight;
    }

    async function iniciarProceso() {
        const col = document.getElementById('coleccion').value;
        log(`<b>Escaneando la colección ${col.toUpperCase()}...</b>`);

        try {
            const snapshot = await db.collection(col).get();
            if (snapshot.empty) {
                log("❌ No se encontraron productos.");
                return;
            }

            let editados = 0;
            const batch = db.batch();

            snapshot.forEach(doc => {
                let nombreOriginal = doc.data().name || "";
                let nombreNuevo = nombreOriginal;

                // 1. Aplicar reemplazos del diccionario
                Object.keys(diccionario).forEach(key => {
                    const regex = new RegExp(key, "gi"); // "gi" para ignorar mayúsculas/minúsculas
                    nombreNuevo = nombreNuevo.replace(regex, diccionario[key]);
                });

                // 2. Limpieza final de espacios y capitalización
                nombreNuevo = nombreNuevo.replace(/\s+/g, ' ').trim();
                nombreNuevo = nombreNuevo.charAt(0).toUpperCase() + nombreNuevo.slice(1);

                if (nombreNuevo !== nombreOriginal) {
                    batch.update(doc.ref, { name: nombreNuevo });
                    editados++;
                    log(`Cambiado: ${nombreOriginal} ➔ <span style="color:#fff">${nombreNuevo}</span>`, true);
                }
            });

            if (editados > 0) {
                await batch.commit();
                log(`<br>✅ ¡PROCESO COMPLETADO! Se han arreglado ${editados} camisetas.`);
            } else {
                log("<br>✨ Nada que cambiar. Todo está en orden.");
            }

        } catch (err) {
            log(`❌ Error: ${err.message}`);
        }
    }
