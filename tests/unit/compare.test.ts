import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { compareImages } from '../../src/core/compare';
import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

const TEST_DIR = path.join(__dirname, 'fixtures');

function createPng(width: number, height: number, color: [number, number, number]): Buffer {
    const png = new PNG({ width, height });
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;
            png.data[idx] = color[0];
            png.data[idx + 1] = color[1];
            png.data[idx + 2] = color[2];
            png.data[idx + 3] = 255;
        }
    }
    return PNG.sync.write(png);
}

describe('compareImages', () => {
    beforeAll(() => {
        if (!fs.existsSync(TEST_DIR)) {
            fs.mkdirSync(TEST_DIR, { recursive: true });
        }
    });

    afterAll(() => {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
    });

    it('should detect identical images', () => {
        const imgPath = path.join(TEST_DIR, 'base.png');
        const buf = createPng(10, 10, [255, 0, 0]);
        fs.writeFileSync(imgPath, buf);

        const result = compareImages(imgPath, imgPath, path.join(TEST_DIR, 'diff.png'));
        expect(result.diffPixels).toBe(0);
        expect(result.isSameDimensions).toBe(true);
    });

    it('should detect dimension mismatch', () => {
        const img1Path = path.join(TEST_DIR, 'img1.png');
        const img2Path = path.join(TEST_DIR, 'img2.png');
        fs.writeFileSync(img1Path, createPng(10, 10, [255, 0, 0]));
        fs.writeFileSync(img2Path, createPng(20, 20, [255, 0, 0]));

        const result = compareImages(img1Path, img2Path, path.join(TEST_DIR, 'diff_dim.png'));
        expect(result.isSameDimensions).toBe(false);
        expect(result.diffPixels).toBe(-1);
    });

    it('should detect pixel differences', () => {
        const img1Path = path.join(TEST_DIR, 'diff1.png');
        const img2Path = path.join(TEST_DIR, 'diff2.png');
        fs.writeFileSync(img1Path, createPng(10, 10, [255, 0, 0])); // Red
        fs.writeFileSync(img2Path, createPng(10, 10, [0, 0, 255])); // Blue

        const result = compareImages(img1Path, img2Path, path.join(TEST_DIR, 'diff_pixel.png'));
        expect(result.diffPixels).toBeGreaterThan(0);
        expect(result.isSameDimensions).toBe(true);
    });
});
