import { compile } from 'json-schema-to-typescript';
import { generateDefinitionInterfaces, generateReplyInterfaces, generateSchema } from './generators.utils';
import { addDefaultValueToSchema, capitalize, defaultSchema } from './helpers';
import { UserOptions } from './types';

export async function generateInterfaces(schema: any, options: UserOptions, name: string) {
  const { bannerComment } = options;
  // eslint-disable-next-line no-param-reassign
  options.bannerComment = '';

  return `\
  ${bannerComment ?? ''}/**
* This file was automatically generated. DO NOT MODIFY IT BY HAND.
* Instead, modify the corresponding JSONSchema file and regenerate the types.
*/
import { RouteHandler } from "${options.module}"


export ${generateSchema(schema, name)}

${await generateDefinitionInterfaces(schema.definitions || {}, name, options)}

${await compile(
    {
      ...addDefaultValueToSchema(schema.params || defaultSchema),
      definitions: schema.definitions,
    },
    capitalize(`${name + options.prefix}Params`),
    options,
  )}
${await compile(
    {
      ...addDefaultValueToSchema(
        schema.querystring || schema.query || defaultSchema,
      ),
      definitions: schema.definitions,
    },
    capitalize(`${options.prefix + name}Query`),
    options,
  )}
${await compile(
    {
      ...addDefaultValueToSchema(schema.body || defaultSchema),
      definitions: schema.definitions,
    },
    capitalize(`${name + options.prefix}Body`),
    options,
  )}
${await compile(
    {
      ...addDefaultValueToSchema(schema.headers || defaultSchema),
      definitions: schema.definitions,
    },
    capitalize(`${name + options.prefix}Headers`),
    options,
  )}
${await generateReplyInterfaces(
    options.prefix,
    name,
    schema.response,
    schema.definitions,
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
}RouteGeneric>;
`;
}
