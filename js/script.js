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

// Eine Variable merkt sich welches Bild gerade offen ist (0 = erstes Bild)
var aktuellesIndex = 0;

// Diese Funktion wird aufgerufen wenn man ein Bild anklickt
function bildOeffnen(src) {
    // Wir suchen in der Liste wo dieses Bild ist
    // indexOf() gibt die Position zurück (0, 1, 2, ...)
    aktuellesIndex = bilder.indexOf(src);

    // Das große Bild bekommt den richtigen Pfad
    document.getElementById("grossesBild").src = bilder[aktuellesIndex];

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
