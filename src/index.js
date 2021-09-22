const { program } = require('commander');
const glob = require('glob');
const path = require('path');

const defautMatchPattern = '*.schema.json';

const matchFiles = (pattern) => {
  glob(path.join(__dirname, '..',`!(node_modules)/**/${pattern}`), (err, files) => {
    console.log(files);
  });
}

program
  .command('generate')
  .option('-p <pattern>', 'pattern for match json-schema files', defautMatchPattern)
  .action((args) => {
    console.log('PATTERN', args);

    matchFiles(args.p);
  });


program.parse(process.argv);
