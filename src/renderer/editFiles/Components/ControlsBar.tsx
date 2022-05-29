import { createStyles, Group } from '@mantine/core';
import { useState } from 'react';
import { CornerUpLeft, CornerUpRight, DeviceFloppy } from 'tabler-icons-react';
import LoadingDialog from '../../common/LoadingDialog';
import useFileStore from '../../store/useFileStore';
import ControlAction from './ControlAction';
import rpcClient from '../../RpcClient';

const useStyles = createStyles((theme) => ({
  group: {
    margin: theme.spacing.xs,
  },
}));

function ControlsBar() {
  const { classes } = useStyles();
  const fileStore = useFileStore();
  const [loading, setLoading] = useState(false);

  return (
    <Group direction={'row'} className={classes.group}>
      <LoadingDialog opened={loading} helpText={'Saving files...'} />
      <ControlAction
        helpText={'Undo'}
        icon={<CornerUpLeft />}
        onClick={() => fileStore.undoAction()}
        disabled={fileStore.undoHistory.length < 2}
      />
      <ControlAction
        helpText={'Redo'}
        icon={<CornerUpRight />}
        onClick={() => fileStore.redoAction()}
        disabled={fileStore.redoHistory.length === 0}
      />
      <ControlAction
        helpText={'Save'}
        icon={<DeviceFloppy />}
        onClick={async () => {
          setLoading(true);
          console.time('save-files');
          await rpcClient.call('save-files', [fileStore.files]);
          console.timeEnd('save-files');
          setLoading(false);
        }}
        disabled={false}
      />
    </Group>
  );
}

export default ControlsBar;
