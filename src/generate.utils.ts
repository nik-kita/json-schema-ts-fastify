import { compile } from "json-schema-to-typescript";
import { addDefaultValueToSchema, capitalize, defaultSchema, _Options } from "./help.utils";

export function generateSchema(schema: object, name: string) {
  return `const ${name}Schema = ${JSON.stringify(schema)};`;
};

export async function generateReplyInterfaces(
  prefix: string,
  options: _Options,
  replies: Record<any, any> = {},
  definitions: Record<any, any> = {}
) {
  const generatedInterfaces = [];
  const generatedReplyNames = [];
  for (const [replyCode, replySchema] of Object.entries(replies)) {
    generatedReplyNames.push(prefix + "Reply" + replyCode.toUpperCase());
    generatedInterfaces.push(
      await compile(
        {
          ...addDefaultValueToSchema(replySchema || defaultSchema),
          definitions,
        },
        prefix + "Reply" + replyCode.toUpperCase(),
        options,
      )
    );
  }

  return `
${generatedInterfaces.join("\n")}
export type ${prefix}Reply = ${generatedReplyNames.join(" | ") || "{}"}
`.trim();
}

export async function generateDefinitionInterfaces(
  definitions: Record<any, any> = {},
  name: string,
  options: _Options,
) {
  const generatedInterfaces = [];
  const generatedReplyNames = [];

  for (const [definitionName, definitionSchema] of Object.entries(
    definitions
  )) {
    generatedReplyNames.push(capitalize(name + definitionName));
    generatedInterfaces.push(
      await compile(
        {
          ...definitionSchema,
          definitions,
        },
        capitalize(definitionName),
        options,
      )
    );
  }

  return `\
${generatedInterfaces.join("\n")}
export type ${capitalize(name + 'Definitions')} = ${generatedReplyNames.join(" | ") || "{}"}\
  `.trim();
}