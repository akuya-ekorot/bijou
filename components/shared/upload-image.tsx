import Image from 'next/image';
import { useState } from 'react';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

export default function UploadImage({
  multiple,
  setImages,
}: {
  multiple?: boolean;
  setImages: React.Dispatch<React.SetStateAction<FileList | undefined>>;
}) {
  const [imagesPreview, setImagesPreview] = useState<Array<string>>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (imagesPreview.length) {
      setImagesPreview([]);
    }

    const files = e.target.files;

    if (!files) {
      setImagesPreview([]);
      return;
    } else {
      setImages(files);
    }

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();

      reader.readAsDataURL(files[i]);

      reader.onloadend = () => {
        setImagesPreview((prev) =>
          multiple
            ? [...prev, reader.result as string]
            : [reader.result as string],
        );
      };
    }
  };

  return (
    <div className="space-y-2">
      <ScrollArea className="w-full max-w-sm h-40 border">
        <div className={cn(multiple ? 'grid grid-cols-3 gap-1 p-1' : '')}>
          {imagesPreview.map((image) => (
            <Image
              key={image}
              src={image}
              alt="preview"
              className={cn(
                'border rounded overflow-hidden object-cover',
                multiple ? 'h-16 w-full' : 'w-full h-40',
              )}
              height={160}
              width={384}
            />
          ))}
        </div>
      </ScrollArea>
      <Input
        multiple={multiple}
        onChange={handleImageChange}
        type="file"
        accept="image/*"
      />
    </div>
  );
}
