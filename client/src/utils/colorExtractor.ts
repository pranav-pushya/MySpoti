/**
 * Dynamic Image Color Extraction Utility using HTML Canvas
 * Extracts dominant vibrant RGB/HEX colors from track artwork with memory caching.
 */

export interface ExtractedColor {
  r: number;
  g: number;
  b: number;
  hex: string;
  rgba: (alpha: number) => string;
}

const DEFAULT_COLOR: ExtractedColor = {
  r: 29,
  g: 185,
  b: 84,
  hex: '#1db954',
  rgba: (alpha: number) => `rgba(29, 185, 84, ${alpha})`
};

const colorCache = new Map<string, ExtractedColor>();

export const extractDominantColor = async (imageUrl?: string): Promise<ExtractedColor> => {
  if (!imageUrl) return DEFAULT_COLOR;

  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  return new Promise<ExtractedColor>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve(DEFAULT_COLOR);
          return;
        }

        // Downsample to 24x24 for ultra-fast sampling
        canvas.width = 24;
        canvas.height = 24;
        ctx.drawImage(img, 0, 0, 24, 24);

        const imageData = ctx.getImageData(0, 0, 24, 24).data;
        let rTotal = 0;
        let gTotal = 0;
        let bTotal = 0;
        let sampleCount = 0;

        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          // Ignore transparent or extreme pixels
          if (a < 128) continue;
          const brightness = (r + g + b) / 3;
          if (brightness < 30 || brightness > 230) continue; // Skip near black & near white

          rTotal += r;
          gTotal += g;
          bTotal += b;
          sampleCount++;
        }

        if (sampleCount === 0) {
          // If all pixels were dark or washed out, average all non-transparent pixels
          for (let i = 0; i < imageData.length; i += 4) {
            if (imageData[i + 3] >= 128) {
              rTotal += imageData[i];
              gTotal += imageData[i + 1];
              bTotal += imageData[i + 2];
              sampleCount++;
            }
          }
        }

        if (sampleCount > 0) {
          const r = Math.round(rTotal / sampleCount);
          const g = Math.round(gTotal / sampleCount);
          const b = Math.round(bTotal / sampleCount);
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

          const result: ExtractedColor = {
            r,
            g,
            b,
            hex,
            rgba: (alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`
          };

          colorCache.set(imageUrl, result);
          resolve(result);
        } else {
          resolve(DEFAULT_COLOR);
        }
      } catch {
        resolve(DEFAULT_COLOR);
      }
    };

    img.onerror = () => {
      resolve(DEFAULT_COLOR);
    };

    img.src = imageUrl;
  });
};
