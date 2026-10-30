/* Image -> PDF tool. Everything runs in the visitor's browser; no uploads. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var dropzone = $("dropzone"), input = $("file-input"), list = $("file-list");
  if (!dropzone || !input || !list) return;

  var convertBtn = $("convert-btn"), clearBtn = $("clear-btn"), addMore = $("add-btn");
  var statusEl = $("status"), progress = $("progress"), bar = progress.firstElementChild;
  var items = [];
  var uid = 0;
  var MAX_FILES = 200;
  var MM = 72 / 25.4;

  var PAGE_SIZES = { a4: [210, 297], letter: [215.9, 279.4], legal: [215.9, 355.6], a5: [148, 210], a3: [297, 420] };
  var QUALITY = { high: { max: 3200, q: 0.92 }, medium: { max: 2200, q: 0.8 }, low: { max: 1400, q: 0.6 } };

  function setStatus(msg, isError) {
    statusEl.textContent = msg || "";
    statusEl.classList.toggle("error", !!isError);
  }

  function isImage(file) {
    return /^image\//.test(file.type) || /\.(jpe?g|png|webp|gif|bmp|avif|svg)$/i.test(file.name);
  }

  function addFiles(files) {
    var rejected = 0;
    Array.prototype.forEach.call(files, function (file) {
      if (!isImage(file) || items.length >= MAX_FILES) { rejected++; return; }
      var url = URL.createObjectURL(file);
      items.push({ id: ++uid, file: file, url: url, rot: 0 });
    });
    if (rejected) setStatus(rejected + " file(s) skipped (not an image, or limit of " + MAX_FILES + " reached).", true);
    else setStatus("");
    render();
  }

  function render() {
    list.innerHTML = "";
    items.forEach(function (it, i) {
      var li = document.createElement("li");
      li.className = "file-item";
      li.draggable = true;
      li.dataset.id = it.id;
      li.innerHTML =
        '<span class="index-tag">' + (i + 1) + "</span>" +
        '<div class="thumb"><img alt="" style="transform:rotate(' + it.rot + 'deg)"></div>' +
        '<div class="file-name"></div>' +
        '<div class="file-actions">' +
        '<button type="button" data-a="left" title="Move earlier" aria-label="Move earlier">&larr;</button>' +
        '<button type="button" data-a="rot" title="Rotate 90°" aria-label="Rotate">&#8635;</button>' +
        '<button type="button" data-a="right" title="Move later" aria-label="Move later">&rarr;</button>' +
        '<button type="button" data-a="del" title="Remove" aria-label="Remove">&times;</button></div>';
      li.querySelector("img").src = it.url;
      li.querySelector(".file-name").textContent = it.file.name;
      li.querySelector(".file-name").title = it.file.name;
      list.appendChild(li);
    });
    var has = items.length > 0;
    convertBtn.disabled = !has;
    clearBtn.classList.toggle("hidden", !has);
    addMore.classList.toggle("hidden", !has);
    dropzone.classList.toggle("hidden", has);
    if (has) setStatus(items.length + " image" + (items.length > 1 ? "s" : "") + " ready. Drag to reorder.");
  }

  /* ---------- list interactions ---------- */
  list.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-a]");
    if (!btn) return;
    var id = +btn.closest(".file-item").dataset.id;
    var i = items.findIndex(function (x) { return x.id === id; });
    var a = btn.dataset.a;
    if (a === "del") { URL.revokeObjectURL(items[i].url); items.splice(i, 1); }
    else if (a === "rot") items[i].rot = (items[i].rot + 90) % 360;
    else if (a === "left" && i > 0) { var t = items[i]; items[i] = items[i - 1]; items[i - 1] = t; }
    else if (a === "right" && i < items.length - 1) { var t2 = items[i]; items[i] = items[i + 1]; items[i + 1] = t2; }
    render();
  });

  var dragId = null;
  list.addEventListener("dragstart", function (e) {
    var li = e.target.closest(".file-item"); if (!li) return;
    dragId = +li.dataset.id; li.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(dragId)); } catch (err) {}
  });
  list.addEventListener("dragend", function () { dragId = null; render(); });
  list.addEventListener("dragover", function (e) {
    if (dragId === null) return;
    e.preventDefault();
    var li = e.target.closest(".file-item");
    Array.prototype.forEach.call(list.children, function (c) { c.classList.toggle("drop-target", c === li && +c.dataset.id !== dragId); });
  });
  list.addEventListener("drop", function (e) {
    if (dragId === null) return;
    e.preventDefault(); e.stopPropagation();
    var li = e.target.closest(".file-item"); if (!li) return;
    var from = items.findIndex(function (x) { return x.id === dragId; });
    var to = items.findIndex(function (x) { return x.id === +li.dataset.id; });
    if (from > -1 && to > -1 && from !== to) items.splice(to, 0, items.splice(from, 1)[0]);
    dragId = null; render();
  });

  /* ---------- adding files ---------- */
  dropzone.addEventListener("click", function () { input.click(); });
  dropzone.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  addMore.addEventListener("click", function () { input.click(); });
  input.addEventListener("change", function () { addFiles(input.files); input.value = ""; });
  ["dragenter", "dragover"].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (dragId === null && e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") > -1) {
        e.preventDefault(); dropzone.classList.add("over");
      }
    });
  });
  ["dragleave", "drop"].forEach(function (ev) { document.addEventListener(ev, function () { dropzone.classList.remove("over"); }); });
  document.addEventListener("drop", function (e) {
    if (dragId !== null || !e.dataTransfer || !e.dataTransfer.files.length) return;
    e.preventDefault(); addFiles(e.dataTransfer.files);
  });
  document.addEventListener("paste", function (e) {
    var files = e.clipboardData && e.clipboardData.files;
    if (files && files.length) addFiles(files);
  });
  clearBtn.addEventListener("click", function () {
    items.forEach(function (it) { URL.revokeObjectURL(it.url); });
    items = []; render(); setStatus("");
  });

  /* ---------- conversion ---------- */
  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error("decode")); };
      img.src = url;
    });
  }

  function toJpeg(img, rot, q) {
    var scale = Math.min(1, q.max / Math.max(img.naturalWidth, img.naturalHeight));
    var w = Math.max(1, Math.round(img.naturalWidth * scale));
    var h = Math.max(1, Math.round(img.naturalHeight * scale));
    var swap = rot === 90 || rot === 270;
    var canvas = document.createElement("canvas");
    canvas.width = swap ? h : w; canvas.height = swap ? w : h;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); // transparent PNG -> white
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rot * Math.PI / 180);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) return reject(new Error("encode"));
        blob.arrayBuffer().then(function (buf) {
          resolve({ jpeg: new Uint8Array(buf), imgW: canvas.width, imgH: canvas.height });
        });
      }, "image/jpeg", q.q);
    });
  }

  function layout(img, opts) {
    var margin = opts.margin * MM, pw, ph;
    if (opts.size === "fit") {
      // Page matches the image (96 dpi); margin is added around it.
      pw = img.imgW * 0.75 + margin * 2; ph = img.imgH * 0.75 + margin * 2;
    } else {
      var s = PAGE_SIZES[opts.size];
      var landscape = opts.orient === "landscape" || (opts.orient === "auto" && img.imgW > img.imgH);
      pw = (landscape ? s[1] : s[0]) * MM; ph = (landscape ? s[0] : s[1]) * MM;
    }
    var aw = pw - margin * 2, ah = ph - margin * 2;
    var ratio = Math.min(aw / img.imgW, ah / img.imgH);
    var w = img.imgW * ratio, h = img.imgH * ratio;
    return { pageW: pw, pageH: ph, w: w, h: h, x: (pw - w) / 2, y: (ph - h) / 2 };
  }

  function safeName(n) {
    n = (n || "").replace(/\.pdf$/i, "").replace(/[\\/:*?"<>|]+/g, "").trim();
    return (n || "images") + ".pdf";
  }

  convertBtn.addEventListener("click", function () {
    if (!items.length) return;
    var opts = {
      size: $("opt-size").value, orient: $("opt-orient").value,
      margin: parseFloat($("opt-margin").value) || 0, quality: $("opt-quality").value, name: $("opt-name").value
    };
    var q = QUALITY[opts.quality] || QUALITY.high;
    convertBtn.disabled = true; progress.style.display = "block"; bar.style.width = "0";
    setStatus("Creating your PDF…");

    var pages = [], chain = Promise.resolve();
    items.forEach(function (it, i) {
      chain = chain.then(function () { return loadImage(it.url); })
        .then(function (img) { return toJpeg(img, it.rot, q); })
        .then(function (data) {
          var l = layout(data, opts);
          pages.push({ jpeg: data.jpeg, imgW: data.imgW, imgH: data.imgH, pageW: l.pageW, pageH: l.pageH, x: l.x, y: l.y, w: l.w, h: l.h });
          bar.style.width = Math.round(((i + 1) / items.length) * 100) + "%";
          return new Promise(function (r) { setTimeout(r, 0); }); // keep UI responsive
        })
        .catch(function () { throw new Error("Could not read “" + it.file.name + "”. Remove it and try again (HEIC/RAW files are not supported by most browsers)."); });
    });
    chain.then(function () {
      var blob = PDFWriter.build(pages);
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = safeName(opts.name);
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
      setStatus("Done! Your PDF (" + pages.length + " page" + (pages.length > 1 ? "s" : "") + ", " + (blob.size / 1048576).toFixed(2) + " MB) has been downloaded.");
    }).catch(function (err) {
      setStatus(err.message || "Something went wrong.", true);
    }).then(function () {
      convertBtn.disabled = !items.length;
      setTimeout(function () { progress.style.display = "none"; }, 600);
    });
  });

  render();
})();
