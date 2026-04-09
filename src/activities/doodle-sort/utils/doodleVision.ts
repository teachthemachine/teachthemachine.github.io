export interface DoodleVisionSnapshot {
  pixelatedDataUrl: string;
  inkCoverage: number;
}

const MODEL_VIEW_SIZE = 28;
const MODEL_VIEW_SCALE = 6;

function renderVisionSnapshot(source: CanvasImageSource): DoodleVisionSnapshot {
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = MODEL_VIEW_SIZE;
  sourceCanvas.height = MODEL_VIEW_SIZE;
  const sourceCtx = sourceCanvas.getContext('2d');

  if (!sourceCtx) {
    return {
      pixelatedDataUrl: '',
      inkCoverage: 0,
    };
  }

  sourceCtx.fillStyle = 'white';
  sourceCtx.fillRect(0, 0, MODEL_VIEW_SIZE, MODEL_VIEW_SIZE);
  sourceCtx.drawImage(source, 0, 0, MODEL_VIEW_SIZE, MODEL_VIEW_SIZE);

  const imageData = sourceCtx.getImageData(0, 0, MODEL_VIEW_SIZE, MODEL_VIEW_SIZE);
  const { data } = imageData;
  let darknessTotal = 0;

  for (let i = 0; i < data.length; i += 4) {
    const grayscale = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    const boosted = grayscale > 240 ? 255 : grayscale < 35 ? 0 : grayscale;
    data[i] = boosted;
    data[i + 1] = boosted;
    data[i + 2] = boosted;
    darknessTotal += 255 - boosted;
  }

  sourceCtx.putImageData(imageData, 0, 0);

  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = MODEL_VIEW_SIZE * MODEL_VIEW_SCALE;
  previewCanvas.height = MODEL_VIEW_SIZE * MODEL_VIEW_SCALE;
  const previewCtx = previewCanvas.getContext('2d');

  if (!previewCtx) {
    return {
      pixelatedDataUrl: sourceCanvas.toDataURL('image/png'),
      inkCoverage: darknessTotal / (MODEL_VIEW_SIZE * MODEL_VIEW_SIZE * 255),
    };
  }

  previewCtx.fillStyle = 'white';
  previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewCtx.imageSmoothingEnabled = false;
  previewCtx.drawImage(sourceCanvas, 0, 0, previewCanvas.width, previewCanvas.height);

  return {
    pixelatedDataUrl: previewCanvas.toDataURL('image/png'),
    inkCoverage: darknessTotal / (MODEL_VIEW_SIZE * MODEL_VIEW_SIZE * 255),
  };
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load doodle image.'));
    image.src = dataUrl;
  });
}

export function createVisionSnapshotFromCanvas(canvas: HTMLCanvasElement): DoodleVisionSnapshot {
  return renderVisionSnapshot(canvas);
}

export async function createVisionSnapshotFromDataUrl(dataUrl: string): Promise<DoodleVisionSnapshot> {
  const image = await loadImage(dataUrl);
  return renderVisionSnapshot(image);
}
