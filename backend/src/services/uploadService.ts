import cloudinary from '@config/cloudinary';
import { config } from '@config/env';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

/**
 * Check if Cloudinary is configured
 */
function isCloudinaryConfigured(): boolean {
  return !!(config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret);
}

/**
 * Upload Service – Local storage (dev) or Cloudinary (prod)
 */
export class UploadService {
    /**
     * Upload a single image
     */
    static async uploadImage(
        file: Express.Multer.File,
        folder = 'guigui/products'
    ): Promise<{ url: string; publicId: string }> {
        if (isCloudinaryConfigured()) {
            return this.uploadToCloudinary(file, folder);
        }
        return this.uploadToLocal(file, folder);
    }

    /**
     * Upload to local filesystem
     */
    private static async uploadToLocal(
        file: Express.Multer.File,
        folder: string
    ): Promise<{ url: string; publicId: string }> {
        const subDir = folder.replace(/\//g, path.sep);
        const destDir = path.join(UPLOADS_DIR, subDir);
        fs.mkdirSync(destDir, { recursive: true });

        const ext = path.extname(file.originalname) || '.jpg';
        const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
        const filePath = path.join(destDir, uniqueName);

        fs.writeFileSync(filePath, file.buffer);

        const publicId = `${folder}/${uniqueName}`;
        const url = `${config.server.apiBaseUrl}/uploads/${folder}/${uniqueName}`;

        return { url, publicId };
    }

    /**
     * Upload to Cloudinary
     */
    private static uploadToCloudinary(
        file: Express.Multer.File,
        folder: string
    ): Promise<{ url: string; publicId: string }> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'image',
                    transformation: [
                        { width: 800, height: 800, crop: 'limit', quality: 'auto', format: 'webp' },
                    ],
                },
                (error, result) => {
                    if (error || !result) {
                        reject(error || new Error('Upload failed'));
                        return;
                    }
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                }
            );

            const readable = new Readable();
            readable.push(file.buffer);
            readable.push(null);
            readable.pipe(uploadStream);
        });
    }

    /**
     * Upload multiple images
     */
    static async uploadMultiple(
        files: Express.Multer.File[],
        folder = 'guigui/products'
    ): Promise<Array<{ url: string; publicId: string }>> {
        const results = await Promise.all(
            files.map((file) => this.uploadImage(file, folder))
        );
        return results;
    }

    /**
     * Delete an image
     */
    static async deleteImage(publicId: string): Promise<boolean> {
        try {
            if (isCloudinaryConfigured()) {
                await cloudinary.uploader.destroy(publicId);
            } else {
                const filePath = path.join(UPLOADS_DIR, publicId);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return true;
        } catch (error) {
            console.error('❌ Delete failed:', error);
            return false;
        }
    }
}
