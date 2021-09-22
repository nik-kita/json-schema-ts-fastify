import { program } from 'commander';
import fs from 'fs';
import { glob } from 'glob';
import { compileFromFile } from 'json-schema-to-typescript';
import path from 'path';


const defautMatchPattern = '*.schema.json';

const compileSchemas = (schemaPathes: string | string[]) => {
  return new Promise((resolve, reject) => {
    const _schemas = Array.isArray(schemaPathes) ? schemaPathes : [schemaPathes];
    const compilePromises = _schemas.map((file) => compileFromFile(file, {
      bannerComment: '/** Hello world */',
      format: false,
    }));

    Promise.all(compilePromises)
      .then((compiles) => {
        const filePromises = compiles.map((compile, index) => new Promise<void>((resolveWrite, rejectWrite) => {
          fs.writeFile(_schemas[index].replace(/json$/, 'ts'), compile, { encoding: 'utf8' }, (err) => {
            if (err) rejectWrite(err);
            else resolveWrite();
          });
        }));

        Promise.all(filePromises).then((data) => resolve(data));
      });
  });
}

const matchFiles = (pattern: string) => {
  return new Promise<string[]>((resolve, reject) => {
    glob(path.join(__dirname, '..', `!(node_modules|dist)/**/${pattern}`), (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

program
  .command('generate')
  .option('-p <pattern>', 'pattern for match json-schema files', defautMatchPattern)
  .action(async (args) => {
    console.log('PATTERN', args);

    const schemas = await matchFiles(args.p);
    console.log(schemas);
    await compileSchemas(schemas);
  });


program.parse(process.argv);
