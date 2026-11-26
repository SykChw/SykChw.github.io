// Client-side tag filter + text search for the blog index page.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var searchBox = document.getElementById("blog-search");
    var tagBar = document.getElementById("tag-filter-bar");
    var items = Array.prototype.slice.call(document.querySelectorAll(".post-list-item"));
    if (items.length === 0) return;

    var activeTag = null;

    function apply() {
      var query = (searchBox ? searchBox.value : "").toLowerCase().trim();
      items.forEach(function (item) {
        var text = item.getAttribute("data-search") || "";
        var tags = (item.getAttribute("data-tags") || "").split(",");
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesTag = !activeTag || tags.indexOf(activeTag) !== -1;
        item.style.display = matchesQuery && matchesTag ? "" : "none";
      });
    }

    if (searchBox) searchBox.addEventListener("input", apply);

    if (tagBar) {
      tagBar.addEventListener("click", function (e) {
        var pill = e.target.closest(".tag-pill");
        if (!pill) return;
        var tag = pill.getAttribute("data-tag");
        var pills = tagBar.querySelectorAll(".tag-pill");
        if (activeTag === tag) {
          activeTag = null;
          pills.forEach(function (p) { p.classList.remove("active"); });
        } else {
          activeTag = tag;
          pills.forEach(function (p) { p.classList.toggle("active", p === pill); });
        }
        apply();
      });
    }
  });
})();
