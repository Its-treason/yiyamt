import { memo, useMemo } from 'react';
import { createStyles, Group, Text } from '@mantine/core';
import { File } from '../../types';
import EditCover from './EditCover';
import MultiValueInput from './MultiValueInput';

const useStyles = createStyles(() => ({
  tableCell: {
    verticalAlign: 'top',
  },
  text: {
    width: 'max-content',
  },
}));

type FilesTableRowProps = {
  file: File;
  headings: string[];
};

const defaultTag = { allowMultipleValues: false, values: [''] };

const FilesTableRow = memo(({ file, headings }: FilesTableRowProps) => {
  const { classes } = useStyles();

  const rows = useMemo(() => {
    return headings.map((heading) => {
      return (
        <td key={heading} className={classes.tableCell}>
          <MultiValueInput
            file={file}
            tagKey={heading}
            tagValue={file.tags[heading] || defaultTag}
          />
        </td>
      );
    });
  }, [file, headings, classes]);

  return (
    <tr>
      <td className={classes.tableCell}>
        <Group direction={'column'}>
          <Text className={classes.text}>{file.filename}</Text>
        </Group>
      </td>
      <td className={classes.tableCell}>
        <Group direction={'column'} style={{ height: '100%' }}>
          <EditCover fileId={file.id} imageHash={file.image} />
        </Group>
      </td>
      {rows}
    </tr>
  );
});

export default FilesTableRow;
