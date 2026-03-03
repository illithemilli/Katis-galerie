// ========================
// FIREBASE EINBINDEN
// ========================

// "import" lädt externe Bibliotheken — das ist modernes JavaScript (ES Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Die Firebase Konfiguration — verbindet uns mit der Datenbank
const firebaseConfig = {
    apiKey: "AIzaSyB5xWUMOhJ5KsnPlfdHcfUhqR5rvqXZGWc",
    authDomain: "katis-galerie.firebaseapp.com",
    databaseURL: "https://katis-galerie-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "katis-galerie",
    storageBucket: "katis-galerie.firebasestorage.app",
    messagingSenderId: "530592510497",
    appId: "1:530592510497:web:617cf23af503bcceb52960"
};

// Firebase initialisieren — ab jetzt sind wir mit der Datenbank verbunden
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ========================
// BILDER & TITEL
// ========================

var bilder = [
    "images/IMG-20241008-WA0011.jpg",
    "images/IMG-20241004-WA0002.jpg",
    "images/IMG-20241114-WA0005.jpg",
    "images/IMG-20241114-WA0006.jpg",
    "images/IMG-20241114-WA0007.jpg",
    "images/IMG-20241114-WA0008.jpg",
    "images/IMG-20241114-WA0009.jpg",
    "images/IMG-20241114-WA0010.jpg",
    "images/IMG-20241114-WA0011.jpg",
    "images/PXL_20250216_112109455~2.jpg"
];

var titel = [
    "Mein erstes Rosen Bild die Bluten",
    "Das Flower Power Bild",
    "Die Hübsche Blonde Frau Bild",
    "Its better for ever you too Bloom and Smile",
    "Blumen auf dem Berg die Zerlaufen",
    "Das Friedens Bild",
    "Die Roten Blumen mit Gold Blätern",
    "Das Erste Portrait",
    "Das Haus im Garten",
    "Das Gesicht im Blumenbeet"
];

var aktuellesIndex = 0;

// ========================
// BESUCHER ZÄHLER
// ========================

var besucherRef = ref(db, "besucher");

// sessionStorage ist wie localStorage — aber wird beim Schließen des Tabs gelöscht
// So zählt jeder Besucher nur EINMAL pro Sitzung
if (!sessionStorage.getItem("gezaehlt")) {

    // runTransaction erhöht den Zähler sicher
    runTransaction(besucherRef, function(wert) {
        return (wert || 0) + 1;
    });

    // Merken dass wir schon gezählt haben
    sessionStorage.setItem("gezaehlt", "ja");
}

// Live-Anzeige der Besucherzahl
onValue(besucherRef, function(snapshot) {
    var zahl = snapshot.val() || 0;
    document.getElementById("besucher-zahl").textContent = zahl.toLocaleString("de-DE");
    // toLocaleString("de-DE") formatiert die Zahl z.B. 1.234 statt 1234
});

// ========================
// LIKE BUTTON MIT FIREBASE
// ========================

// localStorage merkt sich welche Bilder DU geliked hast (nur auf deinem Gerät)
var meineGelikes = JSON.parse(localStorage.getItem("meineGelikes")) || {};

// Für jedes Bild: Live-Verbindung zur Firebase Datenbank herstellen
// onValue() hört zu — wenn sich die Zahl ändert, wird die Seite automatisch aktualisiert!
bilder.forEach(function(bild, index) {
    // ref() zeigt auf einen Pfad in der Datenbank — wie ein Ordner
    var likeRef = ref(db, "likes/bild" + index);

    // onValue() wird aufgerufen sobald sich der Wert ändert (auch beim ersten Laden)
    onValue(likeRef, function(snapshot) {
        // snapshot.val() gibt den aktuellen Wert zurück
        var anzahl = snapshot.val() || 0;

        // Den richtigen Like-Button finden und Zahl aktualisieren
        var buttons = document.querySelectorAll(".like-btn");
        buttons[index].querySelector("span").textContent = anzahl;
    });

    // Gespeicherter Like-Status vom eigenen Gerät wiederherstellen
    if (meineGelikes[index]) {
        var buttons = document.querySelectorAll(".like-btn");
        buttons[index].classList.add("geliked");
        buttons[index].firstChild.textContent = "♥ ";
    }
});

