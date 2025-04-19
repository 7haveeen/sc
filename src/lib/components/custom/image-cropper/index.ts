type ImageSrc = string | File;

type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type FlipConfig = {
  horizontal: boolean;
  vertical: boolean;
};

type Size = {
  width: number;
  height: number;
};

type ResizeOptions = {
  width: number;
  height: number;
  quality: number;
  maintainAspectRatio?: boolean;
};

const DEFAULT_RESIZE_OPTIONS: ResizeOptions = {
  width: 500,
  height: 500,
  quality: 1.0,
  maintainAspectRatio: true,
};

function createImage(source: ImageSrc): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = e => (img.src = e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
    else {
      img.src = source;
    }
  });
}

const getRadianAngle = (deg: number) => (deg * Math.PI) / 180;

function rotateSize(w: number, h: number, rot: number): Size {
  const r = getRadianAngle(rot);
  const [c, s] = [Math.abs(Math.cos(r)), Math.abs(Math.sin(r))];
  return { width: c * w + s * h, height: s * w + c * h };
}

async function resizeImage(source: ImageSrc, opts: Partial<ResizeOptions> = {}): Promise<string> {
  const options = { ...DEFAULT_RESIZE_OPTIONS, ...opts };
  const img = await createImage(source);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx)
    throw new Error("Failed to get canvas context");

  let targetWidth = options.width;
  let targetHeight = options.height;

  if (options.maintainAspectRatio) {
    const sourceAspectRatio = img.width / img.height;
    const targetAspectRatio = targetWidth / targetHeight;

    if (sourceAspectRatio > targetAspectRatio) {
      targetHeight = targetWidth / sourceAspectRatio;
    }
    else {
      targetWidth = targetHeight * sourceAspectRatio;
    }
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL("image/jpeg", options.quality);
}

async function getCroppedImg(src: ImageSrc, crop: CropArea, rot = 0, flip: FlipConfig = { horizontal: false, vertical: false }): Promise<string | null> {
  const img = await createImage(src);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx)
    return null;

  const { width, height } = rotateSize(img.width, img.height, rot);
  Object.assign(canvas, { width, height });

  ctx.translate(width / 2, height / 2);
  ctx.rotate(getRadianAngle(rot));
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-img.width / 2, -img.height / 2);
  ctx.drawImage(img, 0, 0);
  ctx.imageSmoothingQuality = "high";

  const out = document.createElement("canvas");
  const outCtx = out.getContext("2d");
  if (!outCtx)
    return null;

  Object.assign(out, crop);
  outCtx.drawImage(canvas, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

  return new Promise(resolve =>
    out.toBlob(blob => blob && resolve(URL.createObjectURL(blob)), "image/jpeg"),
  );
}

export {
  createImage,
  type CropArea,
  type FlipConfig,
  getRadianAngle,
  type ImageSrc,
  resizeImage,
  type ResizeOptions,
  rotateSize,
  type Size,
};

export default getCroppedImg;
