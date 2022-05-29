import { useMantineTheme, Group, MantineTheme, Text } from '@mantine/core';
import { DropzoneStatus, Dropzone } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { Photo, Upload, X } from 'tabler-icons-react';
import { useState } from 'react';
import rpcClient from '../../../RpcClient';
import LoadingDialog from '../../../common/LoadingDialog';
import { ImageUploadResult } from '../../../types';

type UploadedFile = {
  path: string;
  name: string;
  size: number;
  type: string;
};

const dropzoneChildren = (
  status: DropzoneStatus,
  theme: MantineTheme
): JSX.Element => {
  let icon = (
    <Photo
      size={80}
      color={
        theme.colorScheme === 'dark'
          ? theme.colors.dark[0]
          : theme.colors.gray[7]
      }
    />
  );
  if (status.accepted) {
    icon = (
      <Upload
        size={80}
        color={
          theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]
        }
      />
    );
  }
  if (status.rejected) {
    icon = (
      <X
        size={80}
        color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
      />
    );
  }

  return (
    <Group
      position={'center'}
      spacing={'xl'}
      style={{ minHeight: 220, pointerEvents: 'none' }}
    >
      {icon}
      <div>
        <Text size={'xl'} inline>
          Drag an Image here or click to select a file
        </Text>
        <Text size={'sm'} color={'dimmed'} inline mt={7}>
          Allowed file extensions are: .png, .jpg & .gif
        </Text>
      </div>
    </Group>
  );
};

type ImageUploadDropzoneProps = {
  onUpload: (imageHash: string) => void;
};

function ImageUploadDropzone({ onUpload }: ImageUploadDropzoneProps) {
  const theme = useMantineTheme();

  const [loading, setLoading] = useState(false);

  const onDrop = async (rawFiles: UploadedFile[]) => {
    setLoading(true);

    const file = rawFiles[0].path;

    const result = (await rpcClient.call('upload-image', [
      file,
    ])) as ImageUploadResult;

    if (result.error !== null) {
      showNotification({
        title: 'Selecting image failed',
        message: result.error,
        color: 'red',
      });
      setLoading(false);
      return;
    }

    onUpload(result.imageHash);
  };

  return (
    <>
      <LoadingDialog opened={loading} helpText={'Opening image...'} />
      <Dropzone
        onDrop={onDrop}
        accept={['image/jpeg', 'image/png', 'image/gif']}
        loading={loading}
      >
        {(status) => dropzoneChildren(status, theme)}
      </Dropzone>
    </>
  );
}

export default ImageUploadDropzone;
