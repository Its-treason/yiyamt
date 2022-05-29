import React, { useMemo, useState } from 'react';
import { Image } from '@mantine/core';
import { QuestionMark } from 'tabler-icons-react';
import useImageStore from '../../store/useImageStore';
import UploadImageModal from './ImageUpload/UploadImageModal';
import useFileStore from '../../store/useFileStore';
import UpdateImageAction from '../actions/UpdateImageAction';

type CoverProps = {
  imageHash?: string;
  fileId: string;
};

function EditCover({ imageHash = undefined, fileId }: CoverProps) {
  const images = useImageStore((state) => state.images);
  const addAction = useFileStore((state) => state.addAction);
  const [dialogOpen, setDialogOpen] = useState(false);

  const srcString = useMemo(() => {
    return images.find((image) => {
      return image.hash === imageHash;
    })?.imageString;
  }, [images, imageHash]);

  return (
    <>
      <UploadImageModal
        opened={dialogOpen}
        onClose={(newImageHash) => {
          setDialogOpen(false);

          if (newImageHash) {
            addAction(new UpdateImageAction(fileId, newImageHash, imageHash));
          }
        }}
      />

      {srcString ? (
        <Image
          src={srcString}
          width={32}
          height={32}
          alt={'cover art'}
          onClick={() => setDialogOpen(true)}
        />
      ) : (
        <QuestionMark
          width={32}
          height={32}
          onClick={() => setDialogOpen(true)}
        />
      )}
    </>
  );
}

export default EditCover;
