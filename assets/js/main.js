/* ============================================================
   HSU / Embedded Portfolio — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- nav burger ---------- */
  var burger = document.querySelector(".nav-burger");
  var links = document.querySelector(".nav .links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* ---------- hero boot animation ---------- */
  var bootLines = document.querySelectorAll(".boot-line");
  if (bootLines.length) {
    bootLines.forEach(function (line, i) {
      var delay = line.getAttribute("data-delay") || i * 130;
      setTimeout(function () { line.classList.add("show"); }, parseInt(delay, 10));
    });
    var cursor = document.querySelector(".boot-cursor");
    if (cursor) setTimeout(function () { cursor.classList.add("show"); }, bootLines.length * 130 + 260);
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- lightbox ---------- */
  var shots = Array.prototype.slice.call(document.querySelectorAll("figure.shot:not(.nozoom)"));
  if (shots.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML =
      '<button class="lb-close" aria-label="close">×</button>' +
      '<button class="lb-nav prev" aria-label="previous">‹</button>' +
      '<div class="frame"><img class="lb-img" alt=""><div class="lb-cap"></div></div>' +
      '<button class="lb-nav next" aria-label="next">›</button>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector(".lb-img");
    var lbCap = lb.querySelector(".lb-cap");
    var idx = 0;

    function show(i) {
      idx = (i + shots.length) % shots.length;
      var s = shots[idx];
      var img = s.querySelector("img");
      var cap = s.querySelector("figcaption");
      lbImg.src = img.getAttribute("src");
      lbImg.alt = img.getAttribute("alt") || "";
      lbCap.textContent = cap ? cap.textContent.trim() : "";
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    }
    shots.forEach(function (s, i) {
      s.addEventListener("click", function () { show(i); });
    });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-nav.prev").addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
    lb.querySelector(".lb-nav.next").addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- footer year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- scroll-spy nav (homepage) ---------- */
  var spyLinks = document.querySelectorAll('.nav .links a[href^="#"]');
  if (spyLinks.length) {
    var allIds = ['about', 'projects', 'experience', 'awards', 'skills', 'contact'];
    var spySections = allIds
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    function setActive(id) {
      spyLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    }

    if (spySections.length && "IntersectionObserver" in window) {
      /* 视口中线（50% 处）作为切换线：区块跨过中线即点亮对应导航 */
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) setActive(en.target.id);
        });
      }, { rootMargin: "-50% 0px -50% 0px", threshold: 0 });
      spySections.forEach(function (s) { spy.observe(s); });
    } else if (spySections.length) {
      var ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var pos = window.scrollY + window.innerHeight / 2;
          var current = spySections[0].id;
          spySections.forEach(function (s) { if (s.offsetTop <= pos) current = s.id; });
          setActive(current);
          ticking = false;
        });
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---------- scrollspy: pack-line 长页模块悬浮导航 ---------- */
  var modNav = document.getElementById("mod-scroll");
  if (modNav) {
    var mlinks = Array.prototype.slice.call(modNav.querySelectorAll('a[href^="#"]'));
    var msecs = mlinks
      .map(function (a) {
        var id = a.getAttribute("href").slice(1);
        return document.getElementById(id);
      })
      .filter(Boolean);
    var topNav = document.querySelector(".nav");

    function modUpdate() {
      var stickTop = (topNav ? topNav.offsetHeight : 0) + 10;   /* 与 CSS top 一致 */
      var stuck = modNav.getBoundingClientRect().top <= stickTop + 1;
      if (!stuck) {
        /* 未吸顶（页面顶部）：不亮任何选项 */
        mlinks.forEach(function (l) { l.classList.remove("active"); });
        return;
      }
      /* 已吸顶（跟随滚动）：默认高亮第一项，标题越过视口中线后切换 */
      var probe = window.scrollY + window.innerHeight / 2;
      var current = 0;
      msecs.forEach(function (s, i) {
        if (s.getBoundingClientRect().top + window.scrollY <= probe) current = i;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
        current = msecs.length - 1;
      }
      mlinks.forEach(function (l, i) { l.classList.toggle("active", i === current); });
    }
    window.addEventListener("scroll", modUpdate, { passive: true });
    window.addEventListener("resize", modUpdate, { passive: true });
    modUpdate();
  }

  /* ---------- 主题切换：跟随系统（prefers-color-scheme）+ 手动覆盖 ---------- */
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    var THEME_KEY = "portfolio-theme";
    var moonIco = themeBtn.querySelector(".ico-moon");
    var sunIco = themeBtn.querySelector(".ico-sun");
    function applyTheme(t, persist) {
      document.documentElement.setAttribute("data-theme", t);
      if (moonIco) moonIco.style.display = t === "light" ? "none" : "inline-block";
      if (sunIco) sunIco.style.display = t === "light" ? "inline-block" : "none";
      if (persist !== false) { try { localStorage.setItem(THEME_KEY, t); } catch (e) {} }
    }
    /* 手动选择：点击立即切换并保存（保存后不再跟随系统，直到清除） */
    themeBtn.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(cur);
    });
    /* 跟随系统：未手动选择时，随系统浅色/深色自动切换 */
    var sysLight = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
    var manual = null;
    try { manual = localStorage.getItem(THEME_KEY); } catch (e) {}
    function sysTheme() { return sysLight && sysLight.matches ? "light" : "dark"; }
    applyTheme(manual || sysTheme(), true);
    if (sysLight && sysLight.addEventListener) {
      sysLight.addEventListener("change", function () {
        if (!manual) applyTheme(sysTheme(), true);
      });
    }
  }
})();