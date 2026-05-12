export async function readVideoMetadata(
  file: File,
): Promise<{ width?: number; height?: number; duration?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: video.videoWidth || undefined,
        height: video.videoHeight || undefined,
        duration: Number.isFinite(video.duration) ? video.duration : undefined,
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    video.src = url;
  });
}
