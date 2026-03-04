import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { UploadService } from '@services/uploadService';
import { sendSuccess, sendError } from '@utils/responses';

/**
 * Multer config – memory storage for Cloudinary streaming
 */
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 5, // Max 5 files at once
    },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format image non supporté (JPEG, PNG, WebP uniquement)'));
        }
    },
});

/**
 * Upload Controller
 */
export class UploadController {
    /**
     * Upload a single product image
     */
    static async uploadSingle(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                sendError(res, 400, 'Aucune image fournie');
                return;
            }

            const folder = (req.query.folder as string) || 'guigui/products';
            const result = await UploadService.uploadImage(req.file, folder);

            sendSuccess(res, 201, 'Image uploadée', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Upload multiple images
     */
    static async uploadMultiple(req: Request, res: Response, next: NextFunction) {
        try {
            const files = req.files as Express.Multer.File[];
            if (!files || files.length === 0) {
                sendError(res, 400, 'Aucune image fournie');
                return;
            }

            const folder = (req.query.folder as string) || 'guigui/products';
            const results = await UploadService.uploadMultiple(files, folder);

            sendSuccess(res, 201, 'Images uploadées', { images: results });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete an image by public ID
     */
    static async deleteImage(req: Request, res: Response, next: NextFunction) {
        try {
            const { publicId } = req.params;
            const success = await UploadService.deleteImage(publicId);
            if (!success) {
                sendError(res, 500, 'Erreur lors de la suppression');
                return;
            }
            sendSuccess(res, 200, 'Image supprimée');
        } catch (error) {
            next(error);
        }
    }
}
