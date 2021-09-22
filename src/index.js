const { program } = require('commander');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const { compile, compileFromFile } = require('json-schema-to-typescript');

const defautMatchPattern = '*.schema.json';

const compileSchemas = (schemas) => {
  return new Promise((resolve, reject) => {
    const _schemas = Array.isArray(schemas) ? schemas : [schemas];
    const compilePromises = _schemas.map((file) => compileFromFile(file, {
      bannerComment: '/** Hello world */',
      format: false,
    }));

    Promise.all(compilePromises)
      .then((compiles) => {
        const filePromises = compiles.map((compile, index) => new Promise((resolveWrite, rejectWrite) => {
          fs.writeFile(_schemas[index].replace(/json$/, 'ts'), compile, { encoding: 'utf8' }, (err, data) => {
            if (err) rejectWrite(err);
            else resolveWrite(data);
          });
        }));

        Promise.all(filePromises).then((data) => resolve(data));
      });
  });
}

const matchFiles = (pattern) => {
  return new Promise((resolve, reject) => {
    glob(path.join(__dirname, '..', `!(node_modules)/**/${pattern}`), (err, files) => {
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
