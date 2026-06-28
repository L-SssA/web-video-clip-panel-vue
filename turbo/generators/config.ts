import type { PlopTypes } from "@turbo/gen";

import * as fs from "fs";
import * as path from "path";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  const generatorsDir = __dirname;

  // 遍历当前目录下的所有子目录
  const items = fs.readdirSync(generatorsDir, { withFileTypes: true });

  for (const item of items) {
    // 只处理目录，跳过 config.ts 本身和其他非生成器目录
    if (item.isDirectory() && item.name !== "template") {
      const generatorName = item.name;
      const generatorPath = path.join(generatorsDir, generatorName);

      try {
        // 从每个生成器目录的 index.ts 导入配置
        const generatorModule = require(path.join(generatorPath, "index.ts"));

        if (generatorModule && generatorModule.options) {
          plop.setGenerator(generatorName, generatorModule.options);
        }
      } catch (error) {
        console.warn(`Failed to load generator "${generatorName}":`, error);
      }
    }
  }
}