function liken(btn, index) {
    var likeRef = ref(db, "likes/bild" + index);

    // War dieses Bild schon geliked?
    var warGeliked = meineGelikes[index] || false;

    // runTransaction() ändert den Wert sicher in der Datenbank
    // auch wenn mehrere Leute gleichzeitig liken!
    runTransaction(likeRef, function(aktuellerWert) {
        aktuellerWert = aktuellerWert || 0;

        if (warGeliked) {
            return aktuellerWert - 1;  // unlike → Zahl runter
        } else {
            return aktuellerWert + 1;  // like → Zahl hoch
        }
    });

    // Eigenen Like-Status umschalten
    meineGelikes[index] = !warGeliked;
    localStorage.setItem("meineGelikes", JSON.stringify(meineGelikes));

    // Button visuell aktualisieren
    if (meineGelikes[index]) {
        btn.classList.add("geliked");
        btn.firstChild.textContent = "♥ ";
    } else {
        btn.classList.remove("geliked");
        btn.firstChild.textContent = "♡ ";
    }
}

// ========================
// KOMMENTARE
// ========================

// Merkt sich den aktuellen Kommentar-Listener damit wir ihn abmelden können
var kommentarUnsubscribe = null;

function kommentareLaden(bildIndex) {
    var liste = document.getElementById("kommentare-liste");
    liste.innerHTML = "";  // Liste leeren

    // Wenn vorheriger Listener noch aktiv war → abmelden
    if (kommentarUnsubscribe) { kommentarUnsubscribe(); }

    var kommentarRef = ref(db, "kommentare/bild" + bildIndex);

    // onValue gibt eine Funktion zurück die den Listener abmeldet
    kommentarUnsubscribe = onValue(kommentarRef, function(snapshot) {
        liste.innerHTML = "";  // bei jedem Update neu aufbauen

        if (!snapshot.val()) {
            liste.innerHTML = "<p style='color:rgba(255,255,255,0.3);font-size:12px'>Noch keine Kommentare</p>";
            return;
        }

        // snapshot.val() gibt ein Objekt zurück — Object.values() macht ein Array daraus
        var kommentare = Object.values(snapshot.val());

        kommentare.forEach(function(k) {
            // Für jeden Kommentar ein div erstellen
            var div = document.createElement("div");
            div.className = "kommentar";
            // innerHTML setzt den HTML-Inhalt eines Elements
            div.innerHTML = `<div class="name">👤 ${k.name}</div><div class="text">${k.text}</div>`;
            liste.appendChild(div);  // div zur Liste hinzufügen
        });

        // Automatisch nach unten scrollen
        liste.scrollTop = liste.scrollHeight;
    });
}

// Formular abschicken
document.getElementById("kommentar-form").addEventListener("submit", function(event) {
    // preventDefault verhindert dass die Seite neu lädt
    event.preventDefault();

    var name = document.getElementById("kommentar-name").value.trim();
    var text = document.getElementById("kommentar-text").value.trim();

    // Nur absenden wenn beide Felder ausgefüllt sind
    if (!name || !text) return;

    var kommentarRef = ref(db, "kommentare/bild" + aktuellesIndex);

    // push() fügt einen neuen Eintrag mit automatischer ID hinzu
    push(kommentarRef, {
        name: name,
        text: text,
        zeit: Date.now()  // Zeitstempel in Millisekunden
    });

    // Eingabefelder leeren nach dem Absenden
    document.getElementById("kommentar-text").value = "";
});

// ========================
// LIGHTBOX
// ========================

