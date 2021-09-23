import { glob, IOptions } from 'glob';

export async function matchFiles(pattern: string, options: IOptions = {}) {
  return new Promise<string[]>((resolve, reject) => {
    glob(pattern, options, (err, files) => {
      return err ? reject(err) : resolve(files);
    });
  });
}
