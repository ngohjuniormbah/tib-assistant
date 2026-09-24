const serializeFileListWithContent = (fileList: FileList) => {
  const promises = Array.from(fileList).map(
    (
      file
    ): Promise<{
      name: string;
      size: number;
      type: string;
      lastModified: number;
      content: string | null;
    }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            content: reader.result as string, // Base64 string
          });
        };
        reader.readAsDataURL(file);
      });
    }
  );

  return Promise.all(promises);
};

export default serializeFileListWithContent;
