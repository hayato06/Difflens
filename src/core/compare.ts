import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export interface CompareResult {
    diffPixels: number;
    diffPercentage: number;
    isSameDimensions: boolean;
}

export function compareImages(
    img1Path: string,
    img2Path: string,
    diffPath: string,
    threshold: number = 0.1
): CompareResult {
    const img1 = PNG.sync.read(fs.readFileSync(img1Path));
    const img2 = PNG.sync.read(fs.readFileSync(img2Path));
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    if (img1.width !== img2.width || img1.height !== img2.height) {
        // Handle dimension mismatch
        return {
            diffPixels: -1,
            diffPercentage: -1,
            isSameDimensions: false
        };
    }

    const diffPixels = pixelmatch(
        img1.data,
        img2.data,
        diff.data,
        width,
        height,
        { threshold }
    );

    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    const totalPixels = width * height;
    const diffPercentage = (diffPixels / totalPixels) * 100;

    return {
        diffPixels,
        diffPercentage,
        isSameDimensions: true
    };
}
