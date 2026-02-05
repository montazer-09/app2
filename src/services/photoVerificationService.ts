// Photo Verification Service - Simplified version without heavy TensorFlow.js
// For production, you can uncomment the TensorFlow code below

// import * as tf from '@tensorflow/tfjs';
// import * as mobilenet from '@tensorflow-models/mobilenet';

import type { VerificationResult } from '@/types';

class PhotoVerificationService {
  // private model: mobilenet.MobileNet | null = null;
  // private isLoading = false; // Uncomment when using TensorFlow.js
  private referencePhotoUrl: string | null = null;

  async initialize(): Promise<boolean> {
    // Simplified version - skip heavy model loading
    // Uncomment below for full TensorFlow.js support:
    /*
    if (this.model) return true;
    if (this.isLoading) return false;

    this.isLoading = true;
    try {
      await tf.setBackend('webgl');
      this.model = await mobilenet.load();
      console.log('MobileNet model loaded');
      return true;
    } catch (error) {
      console.error('Error loading MobileNet model:', error);
      return false;
    } finally {
      this.isLoading = false;
    }
    */
    console.log('Photo verification service initialized (simplified mode)');
    return true;
  }

  async setReferencePhoto(photoUrl: string): Promise<boolean> {
    this.referencePhotoUrl = photoUrl;
    return true;
  }

  async verifyPhoto(photoUrl: string, threshold: number = 0.85): Promise<VerificationResult> {
    // Simplified pixel-based comparison
    try {
      const similarity = await this.comparePixels(this.referencePhotoUrl || '', photoUrl);
      const isSimilar = similarity >= threshold;

      return {
        isSimilar,
        similarity,
        pixelSimilarity: similarity,
      };
    } catch (error) {
      console.error('Error verifying photo:', error);
      return {
        isSimilar: false,
        similarity: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async comparePixels(refUrl: string, capturedUrl: string): Promise<number> {
    if (!refUrl) return 0;
    
    const [refImg, capImg] = await Promise.all([
      this.loadImageElement(refUrl),
      this.loadImageElement(capturedUrl),
    ]);

    // Create canvases for processing
    const refCanvas = document.createElement('canvas');
    const capCanvas = document.createElement('canvas');
    const size = 100;
    
    refCanvas.width = size;
    refCanvas.height = size;
    capCanvas.width = size;
    capCanvas.height = size;

    const refCtx = refCanvas.getContext('2d')!;
    const capCtx = capCanvas.getContext('2d')!;

    refCtx.drawImage(refImg, 0, 0, size, size);
    capCtx.drawImage(capImg, 0, 0, size, size);

    const refData = refCtx.getImageData(0, 0, size, size).data;
    const capData = capCtx.getImageData(0, 0, size, size).data;

    // Calculate histogram similarity
    return this.calculateHistogramSimilarity(refData, capData);
  }

  private loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private calculateHistogramSimilarity(a: Uint8ClampedArray, b: Uint8ClampedArray): number {
    const bins = 16;
    const histA = new Array(bins * 3).fill(0);
    const histB = new Array(bins * 3).fill(0);

    for (let i = 0; i < a.length; i += 4) {
      const rBin = Math.floor(a[i] / (256 / bins));
      const gBin = Math.floor(a[i + 1] / (256 / bins));
      const bBin = Math.floor(a[i + 2] / (256 / bins));

      histA[rBin]++;
      histA[bins + gBin]++;
      histA[bins * 2 + bBin]++;

      const rBinB = Math.floor(b[i] / (256 / bins));
      const gBinB = Math.floor(b[i + 1] / (256 / bins));
      const bBinB = Math.floor(b[i + 2] / (256 / bins));

      histB[rBinB]++;
      histB[bins + gBinB]++;
      histB[bins * 2 + bBinB]++;
    }

    // Normalize
    const totalPixels = a.length / 4;
    for (let i = 0; i < histA.length; i++) {
      histA[i] /= totalPixels;
      histB[i] /= totalPixels;
    }

    // Calculate cosine similarity
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < histA.length; i++) {
      dotProduct += histA[i] * histB[i];
      normA += histA[i] * histA[i];
      normB += histB[i] * histB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  reset(): void {
    this.referencePhotoUrl = null;
  }

  isReady(): boolean {
    return this.referencePhotoUrl !== null;
  }
}

export const photoVerificationService = new PhotoVerificationService();
