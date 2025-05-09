import React, { useState } from "react";
import { toast } from 'sonner';
import { useDropzone, Accept } from "react-dropzone";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

const ImageConverter: React.FC = () => {
  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [imageFormats, setImageFormats] = useState<OutputFormat[]>([]);
  const [applyToAll, setApplyToAll] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [useConvertedName, setUseConvertedName] = useState(true);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    const newFormats: OutputFormat[] = [];

    acceptedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Please select a file under 100MB.`);
      } else if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file.`);
      } else {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
        newFormats.push(outputFormat);
      }
    });

    setImageFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setImageFormats((prev) => [...prev, ...newFormats]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ["image/*"] as unknown as Accept,
  });

  const handleConvert = async (index: number) => {
    const imageFile = imageFiles[index];
    const imagePreview = imagePreviews[index];
    const format = applyToAll ? outputFormat : imageFormats[index];

    if (!imageFile || !imagePreview) return;

    setLoading(true);

    const img = new Image();
    img.src = imagePreview;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        setLoading(false);

        if (!blob) return;

        const downloadUrl = URL.createObjectURL(blob);
        const fileName = useConvertedName
          ? `converted_${index + 1}.${format.split("/")[1]}`
          : `${imageFile.name.split(".")[0]}.${format.split("/")[1]}`;

        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName;
        a.click();
        toast.success(`Image ${index + 1} converted and downloaded successfully!`, {
          description: `Saved as ${format.split("/")[1].toUpperCase()}`,
        });
        URL.revokeObjectURL(downloadUrl);
      }, format);
    };
  };

  const handleApplyToAllToggle = () => {
    setApplyToAll((prev) => !prev);
    if (!applyToAll) {
      setImageFormats(new Array(imageFiles.length).fill(outputFormat));
    } else {
      setImageFormats(new Array(imageFiles.length).fill(outputFormat));
    }
  };

  const handleIndividualFormatChange = (index: number, newFormat: OutputFormat) => {
    const updatedFormats = [...imageFormats];
    updatedFormats[index] = newFormat;
    setImageFormats(updatedFormats);
  };

  const handleBatchConvert = async () => {
    setIsBatchProcessing(true);
    for (let index = 0; index < imageFiles.length; index++) {
      await handleConvert(index);
    }
    setIsBatchProcessing(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#00a6ff] to-[#000e21] p-10">
      <div className="w-full p-10 bg-[#000e21] border border-[#00a6ff]/20 rounded-2xl shadow-2xl space-y-10">
        <h1 className="text-4xl font-extrabold text-center text-white drop-shadow-sm">
          Image Converter
        </h1>
        <label className="text-sm text-center text-gray-500">
            By <a href="https://schris.vercel.app" target="_blank" style={{ color: '#00a6ff' }}>SChris</a>.
        </label>

        <div>
          <label className="block text-lg font-medium text-white mb-2">
            Upload Images
          </label>
          <div
            {...getRootProps()}
            className="w-full text-sm text-white bg-[#001a33] border border-[#00a6ff] rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#00a6ff]"
          >
            <input {...getInputProps()} />
            <p className="text-center text-gray-300">Drag & Drop your images here, or click to select</p>
          </div>
        </div>

        {imagePreviews.length > 0 && (
          <div className="mt-4 space-y-6">
            <div className="flex items-center gap-4">
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                className="w-full sm:w-auto p-4 text-base text-white bg-[#001a33] border border-[#00a6ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a6ff]"
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
              </select>

              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={handleApplyToAllToggle}
                  className="mr-2"
                />
                Apply to all images
              </label>
            </div>

            <label className="flex items-center text-white mt-4">
              <input
                type="checkbox"
                checked={useConvertedName}
                onChange={() => setUseConvertedName((prev) => !prev)}
                className="mr-2"
              />
              Use converted file names (ex: converted_1.png) instead of original names
            </label>

            {imagePreviews.map((preview, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-auto max-w-xs overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-auto object-cover rounded-xl transition-transform duration-300 hover:scale-[1.03]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {!applyToAll && (
                    <select
                      value={imageFormats[index]}
                      onChange={(e) => handleIndividualFormatChange(index, e.target.value as OutputFormat)}
                      className="w-full sm:w-auto p-4 text-base text-white bg-[#001a33] border border-[#00a6ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a6ff]"
                    >
                      <option value="image/png">PNG</option>
                      <option value="image/jpeg">JPEG</option>
                      <option value="image/webp">WebP</option>
                    </select>
                  )}

                  <button
                    onClick={() => handleConvert(index)}
                    className="cursor-pointer w-full sm:w-auto px-6 py-4 text-base font-semibold text-white bg-[#00a6ff] hover:bg-[#0090e0] rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00a6ff]"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin w-5 h-5 border-4 border-t-4 border-white rounded-full"></div>
                      </div>
                    ) : (
                      "Convert & Download"
                    )}
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={handleBatchConvert}
              disabled={isBatchProcessing || loading}
              className={`mt-6 w-full px-6 py-4 text-base font-semibold text-white ${isBatchProcessing || loading ? "bg-[#001a33]" : "bg-[#00a6ff]"} hover:bg-[#0090e0] rounded-xl shadow-lg transition-all duration-300`}
            >
              {isBatchProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-4 border-t-4 border-white rounded-full"></div>
                </div>
              ) : (
                "Batch Convert All Images"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageConverter;
