/* Point unique de configuration du branding (événement ACME).
 * Chargé après le markup de l'étape 1 et avant launch.js : voir work/company-event/plan.md. */
(function (window) {
  "use strict";

  window.BRANDING = {
    name: "ACME",
    welcome: "Bienvenue au ACME Racing Challenge",
    subtitle: "Une expérience événementielle aux couleurs de la marque.",
    startLabel: "Démarrer la course",
    logo: { src: "branding/acme-logo.png", alt: "ACME" },
    colors: {
      bg: "#08090D",
      violet: "#7628FF",
      blue: "#315BFF",
      cyan: "#00C4E8",
      text: "#FFFFFF",
      surface: "#E6E8EE"
    }
  };

  // `doc` est injectable pour les tests ; un emplacement absent est ignoré.
  window.applyBranding = function (doc) {
    var b = window.BRANDING, k, el;

    for (k in b.colors) {
      if (b.colors.hasOwnProperty(k)) {
        doc.documentElement.style.setProperty("--brand-" + k, b.colors[k]);
      }
    }

    el = doc.querySelector('[data-brand="welcome"]');
    if (el) el.textContent = b.welcome;
    el = doc.querySelector('[data-brand="subtitle"]');
    if (el) el.textContent = b.subtitle;
    el = doc.querySelector('[data-brand="logo"]');
    if (el) {
      el.setAttribute("src", b.logo.src);
      el.setAttribute("alt", b.logo.alt);
    }
    el = doc.getElementById("start");
    if (el) el.textContent = b.startLabel;
  };

  window.applyBranding(window.document);
})(window);
