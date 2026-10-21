/* Transparent PNG conversion for the two existing brand logos.
   Keeps the original logo artwork and removes only its white rectangle. */
(() => {
  const cache = new Map();
  const process = async (el) => {
    if (el.dataset.transparentLogo === "yes" || el.dataset.transparentLogo === "working") return;
    const original = el.getAttribute("src") || "";
    if (!original.startsWith("data:image/webp;base64,")) return;
    el.dataset.transparentLogo = "working";
    try {
      if (!cache.has(original)) {
        const img = new Image();
        img.src = original;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d", {willReadFrequently:true});
        ctx.drawImage(img, 0, 0);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;
        for (let i=0;i<data.length;i+=4) {
          const r=data[i],g=data[i+1],b=data[i+2];
          const lo=Math.min(r,g,b),hi=Math.max(r,g,b);
          // Neutral white/off-white background; preserve colored lettering.
          if (lo>225 && hi-lo<13) {
            const alpha=Math.max(0,Math.min(255,Math.round((248-lo)*15)));
            data[i+3]=Math.min(data[i+3],alpha);
          }
        }
        ctx.putImageData(frame,0,0);
        cache.set(original,canvas.toDataURL("image/png"));
      }
      el.src=cache.get(original);
      el.dataset.transparentLogo="yes";
    } catch (e) {
      el.dataset.transparentLogo="error";
    }
  };
  const scan=()=>document.querySelectorAll("img.brand-logo").forEach(process);
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",scan);
  else scan();
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
})();
