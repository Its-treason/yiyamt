import { ActionIcon, Group, Text } from '@mantine/core';

type ControlActionProps = {
  helpText: string;
  icon: JSX.Element;
  onClick: () => void;
  disabled?: boolean;
};

function ControlAction({
  disabled,
  helpText,
  icon,
  onClick,
}: ControlActionProps) {
  return (
    <Group direction={'column'} spacing={0} align={'center'}>
      <ActionIcon
        size={'xl'}
        onClick={onClick}
        disabled={disabled}
        title={helpText}
      >
        {icon}
      </ActionIcon>
      <Text color={'dimmed'} size={'sm'}>
        {helpText}
      </Text>
    </Group>
  );
}

ControlAction.defaultProps = {
  disabled: false,
};

export default ControlAction;
