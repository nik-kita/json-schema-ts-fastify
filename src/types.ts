import { Options } from "json-schema-to-typescript";

export type UserOptions = Options & { ext: string, module: string, prefix: string, glob: string };
