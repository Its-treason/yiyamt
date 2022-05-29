import { useEffect, useState } from 'react';
import produce from 'immer';
import { TextInput, Group, Button, createStyles } from '@mantine/core';
import { Plus, X } from 'tabler-icons-react';
import { Tags, File, Tag } from '../../types';
import useFileStore from '../../store/useFileStore';
import UpdateDefaultValueAction from '../actions/UpdateDefaultValueAction';
import ValueRemoveAction from '../actions/ValueRemoveAction';
import ValueAddAction from '../actions/ValueAddAction';

const useStyles = createStyles(() => ({
  group: {
    width: '185px',
    height: '100%',
  },
  deleteIcon: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  addButton: {
    margin: '0 auto',
  },
}));

type MultiValueInputProps = {
  file: File;
  tagKey: keyof Tags;
  tagValue: Tag;
};

function MultiValueInput({ file, tagKey, tagValue }: MultiValueInputProps) {
  const { classes } = useStyles();
  const addAction = useFileStore((state) => state.addAction);

  const [localValues, setLocalValue] = useState(tagValue.values);

  useEffect(() => {
    setLocalValue(tagValue.values);
  }, [tagValue]);

  const element = tagValue.values.map((value, index) => {
    return (
      <TextInput
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        width={200}
        // Fallback to '' here cuz when a field is added its uncontrolled on first render and reacts throws a warning
        value={localValues[index] || ''}
        onChange={(evt) =>
          setLocalValue(
            produce((draft) => {
              draft[index] = evt.target.value;
            })
          )
        }
        onBlur={() => {
          if (value.trim() === localValues[index].trim()) {
            return;
          }

          const localTagValue: Tag = {
            values: localValues,
            allowMultipleValues: tagValue.allowMultipleValues,
          };

          addAction(
            new UpdateDefaultValueAction(
              file.id,
              tagKey,
              tagValue,
              localTagValue
            )
          );
        }}
        rightSection={
          tagValue.values.length !== 1 && (
            <X
              className={classes.deleteIcon}
              onClick={() => {
                addAction(new ValueRemoveAction(file.id, tagKey, index));
              }}
            />
          )
        }
      />
    );
  });

  return (
    <Group direction={'column'} spacing={'xs'} className={classes.group}>
      {element}
      {tagValue.allowMultipleValues === true && (
        <Button
          className={classes.addButton}
          leftIcon={<Plus />}
          onClick={() => {
            addAction(new ValueAddAction(file.id, tagKey));
          }}
        >
          Add
        </Button>
      )}
    </Group>
  );
}

export default MultiValueInput;
