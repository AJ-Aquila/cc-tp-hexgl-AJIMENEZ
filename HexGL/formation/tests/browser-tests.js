/* Tests du code existant HexGL, sans Node.js. QUnit est chargé localement. */
(function () {
  "use strict";
  if (typeof QUnit === "undefined") {
    document.documentElement.dataset.testStatus = "fail";
    document.documentElement.dataset.testCount = "0";
    document.documentElement.dataset.testFailures = "1";
    document.body.insertAdjacentHTML("afterbegin", "<p style='color:red'>QUnit introuvable : vérifiez le fichier vendor/qunit-2.26.0.js</p>");
    return;
  }

  // Compatible avec le script Chrome headless existant : état mesurable dans le DOM.
  QUnit.done(function (result) {
    const count = result.total;
    const failed = result.failed;
    const root = document.documentElement;
    root.setAttribute("data-test-count", String(count));
    root.setAttribute("data-test-failures", String(failed));
    root.setAttribute("data-test-status", failed === 0 && count >= 4 ? "pass" : "fail");
    let summary = document.getElementById("summary");
    if (!summary) {
      summary = document.createElement("p");
      summary.id = "summary";
      document.body.appendChild(summary);
    }
    summary.textContent = count + " test(s) : " + (count - failed) + " réussi(s), " + failed + " échec(s).";
  });

  const U = window.bkcore && window.bkcore.Utils;
  QUnit.module("HexGL — bkcore.Utils", function () {
    QUnit.test("updateClass ajoute une classe", function (assert) {
      assert.ok(U, "Utils.js chargé");
      const e = document.createElement("div");
      e.id = "test-hexgl-add";
      document.getElementById("qunit-fixture").appendChild(e);
      U.updateClass(e.id, "active", true);
      assert.true(e.classList.contains("active"));
    });
    QUnit.test("updateClass supprime une classe", function (assert) {
      assert.ok(U, "Utils.js chargé");
      const e = document.createElement("div");
      e.id = "test-hexgl-remove";
      e.className = "active";
      document.getElementById("qunit-fixture").appendChild(e);
      U.updateClass(e.id, "active", false);
      assert.false(e.classList.contains("active"));
    });
    QUnit.test("getOffsetTop additionne les décalages parent/enfant", function (assert) {
      const parent = {
        offsetTop: 37,
        offsetParent: null
      };
      const enfant = {
        offsetTop: 13,
        offsetParent: parent
      };
      assert.strictEqual(U.getOffsetTop(enfant), 50);
    });
    QUnit.test("getURLParameter lit les paramètres d'URL", function (assert) {
      assert.ok(U, "Utils.js chargé");
      U.URLParameters = null;
      const url = new URL(window.location.href);
      url.searchParams.set("hexgl_poc", "ok");
      // Le lanceur fournit hexgl_poc=ok ; en ouverture directe, on teste l'absence ou la présence.
      const expected = window.location.search.includes("hexgl_poc=ok") ? "ok" : null;
      assert.strictEqual(U.getURLParameter("hexgl_poc"), expected);
    });
  });

  // Comportements actuels de Timer, volontairement figés avant refactoring (hors rendu/WebGL).
  const T = window.bkcore && window.bkcore.Timer;
  QUnit.module("HexGL — bkcore.Timer", function () {
    QUnit.test("msToTime décompose h/m/s/ms", function (assert) {
      assert.ok(T, "Timer.js chargé");
      assert.deepEqual(T.msToTime(3723004), { h: 1, m: 2, s: 3, ms: 4 });
      assert.deepEqual(T.msToTime(0), { h: 0, m: 0, s: 0, ms: 0 });
    });
    QUnit.test("msToTimeString complète avec des zéros (ms sur 4 chiffres)", function (assert) {
      assert.deepEqual(T.msToTimeString(65432), { h: "00", m: "01", s: "05", ms: "0432" });
    });
    QUnit.test("zfill complète sans tronquer", function (assert) {
      assert.strictEqual(T.zfill(5, 3), "005");
      assert.strictEqual(T.zfill(1234, 2), "1234");
    });
    QUnit.test("getElapsedTime renvoie un temps formaté à 0 juste après start", function (assert) {
      const t = new T();
      assert.false(t.active, "inactif par défaut");
      t.start();
      assert.true(t.active);
      assert.strictEqual(t.time.elapsed, 0);
      assert.deepEqual(t.getElapsedTime(), { h: 0, m: 0, s: 0, ms: 0 });
    });
    QUnit.test("pause bloque update, reprise la réactive", function (assert) {
      const t = new T();
      t.start();
      t.pause(true);
      t.time.elapsed = 123;
      t.update();
      assert.strictEqual(t.time.elapsed, 123, "update sans effet en pause");
      t.pause(false);
      assert.true(t.active);
    });
  });

  // Utils : cas non couverts plus haut.
  QUnit.module("HexGL — bkcore.Utils (compléments)", function () {
    QUnit.test("updateClass ignore un id inexistant sans erreur", function (assert) {
      U.updateClass("id-qui-nexiste-pas", "active", true);
      assert.ok(true, "pas d'exception");
    });
    QUnit.test("getURLParameter renvoie undefined pour un paramètre absent", function (assert) {
      U.URLParameters = null;
      assert.strictEqual(U.getURLParameter("parametre_absent_xyz"), undefined);
    });
    QUnit.test("isTouchDevice renvoie un booléen", function (assert) {
      assert.strictEqual(typeof U.isTouchDevice(), "boolean");
    });
  });

  // Branding ACME : document isolé, pas de WebGL ni de DOM de jeu.
  QUnit.module("HexGL — branding ACME", function () {
    function brandedDoc() {
      const d = document.implementation.createHTMLDocument("");
      d.body.innerHTML = '<img data-brand="logo"><h1 data-brand="welcome"></h1>' +
        '<p data-brand="subtitle"></p><div id="start">Start</div>';
      window.applyBranding(d);
      return d;
    }
    QUnit.test("applyBranding pose message, bouton et logo", function (assert) {
      const d = brandedDoc();
      assert.strictEqual(d.querySelector('[data-brand="welcome"]').textContent, "Bienvenue au ACME Racing Challenge");
      assert.strictEqual(d.getElementById("start").textContent, "Démarrer la course");
      const logo = d.querySelector('[data-brand="logo"]');
      assert.ok(logo.getAttribute("src"), "src non vide");
      assert.ok(logo.getAttribute("alt"), "alt non vide");
    });
    QUnit.test("applyBranding pose exactement les 6 couleurs de la charte", function (assert) {
      const s = brandedDoc().documentElement.style;
      assert.deepEqual({
        bg: s.getPropertyValue("--brand-bg"), violet: s.getPropertyValue("--brand-violet"),
        blue: s.getPropertyValue("--brand-blue"), cyan: s.getPropertyValue("--brand-cyan"),
        text: s.getPropertyValue("--brand-text"), surface: s.getPropertyValue("--brand-surface")
      }, {
        bg: "#08090D", violet: "#7628FF", blue: "#315BFF",
        cyan: "#00C4E8", text: "#FFFFFF", surface: "#E6E8EE"
      });
    });
    QUnit.test("applyBranding ignore un document sans emplacements", function (assert) {
      window.applyBranding(document.implementation.createHTMLDocument(""));
      assert.ok(true, "pas d'exception");
    });
  });
})();
