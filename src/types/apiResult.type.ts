import { Dispatch, SetStateAction } from "react";

export type Dispatcher<S> = Dispatch<SetStateAction<S>>;

export interface ApiResultType {
  error: boolean;
  status: number;
  statusText: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface TableKeyType {
  key: string;
  label: string;
  sort: boolean;
  isImage: boolean;
  isFile: boolean;
}

export interface ApiPayload {
  [key: string]: string | number | boolean | File | Date | ApiPayload | { [key: string]: ApiPayload } | ApiPayload[];
}

export interface SubModules {
  parent: string;
  key: string;
  link: string;
  label: string;
}
