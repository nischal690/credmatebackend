import * as sharp from 'sharp';

export class ImageUtils {
  static async convertToJpeg(imageBuffer: Buffer): Promise<Buffer> {
    return sharp(imageBuffer)
      .jpeg()
      .toBuffer();
  }

  static async validateImage(imageBuffer: Buffer): Promise<void> {
    try {
      await sharp(imageBuffer).metadata();
    } catch (error) {
      throw new Error('Invalid image format');
    }
  }
}
