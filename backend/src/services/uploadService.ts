import cloudinary from '@config/cloudinary';
import { Readable } from 'stream';

/**
 * Upload Service – Cloudinary image management
 */
export class UploadService {
    /**
     * Upload a single image to Cloudinary
     */
    static async uploadImage(
        file: Express.Multer.File,
        folder = 'guigui/products'
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

            // Convert buffer to stream
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
     * Delete an image from Cloudinary by public ID
     */
    static async deleteImage(publicId: string): Promise<boolean> {
        try {
            await cloudinary.uploader.destroy(publicId);
            return true;
        } catch (error) {
            console.error('❌ Cloudinary delete failed:', error);
            return false;
        }
    }
}
