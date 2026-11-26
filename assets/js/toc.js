// Auto-generates a nested table of contents from headings inside #post-body.
// No manual anchors needed — headings get slugified ids on the fly.
(function () {
  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.getElementById("post-body");
    var tocNav = document.getElementById("toc-nav");
    var tocBox = document.getElementById("toc-box");
    if (!body || !tocNav) return;

    var headings = body.querySelectorAll("h1, h2, h3, h4");
    if (headings.length === 0) {
      if (tocBox) tocBox.style.display = "none";
      return;
    }

    var usedIds = {};
    var rootUl = document.createElement("ul");
    var stack = [{ level: 1, ul: rootUl }];

    headings.forEach(function (h) {
      var level = parseInt(h.tagName.substring(1), 10);
      var text = h.textContent;
      var base = slugify(text) || "section";
      var id = base;
      var n = 1;
      while (usedIds[id]) {
        id = base + "-" + (++n);
      }
      usedIds[id] = true;
      h.id = id;

      while (stack.length && level < stack[stack.length - 1].level) {
        stack.pop();
      }
      if (stack.length === 0) {
        stack.push({ level: level, ul: rootUl });
      }
      var top = stack[stack.length - 1];

      if (level > top.level) {
        var newUl = document.createElement("ul");
        var lastLi = top.ul.lastElementChild;
        if (lastLi) {
          lastLi.appendChild(newUl);
        } else {
          top.ul.appendChild(newUl);
        }
        stack.push({ level: level, ul: newUl });
        top = stack[stack.length - 1];
      }

      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + id;
      a.textContent = text;
      li.appendChild(a);
      top.ul.appendChild(li);
    });

    tocNav.appendChild(rootUl);
  });
})();
