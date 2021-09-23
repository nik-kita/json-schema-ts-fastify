import { program } from "commander";
import fs from 'fs';
import { compile, Options } from 'json-schema-to-typescript';
import { matchFiles } from "./file.utils";
import { generateDefinitionInterfaces, generateReplyInterfaces, generateSchema } from "./generate.utils";
import { addDefaultValueToSchema, capitalize, defaultSchema, writeFile, _Options } from "./help.utils";

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
  ;

program.parse(process.argv);

const options = {
  ...{
    glob: "!(node_modules|dist)/**/*schema.json",
    prefix: "",
    ext: ".ts",
    module: "fastify",
    bannerComment: '/** Hello */',
  },
  ...program.opts()
};

console.log('==> OPTIONS <===', options);




async function convert() {
  console.log('===> convert() <===');

  const parsedFiles = await matchFiles(options.glob);

  console.log('PARSED-FILES', parsedFiles);

  await Promise.all([
    parsedFiles.map(async (parsedFile) => {
      const schema = JSON.parse(fs.readFileSync(parsedFile.dir + '/' + parsedFile.base, 'utf8'));
      const matchName = parsedFile.name.match(/^[^\.]/);

      console.log('===> MATCH-NAME <===', matchName);

      const name = matchName ? matchName[2] : '';
      const template = await generateInterfaces(schema, options, name);
      await writeFile(parsedFile, template, options);
    })
  ]);

}





async function generateInterfaces(schema: any, options: _Options, name: string) {
  return `\
  ${options.bannerComment ?? ''}
  /**
 * This file was automatically generated. DO NOT MODIFY IT BY HAND.
 * Instead, modify the corresponding JSONSchema file and regenerate the types.
 */

import { RouteHandler } from "${options.module}"

${generateSchema(schema, name)}

${await generateDefinitionInterfaces(schema.definitions || {}, name, options)}
${await compile(
  {
    ...addDefaultValueToSchema(schema.params || defaultSchema),
    definitions: schema.definitions,
  },
  capitalize(name + options.prefix + "Params"),
  options
)}
${await compile(
  {
    ...addDefaultValueToSchema(
      schema.querystring || schema.query || defaultSchema
    ),
    definitions: schema.definitions,
  },
  capitalize(options.prefix + name + "Query"),
  options
)}
${await compile(
  {
    ...addDefaultValueToSchema(schema.body || defaultSchema),
    definitions: schema.definitions,
  },
  capitalize(name + options.prefix + "Body"),
  options
)}
${await compile(
  {
    ...addDefaultValueToSchema(schema.headers || defaultSchema),
    definitions: schema.definitions,
  },
  capitalize(name + options.prefix + "Headers"),
  options
)}
${await generateReplyInterfaces(
  options.prefix!,
  schema.response,
  schema.definitions
)}

export type ${capitalize(options.prefix + name)}RouteGeneric = {
  Querystring: ${capitalize(options.prefix + name)}Query;
  Body: ${capitalize(options.prefix + name)}Body;
  Params: ${capitalize(options.prefix + name)}Params;
  Headers: ${capitalize(options.prefix + name)}Headers;
  Reply: ${capitalize(options.prefix + name)}Reply;
}

export type ${capitalize(options.prefix + name)}Handler = RouteHandler<${
    capitalize(options.prefix + name)
  }RouteGeneric>;\
`;
}


console.log('hi');
convert();