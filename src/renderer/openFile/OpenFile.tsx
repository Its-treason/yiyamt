import { useMantineTheme } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingDialog from '../common/LoadingDialog';
import useFileStore from '../store/useFileStore';
import FileAddAction from '../editFiles/actions/FileAddAction';
import dropzoneChildren from './dropzoneChildren';
import { File } from '../types';
import ipcClient from '../RpcClient';

type UploadedFile = {
  path: string;
  name: string;
  size: number;
  type: string;
};

function OpenFile() {
  const theme = useMantineTheme();
  const navigator = useNavigate();
  const addAction = useFileStore((state) => state.addAction);

  const [loading, setLoading] = useState(false);

  const onDrop = async (rawFiles: UploadedFile[]) => {
    setLoading(true);

    const files = rawFiles.map((rawFile) => {
      return {
        path: rawFile.path,
        mimeType: rawFile.type,
      };
    });

    const newFiles = (await ipcClient.call('open-files', [files])) as File[];

    addAction(new FileAddAction(newFiles));
    navigator('/editFiles');
  };

  return (
    <>
      <LoadingDialog opened={loading} helpText={'Opening files...'} />
      <Dropzone
        onDrop={onDrop}
        accept={['audio/x-flac', 'audio/flac', 'audio/mpeg', 'inode/directory']}
        loading={loading}
        style={{ margin: 'auto 10%' }}
      >
        {(status) => dropzoneChildren(status, theme)}
      </Dropzone>
    </>
  );
}

export default OpenFile;
