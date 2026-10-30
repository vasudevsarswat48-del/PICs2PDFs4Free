/* Shared behaviour: theme picker + cookie notice. No dependencies. */
(function () {
  var THEMES = ["light", "dark", "ocean", "sunset", "forest", "lavender", "rose"];
  var root = document.documentElement;

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Theme: LIGHT is the default. Only a visitor's own choice changes it.
  var saved = safeGet("theme");
  var theme = THEMES.indexOf(saved) > -1 ? saved : "light";
  root.setAttribute("data-theme", theme);

  document.addEventListener("DOMContentLoaded", function () {
    var picker = document.getElementById("theme-select");
    if (picker) {
      picker.value = theme;
      picker.addEventListener("change", function () {
        root.setAttribute("data-theme", picker.value);
        safeSet("theme", picker.value);
      });
    }

    // Cookie / ads notice
    var banner = document.getElementById("cookie-banner");
    if (banner && !safeGet("cookie-choice")) {
      banner.classList.add("show");
      banner.addEventListener("click", function (e) {
        var c = e.target.getAttribute && e.target.getAttribute("data-choice");
        if (!c) return;
        safeSet("cookie-choice", c);
        banner.classList.remove("show");
        // If you add Google's consent management platform (CMP), wire the choice to it here.
      });
    }
  });
})();
