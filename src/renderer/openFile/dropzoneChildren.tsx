import { Group, MantineTheme, Text } from '@mantine/core';
import { DropzoneStatus } from '@mantine/dropzone';
import { Photo, Upload, X } from 'tabler-icons-react';

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
          Drag music or folder here or click to select files
        </Text>
        <Text size={'sm'} color={'dimmed'} inline mt={7}>
          Attach as many files as you like
        </Text>
      </div>
    </Group>
  );
};

export default dropzoneChildren;
