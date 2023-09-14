export type FileType = {
  url: Blob | MediaSource | string;
  encoded: string | ArrayBuffer | null;
  name: string;
};

export type PostType = {
  id: string;
  photo: FileType;
  caption: string;
  createdAt: Date;
};
export type DBPostType = {
  id: string;
  caption: string;
  createdAt: Date;
  localUrl: Blob | MediaSource | string;
  encodedUrl: string | ArrayBuffer | null;
  altText: string;
};
export type OnlineStatus = "online" | "offline" | "checking";
export type PostSchemaType = {
  id: number;
  caption: string;
  imageUrl: string;
  imageAlt: string;
  createdAt: Date;
};
