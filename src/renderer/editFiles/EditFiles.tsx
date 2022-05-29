import { Group } from '@mantine/core';
import ControlsBar from './Components/ControlsBar';
import FilesTable from './Components/FilesTable';

function EditFiles() {
  return (
    <Group spacing={0}>
      <ControlsBar />
      <FilesTable />
    </Group>
  );
}

export default EditFiles;
