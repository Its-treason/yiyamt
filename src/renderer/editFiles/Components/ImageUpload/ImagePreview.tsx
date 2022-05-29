import { Button, Group, Image } from '@mantine/core';
import { useMemo } from 'react';
import { Trash, DeviceFloppy } from 'tabler-icons-react';
import useImageStore from '../../../store/useImageStore';

type ImagePreviewProps = {
  imageHash: string;
  onUploadOther: () => void;
  onUseImage: () => void;
};

function ImagePreview({
  imageHash,
  onUploadOther,
  onUseImage,
}: ImagePreviewProps) {
  const images = useImageStore((state) => state.images);

  const srcString = useMemo(() => {
    return images.find((image) => {
      return image.hash === imageHash;
    })?.imageString;
  }, [images, imageHash]);

  return (
    <Group position={'center'} direction={'column'}>
      <Image src={srcString} alt={'Preview of the cover art'} />
      <Group position={'center'}>
        <Button onClick={onUploadOther} leftIcon={<Trash />} variant={'subtle'}>
          Choose another Image
        </Button>
        <Button onClick={onUseImage} leftIcon={<DeviceFloppy />}>
          Use image
        </Button>
      </Group>
    </Group>
  );
}

export default ImagePreview;
