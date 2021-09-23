import { matchFiles } from "./file.utils";
import { UserOptions } from "./types";
import fs from 'fs';
import { writeFile } from "./helpers";
import { generateInterfaces } from "./generate-interfaces.function";


export async function convert(options: UserOptions) {

  const parsedFiles = await matchFiles(options.glob);

  await Promise.all([
    parsedFiles.map(async (parsedFile) => {
      const schema = JSON.parse(fs.readFileSync(parsedFile.dir + '/' + parsedFile.base, 'utf8'));
      const matchName = parsedFile.name.match(/^[^\.]+/);
      const name = matchName ? matchName[0] : '';
      const template = await generateInterfaces(schema, options, name);
      await writeFile(parsedFile, template, options);
    })
  ]);

}