function zaehlerAktualisieren() {
    document.getElementById("zaehler").textContent = `${aktuellesIndex + 1} / ${bilder.length}`;
    document.getElementById("lightbox-titel").textContent = titel[aktuellesIndex];
}

// Diese Funktionen müssen global sein damit onclick="" im HTML funktioniert
window.bildOeffnen = function(src) {
    aktuellesIndex = bilder.indexOf(src);
    document.getElementById("grossesBild").src = bilder[aktuellesIndex];
    zaehlerAktualisieren();
    kommentareLaden(aktuellesIndex);  // Kommentare für dieses Bild laden
    document.getElementById("lightbox").style.display = "flex";
};

window.bildWechseln = function(richtung) {
    aktuellesIndex = aktuellesIndex + richtung;
    if (aktuellesIndex >= bilder.length) { aktuellesIndex = 0; }
    if (aktuellesIndex < 0) { aktuellesIndex = bilder.length - 1; }
    document.getElementById("grossesBild").src = bilder[aktuellesIndex];
    zaehlerAktualisieren();
    kommentareLaden(aktuellesIndex);  // Kommentare für neues Bild laden
};

window.schliessen = function() {
    document.getElementById("lightbox").style.display = "none";
};

window.liken = liken;

// ========================
// TASTATUR NAVIGATION
// ========================

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape")      { window.schliessen(); }
    if (event.key === "ArrowRight")  { window.bildWechseln(1); }
    if (event.key === "ArrowLeft")   { window.bildWechseln(-1); }
});

// ========================
// TOUCH SWIPE FÜR HANDY
// ========================

var touchStartX = 0;
var lightbox = document.getElementById("lightbox");

lightbox.addEventListener("touchstart", function(event) {
    touchStartX = event.touches[0].clientX;
});

lightbox.addEventListener("touchend", function(event) {
    var touchEndX = event.changedTouches[0].clientX;
    var differenz = touchStartX - touchEndX;
    if (differenz > 50)  { window.bildWechseln(1); }
    if (differenz < -50) { window.bildWechseln(-1); }
});

// ========================
// DARK / LIGHT MODE
// ========================

var themeToggle = document.getElementById("theme-toggle");

// localStorage merkt sich welches Theme der Besucher gewählt hat
var gespeichertesTheme = localStorage.getItem("theme") || "dark";

// Theme beim Laden anwenden
document.documentElement.setAttribute("data-theme", gespeichertesTheme);
// documentElement ist das <html> Element — dort setzen wir data-theme
themeToggle.textContent = gespeichertesTheme === "dark" ? "☀️" : "🌙";
// ? : ist ein "ternary operator" — Kurzform für if/else:
// bedingung ? wert-wenn-true : wert-wenn-false

themeToggle.addEventListener("click", function() {
    var aktuell = document.documentElement.getAttribute("data-theme");

    if (aktuell === "dark") {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙";  // im Light Mode zeige Mond
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️";  // im Dark Mode zeige Sonne
    }
});

// ========================
// LADEBALKEN
// ========================

var ladebalken = document.getElementById("ladebalken");

window.addEventListener("scroll", function() {

    // scrollHeight = gesamte Höhe der Seite
    // innerHeight  = Höhe des sichtbaren Browserfensters
    // scrollHeight - innerHeight = maximale Scroll-Distanz
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Wie weit wurde schon gescrollt? In Prozent!
    var prozent = (window.scrollY / maxScroll) * 100;

    // Breite des Balkens setzen
    ladebalken.style.width = prozent + "%";
});

// ========================
// NACH-OBEN BUTTON
// ========================

var nachObenBtn = document.getElementById("nachOben");

window.addEventListener("scroll", function() {
    if (window.scrollY > 300) {
        nachObenBtn.classList.add("sichtbar");
    } else {
        nachObenBtn.classList.remove("sichtbar");
    }
});

nachObenBtn.addEventListener("click", function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
