declare module 'browser-image-compression' {
    interface Options {
        maxSizeMB?: number;
        maxWidthOrHeight?: number;
        onProgress?: (p: number) => void;
        useWebWorker?: boolean;
        libURL?: string;
        preserveExif?: boolean;
        signal?: AbortSignal;
        maxIteration?: number;
        exifOrientation?: number;
        fileType?: string;
        initialQuality?: number;
        alwaysKeepResolution?: boolean;
    }

    function imageCompression(file: File, options: Options): Promise<File>;

    namespace imageCompression {
        function getDataUrlFromFile(file: File): Promise<string>;
        function getFilefromDataUrl(dataUrl: string, filename: string, lastModified?: number): Promise<File>;
        function loadImage(url: string): Promise<HTMLImageElement>;
        function drawImageInCanvas(img: HTMLImageElement, fileType?: string): Promise<HTMLCanvasElement>;
        function canvasToFile(canvas: HTMLCanvasElement, fileType: string, fileName: string, fileLastModified: number, quality?: number): Promise<File>;
        function getExifOrientation(file: File): Promise<number>;
    }

    export default imageCompression;
}
