// Wraps every <table> in a horizontally-scrollable container so wide
// tables (common in math-heavy posts) don't break mobile layout by
// overflowing the viewport.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("table").forEach(function (table) {
      if (table.parentElement && table.parentElement.classList.contains("table-scroll")) return;
      var wrapper = document.createElement("div");
      wrapper.className = "table-scroll";
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  });
})();
