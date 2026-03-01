// Ein Array ist eine Liste — hier speichern wir alle Bildpfade der Reihe nach
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

// Die Titel der Bilder — in derselben Reihenfolge wie das bilder-Array
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

// Eine Variable merkt sich welches Bild gerade offen ist (0 = erstes Bild)
var aktuellesIndex = 0;

// Diese Hilfsfunktion aktualisiert den Zähler und den Titel
function zaehlerAktualisieren() {
    document.getElementById("zaehler").textContent = `${aktuellesIndex + 1} / ${bilder.length}`;
    document.getElementById("lightbox-titel").textContent = titel[aktuellesIndex];
}

// Diese Funktion wird aufgerufen wenn man ein Bild anklickt
function bildOeffnen(src) {
    // Wir suchen in der Liste wo dieses Bild ist
    // indexOf() gibt die Position zurück (0, 1, 2, ...)
    aktuellesIndex = bilder.indexOf(src);

    // Das große Bild bekommt den richtigen Pfad
    document.getElementById("grossesBild").src = bilder[aktuellesIndex];

    // Zähler aktualisieren
    zaehlerAktualisieren();

    // Die Lightbox wird sichtbar
    document.getElementById("lightbox").style.display = "flex";
}

// Diese Funktion wechselt das Bild — richtung ist +1 (rechts) oder -1 (links)
function bildWechseln(richtung) {
    // Wir addieren die Richtung zum aktuellen Index
    aktuellesIndex = aktuellesIndex + richtung;

    // Wenn wir über das letzte Bild hinaus gehen → zurück zum ersten
    if (aktuellesIndex >= bilder.length) {
        aktuellesIndex = 0;
    }

    // Wenn wir vor das erste Bild gehen → springe zum letzten
    if (aktuellesIndex < 0) {
        aktuellesIndex = bilder.length - 1;
    }

    // Das große Bild aktualisieren
    document.getElementById("grossesBild").src = bilder[aktuellesIndex];

    // Zähler aktualisieren
    zaehlerAktualisieren();
}

// Diese Funktion schließt die Lightbox
function schliessen() {
    document.getElementById("lightbox").style.display = "none";
}

// addEventListener "hört zu" auf Ereignisse
// "keydown" bedeutet: eine Taste wurde gedrückt
// "event" ist ein Objekt mit Infos — z.B. welche Taste
document.addEventListener("keydown", function(event) {

    // event.key gibt uns den Namen der Taste als Text
    if (event.key === "Escape") {
        schliessen();                // ESC → Lightbox schließen
    }

    if (event.key === "ArrowRight") {
        bildWechseln(1);             // Pfeil rechts → nächstes Bild
    }

    if (event.key === "ArrowLeft") {
        bildWechseln(-1);            // Pfeil links → vorheriges Bild
    }
});

// ========================
// TOUCH SWIPE FÜR HANDY
// ========================

// Diese Variable merkt sich wo der Finger angefangen hat
var touchStartX = 0;

var lightbox = document.getElementById("lightbox");

// "touchstart" — Finger berührt den Bildschirm
// event.touches ist eine Liste aller Finger auf dem Screen
// [0] bedeutet: der erste Finger
// .clientX ist die horizontale Position in Pixeln
lightbox.addEventListener("touchstart", function(event) {
    touchStartX = event.touches[0].clientX;
});

// "touchend" — Finger hebt sich vom Bildschirm
// event.changedTouches enthält die Finger die gerade aufgehört haben
lightbox.addEventListener("touchend", function(event) {
    var touchEndX = event.changedTouches[0].clientX;

    // Differenz berechnen: wo hat der Finger angefangen, wo aufgehört?
    var differenz = touchStartX - touchEndX;

    // Nur reagieren wenn der Swipe mindestens 50px war
    // (sonst reagiert es auch auf kurze versehentliche Berührungen)
    if (differenz > 50) {
        bildWechseln(1);    // nach links gewischt → nächstes Bild
    }

    if (differenz < -50) {
        bildWechseln(-1);   // nach rechts gewischt → vorheriges Bild
    }
});

// ========================
// LIKE BUTTON
// ========================

// localStorage kann nur Text speichern
// JSON.parse verwandelt Text zurück in ein JavaScript-Objekt
// Wenn noch nichts gespeichert ist, nehmen wir ein leeres Objekt {}
var likes = JSON.parse(localStorage.getItem("likes")) || {};

// Beim Laden der Seite: alle Like-Buttons auf den gespeicherten Stand setzen
document.querySelectorAll(".like-btn").forEach(function(btn, index) {
    // likes[index] ist die Anzahl der Likes für dieses Bild
    if (likes[index]) {
        // Anzahl anzeigen
        btn.querySelector("span").textContent = likes[index].anzahl;
        // Herz rot färben wenn geliked
        if (likes[index].geliked) {
            btn.classList.add("geliked");
            btn.firstChild.textContent = "♥ ";  // volles Herz
        }
    }
});

function liken(btn, index) {
    // Wenn noch kein Eintrag für dieses Bild → erstelle einen
    if (!likes[index]) {
        likes[index] = { anzahl: 0, geliked: false };
    }

    // toggle: war es geliked → unlike, war es nicht geliked → like
    likes[index].geliked = !likes[index].geliked;

    if (likes[index].geliked) {
        likes[index].anzahl = likes[index].anzahl + 1;  // Anzahl hoch
        btn.classList.add("geliked");
        btn.firstChild.textContent = "♥ ";              // volles Herz
    } else {
        likes[index].anzahl = likes[index].anzahl - 1;  // Anzahl runter
        btn.classList.remove("geliked");
        btn.firstChild.textContent = "♡ ";              // leeres Herz
    }

    // Anzahl im Button aktualisieren
    btn.querySelector("span").textContent = likes[index].anzahl;

    // Im localStorage speichern
    // JSON.stringify verwandelt das Objekt in Text damit localStorage es speichern kann
    localStorage.setItem("likes", JSON.stringify(likes));
}

// ========================
// NACH-OBEN BUTTON
// ========================

var nachObenBtn = document.getElementById("nachOben");

// "scroll" Event — wird ausgelöst wenn der Nutzer scrollt
// window.scrollY = wie viele Pixel schon gescrollt wurde
window.addEventListener("scroll", function() {

    if (window.scrollY > 300) {
        // classList.add() fügt eine CSS-Klasse hinzu
        nachObenBtn.classList.add("sichtbar");
    } else {
        // classList.remove() entfernt eine CSS-Klasse
        nachObenBtn.classList.remove("sichtbar");
    }
});

// Klick auf den Button → scrollt nach oben
nachObenBtn.addEventListener("click", function() {
    // scrollTo() scrollt zu einer Position
    // top: 0 = ganz oben
    // behavior: "smooth" = sanft scrollen
    window.scrollTo({ top: 0, behavior: "smooth" });
});
