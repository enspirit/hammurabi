import { assert } from '../deps.ts';
import {
  dirExists as _dirExists,
  fileExists as _fileExists,
  fsExists as _fsExists,
} from '../utils/fs.ts';

export const fsExists = async (
  filename: string,
  msg?: string,
) => {
  const assertMsg = msg || `File ${filename} exists`;
  assert(await _fsExists(filename), assertMsg);
};

export const fileExists = async (
  filename: string,
  msg?: string,
) => {
  const assertMsg = msg || `Path ${filename} is a file`;
  assert(await _fileExists(filename), assertMsg);
};

export const dirExists = async (
  filename: string,
  msg?: string,
) => {
  const assertMsg = msg || `Path ${filename} is a directory`;
  assert(await _dirExists(filename), assertMsg);
};
