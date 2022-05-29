import { Group, Loader, Modal, Text } from '@mantine/core';

type LoadingDialogProps = {
  opened: boolean;
  helpText?: string;
};

function LoadingDialog({ opened, helpText }: LoadingDialogProps) {
  return (
    <Modal
      closeOnEscape={false}
      withCloseButton={false}
      centered
      opened={opened}
      onClose={() => {}}
      size={'xs'}
    >
      <Group direction={'column'} position={'center'}>
        <Loader variant={'bars'} size={'xl'} />
        <Text color={'dimmed'}>{helpText}</Text>
      </Group>
    </Modal>
  );
}

LoadingDialog.defaultProps = {
  helpText: '',
};

export default LoadingDialog;
