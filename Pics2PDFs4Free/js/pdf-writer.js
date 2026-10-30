/*
 * Minimal dependency-free PDF writer: one JPEG image per page.
 * Usage: PDFWriter.build([{ jpeg: Uint8Array, imgW, imgH, pageW, pageH, x, y, w, h }]) -> Blob
 * All page/placement values are in PDF points (1 pt = 1/72 inch).
 */
(function (global) {
  var enc = new TextEncoder();

  function build(pages) {
    var chunks = [];
    var offsets = [];
    var length = 0;

    function push(data) {
      var bytes = typeof data === "string" ? enc.encode(data) : data;
      chunks.push(bytes);
      length += bytes.length;
    }
    function startObj(n) { offsets[n] = length; push(n + " 0 obj\n"); }
    function f(n) { return (Math.round(n * 100) / 100).toString(); }

    // Object numbering: 1 = catalog, 2 = pages tree, then per page: page, content, image
    var total = 2 + pages.length * 3;
    push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

    startObj(1);
    push("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

    var kids = pages.map(function (_, i) { return (3 + i * 3) + " 0 R"; }).join(" ");
    startObj(2);
    push("<< /Type /Pages /Kids [" + kids + "] /Count " + pages.length + " >>\nendobj\n");

    pages.forEach(function (p, i) {
      var pageNo = 3 + i * 3, contentNo = pageNo + 1, imageNo = pageNo + 2;

      startObj(pageNo);
      push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + f(p.pageW) + " " + f(p.pageH) + "] " +
        "/Resources << /XObject << /Im0 " + imageNo + " 0 R >> /ProcSet [/PDF /ImageC] >> " +
        "/Contents " + contentNo + " 0 R >>\nendobj\n");

      var stream = "q\n" + f(p.w) + " 0 0 " + f(p.h) + " " + f(p.x) + " " + f(p.y) + " cm\n/Im0 Do\nQ\n";
      startObj(contentNo);
      push("<< /Length " + stream.length + " >>\nstream\n" + stream + "endstream\nendobj\n");

      startObj(imageNo);
      push("<< /Type /XObject /Subtype /Image /Width " + p.imgW + " /Height " + p.imgH +
        " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + p.jpeg.length + " >>\nstream\n");
      push(p.jpeg);
      push("\nendstream\nendobj\n");
    });

    var xrefPos = length;
    var xref = "xref\n0 " + (total + 1) + "\n0000000000 65535 f \n";
    for (var n = 1; n <= total; n++) {
      xref += ("0000000000" + offsets[n]).slice(-10) + " 00000 n \n";
    }
    push(xref);
    push("trailer\n<< /Size " + (total + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefPos + "\n%%EOF\n");

    return new Blob(chunks, { type: "application/pdf" });
  }

  global.PDFWriter = { build: build };
})(window);
