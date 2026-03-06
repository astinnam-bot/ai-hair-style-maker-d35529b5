export async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank');
  }
}

export async function downloadImageWithWatermark(url: string, filename: string, watermarkText: string = "HAIR MODEL AI") {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Watermark settings
    const fontSize = Math.max(img.width * 0.06, 24);
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw repeating diagonal watermarks
    const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
    const step = fontSize * 5;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 6); // -30 degrees

    for (let y = -diagonal; y < diagonal; y += step) {
      for (let x = -diagonal; x < diagonal; x += step) {
        ctx.fillText(watermarkText, x, y);
        ctx.strokeText(watermarkText, x, y);
      }
    }
    ctx.restore();

    // Export
    canvas.toBlob((blob) => {
      if (!blob) return;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, "image/jpeg", 0.92);
  } catch {
    window.open(url, "_blank");
  }
}
