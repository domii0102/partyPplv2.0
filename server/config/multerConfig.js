import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

//to jest żeby format zdjęcia z buforu pamięci zmienić na taki, który chmura zapisze
export function intoBase64(img) {
    try {
        const base64 = img.buffer.toString("base64");
        return `data:${img.mimetype};base64,${base64}`;
    }
    catch (err) {
        console.error(err);
    }
    
}