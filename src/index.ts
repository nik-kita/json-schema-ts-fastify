import { program } from "commander";
import { convert } from "./main";
import { UserOptions } from "./types";

program
  .option(
    '-g, --glob <pattern>',
    'glob for match schema to convert',
  )
  .option(
    '-p, --prefix <prefix>',
    'prefix to use before interface\'s name'
  )
  .option(
    '-e, --ext <extension>',
    'file extension to use for generated files'
  )
  .option(
    '-m, --module <module>',
    'module to import the RouteHandler type from',
  )
  .option(
    '-b, --banner <banner>',
    'upper comment in generated files'
  )
  .action((options) => {
    const _options = {
      ...{
        glob: "!(node_modules|dist)/**/*schema.json",
        prefix: "",
        ext: ".ts",
        module: "fastify",
        bannerComment: '/** Hello */',
      },
      ...options,
    };

    convert(_options);
  })
  ;

program.parse(process.argv);
