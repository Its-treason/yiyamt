import { createStyles, Table } from '@mantine/core';
import { useMemo } from 'react';
import useFileStore from '../../store/useFileStore';
import useTableHeadings from '../hooks/useTableHeadings';
import FilesTableRow from './FilesTableRow';

const useStyles = createStyles((theme) => ({
  tableWrapper: {
    height: 'calc(100vh - 130px)',
    width: '100vw',
    overflow: 'auto',
  },
  table: {},
  tableHead: {
    position: 'sticky',
    zIndex: 9,
    background:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    top: 0,
  },
}));

const headingPrettyNames: { [key: string]: string } = {
  title: 'Title',
  album: 'Album',
  albumArtist: 'Album artist',
  genre: 'Genre',
  trackNumber: 'Track number',
  discNumber: 'Disc number',
};

function FilesTable() {
  const { classes } = useStyles();
  const files = useFileStore((state) => state.files);

  const headings = useTableHeadings(files);

  const rows = useMemo(() => {
    return files.map((file) => (
      <FilesTableRow key={file.id} file={file} headings={headings} />
    ));
  }, [files, headings]);

  return (
    <div className={classes.tableWrapper}>
      <Table className={classes.table}>
        <thead className={classes.tableHead}>
          <tr>
            <th>Filename</th>
            <th>Cover</th>
            {headings.map((heading) => (
              <th key={heading}>{headingPrettyNames[heading] || heading}</th>
            ))}
          </tr>
        </thead>
        <tbody style={{ height: 'calc(100& - 50px)' }}>{rows}</tbody>
      </Table>
    </div>
  );
}

export default FilesTable;
