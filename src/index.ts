import { program } from 'commander';
import fs from 'fs';
import { glob } from 'glob';
import { compileFromFile } from 'json-schema-to-typescript';
import path from 'path';
import { convert, defaultOptions } from './schema';


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
  .option(
    "-g, --glob <value>",
    "glob matching JSON schema to convert",
    defaultOptions.glob
  )
  // .option(
  //   "-p, --prefix <value>",
  //   "prefix to use before interfaces' name",
  //   parsePrefix,
  //   defaultOptions.prefix
  // )
  // .option(
  //   "-e, --ext <value>",
  //   "file extension to use for generated files",
  //   parseExtension,
  //   defaultOptions.ext
  // )
  // .option(
  //   "-m, --module <value>",
  //   "module to import the RouteHandler type from",
  //   defaultOptions.module
  // )
  .action(async (args) => {
    console.log('PATTERN', args);

    const schemas = await matchFiles(args.p);
    console.log(schemas);
    await compileSchemas(schemas);
  })
  ;


  // program.parse(process.argv);
  // const options = program.opts();
  
  // convert({
  //   glob: options.glob,
  //   prefix: options.prefix,
  //   ext: options.ext,
  //   module: options.module,
  // });
  


function parsePrefix(value: string) {
  if (!value.match(/^\w/i)) {
    console.error("Prefix needs to start with a letter");
    process.exit(-1);
  }

  return value;
}

function parseExtension(value: string) {
  if (!value.match(/^\./)) {
    console.error('File extension needs to start with a "."');
    process.exit(-1);
  }

  return value;
}
