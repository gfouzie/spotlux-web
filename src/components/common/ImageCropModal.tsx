'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import Modal from './Modal';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  aspectRatio?: number; // Default 1 for square/circle
  cropShape?: 'rect' | 'round'; // Default 'round' for profile pictures
}

/**
 * Modal for cropping images before upload
 * Uses react-easy-crop for zoom/pan functionality
 */
export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatio = 1,
  cropShape = 'round',
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaChange = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crop Image"
      size="lg"
      showFooter
      confirmText={isProcessing ? 'Processing...' : 'Confirm'}
      cancelText="Cancel"
      onConfirm={handleConfirm}
      onCancel={onClose}
      confirmDisabled={isProcessing}
      cancelDisabled={isProcessing}
      confirmLoading={isProcessing}
    >
      <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          cropShape={cropShape}
          showGrid={false}
          restrictPosition={false}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaChange}
        />
      </div>

      {/* Zoom Slider */}
      <div className="mt-6">
        <label className="block text-text-col text-sm mb-2">Zoom</label>
        <input
          type="range"
          min={0.3}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full h-2 bg-component-col rounded-lg appearance-none cursor-pointer accent-accent-col"
        />
      </div>
    </Modal>
  );
}

/**
 * Creates a cropped image blob from the source image and crop area
 * Handles cases where image is zoomed out and adds black bars
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to the crop area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Fill canvas with black background (for areas outside the image)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate the portion of the crop area that contains the actual image
  const sourceX = Math.max(0, pixelCrop.x);
  const sourceY = Math.max(0, pixelCrop.y);
  const sourceWidth = Math.min(
    image.width - sourceX,
    pixelCrop.width - Math.max(0, -pixelCrop.x)
  );
  const sourceHeight = Math.min(
    image.height - sourceY,
    pixelCrop.height - Math.max(0, -pixelCrop.y)
  );

  // Calculate destination position on canvas (offset if crop area extends beyond image)
  const destX = Math.max(0, -pixelCrop.x);
  const destY = Math.max(0, -pixelCrop.y);

  // Draw the image portion onto the canvas
  if (sourceWidth > 0 && sourceHeight > 0) {
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      destX,
      destY,
      sourceWidth,
      sourceHeight
    );
  }

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg');
  });
}

/**
 * Creates an image element from a source URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}
