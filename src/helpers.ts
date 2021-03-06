import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { UserOptions } from './types';

export const defaultSchema = {
  type: 'object',
  additionalProperties: false,
};

export function capitalize(text: string) {
  if (!text) {
    return text;
  }

  if (text.length < 2) {
    return text.toUpperCase();
  }

  return text.slice(0, 1).toUpperCase() + text.slice(1);
}

export async function writeFile(
  parsedPath: path.ParsedPath,
  template: string,
  options: UserOptions,
) {
  const write = promisify(fs.writeFile);
  return write(
    path.join(parsedPath.dir, parsedPath.name + options.ext),
    template,
  );
}

export function addDefaultValueToSchema(schema: any) {
  return {
    ...schema,
    additionalProperties: schema.additionalProperties || false,
  };
}
