// PNG Secret Decoder

import secretKeyPNG from '../../assets/images/key.png';

let GOOGLE_CLIENT_SECRET = null;
let secretDecodePromise = null;

export const decodeSecret = () => {
    if (secretDecodePromise) return secretDecodePromise;

    secretDecodePromise = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const pixels = imageData.data;

                let secret = '';
                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    if (r === 0 || r === 255) break; // Stop at null or padding
                    secret += String.fromCharCode(r);
                }

                GOOGLE_CLIENT_SECRET = secret;
                console.log('[CloudSave] Secret decoded successfully');
                resolve(secret);
            } catch (e) {
                console.error('[CloudSave] Failed to decode secret:', e);
                reject(e);
            }
        };
        img.onerror = (e) => {
            console.error('[CloudSave] Failed to load secret image:', e);
            reject(new Error('Failed to load secret image'));
        };
        img.src = secretKeyPNG;
    });

    return secretDecodePromise;
};

export const getClientSecret = () => GOOGLE_CLIENT_SECRET;
