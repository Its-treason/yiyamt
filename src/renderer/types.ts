export type File = {
  readonly id: string;
  readonly filename: string;
  readonly filePath: string;
  readonly type: string;
  newFileName: null | string;
  image?: string;
  tags: Tags;
};

export type Tags = {
  [key: string]: Tag;
};

export type Tag = {
  values: string[];
  allowMultipleValues: boolean;
};

export type ImageUploadResult =
  | {
      imageHash: string;
      error: null;
    }
  | {
      imageHash: null;
      error: string;
    };
