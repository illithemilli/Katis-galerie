function bildOeffnen(src) {
    document.getElementById("grossesBild").src = src;
    document.getElementById("lightbox").style.display = "flex";
}

function schliessen() {
    document.getElementById("lightbox").style.display = "none";
}