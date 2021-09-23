import { glob, IOptions } from 'glob';
import path from 'path';

export async function matchFiles(pattern: string, options: IOptions = {}) {
  return new Promise<path.ParsedPath[]>((resolve, reject) => {
    console.log(pattern);
    glob(
      path.join(__dirname, '..', pattern),
      options,
      (err, files) => {
        return err ? reject(err) : resolve(files.map((file) => path.parse(file)));
      }
    );
  });
}