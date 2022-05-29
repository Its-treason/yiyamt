import { Modal } from '@mantine/core';
import { useState } from 'react';
import ImagePreview from './ImagePreview';
import ImageUploadDropzone from './ImageUploadDropzone';

type UploadImageModalProps = {
  opened: boolean;
  onClose: (imageHash: string | null) => void;
};

function UploadImageModal({ onClose, opened }: UploadImageModalProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  return (
    <Modal
      onClose={() => {
        onClose(null);
        setCurrentImage(null);
      }}
      opened={opened}
      size={'xl'}
    >
      {currentImage ? (
        <ImagePreview
          imageHash={currentImage}
          onUploadOther={() => setCurrentImage(null)}
          onUseImage={() => {
            onClose(currentImage);
            setCurrentImage(null);
          }}
        />
      ) : (
        <ImageUploadDropzone
          onUpload={(previewImage) => setCurrentImage(previewImage)}
        />
      )}
    </Modal>
  );
}

export default UploadImageModal;
