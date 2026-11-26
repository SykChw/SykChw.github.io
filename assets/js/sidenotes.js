// Moves Kramdown's auto-generated footnotes (.footnotes list at the bottom
// of the post) into a right-hand margin column, positioned next to their
// reference point in the text — Distill/Tufte-style sidenotes.
// On narrow screens the CSS falls back to showing the normal footnote list
// at the bottom instead (see main.css media query).
(function () {
  function reRenderMath(el) {
    if (window.MathJax && window.MathJax.typesetPromise) {
      // Safe to call repeatedly / on overlapping content: MathJax tracks
      // already-typeset math internally and only processes new math each
      // call (see "Updating Previously Typeset Content" in MathJax v3 docs).
      return window.MathJax.typesetPromise([el]).catch(function () {});
    }
    return Promise.resolve();
  }

  function reRenderMermaid() {
    if (window.__mermaidRun) {
      try {
        var result = window.__mermaidRun();
        return result && result.then ? result : Promise.resolve();
      } catch (e) {
        return Promise.resolve();
      }
    }
    return Promise.resolve();
  }

  function resolveCollisions(sideCol) {
    // Must run AFTER math/mermaid have finished rendering inside the
    // sidenotes -- otherwise this measures the height of raw "$x$" text or
    // mermaid source lines instead of the actual typeset/rendered output,
    // and notes containing math or diagrams will visually overlap.
    var notes = Array.prototype.slice.call(sideCol.querySelectorAll(".sidenote"));
    notes.sort(function (a, b) { return parseFloat(a.style.top) - parseFloat(b.style.top); });
    var minGap = 12;
    var lastBottom = -Infinity;
    notes.forEach(function (n) {
      var top = parseFloat(n.style.top);
      if (top < lastBottom + minGap) {
        top = lastBottom + minGap;
        n.style.top = top + "px";
      }
      lastBottom = top + n.getBoundingClientRect().height;
    });
  }

  function init() {
    if (window.innerWidth <= 980) return; // mobile: keep normal footnotes

    var body = document.getElementById("post-body");
    var sideCol = document.getElementById("sidenote-column");
    if (!body || !sideCol) return;

    var footnoteList = body.querySelector(".footnotes ol");
    if (!footnoteList) return;

    var refs = body.querySelectorAll('a[href^="#fn:"]');
    var wrapEl = document.querySelector(".post-body-wrap");
    if (!wrapEl) return;
    var wrapRect = wrapEl.getBoundingClientRect();

    refs.forEach(function (ref) {
      var fnId = ref.getAttribute("href").substring(1); // "fn:1"
      var li = body.querySelector("#" + fnId.replace(/:/g, "\\:"));
      if (!li) return;

      var note = document.createElement("div");
      note.className = "sidenote";

      var num = document.createElement("span");
      num.className = "sidenote-number";
      num.textContent = ref.textContent + ".";
      note.appendChild(num);

      // Clone footnote content (strip the backref arrow link)
      var contentSpan = document.createElement("span");
      contentSpan.innerHTML = li.innerHTML;
      var backref = contentSpan.querySelector('a[href^="#fnref"]');
      if (backref) backref.remove();
      note.appendChild(contentSpan);

      var refRect = ref.getBoundingClientRect();
      note.style.top = (refRect.top - wrapRect.top) + "px";

      sideCol.appendChild(note);
    });

    // Render math and diagrams inside the cloned sidenotes BEFORE measuring
    // heights for collision resolution, so the overlap check sees real
    // rendered sizes, not raw source text.
    Promise.all([reRenderMath(sideCol), reRenderMermaid()]).then(function () {
      resolveCollisions(sideCol);
    });
  }

  // Run after layout settles (fonts/images can shift heading positions)
  window.addEventListener("load", function () {
    setTimeout(init, 50);
  });
})();
