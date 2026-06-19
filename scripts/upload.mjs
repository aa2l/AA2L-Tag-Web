import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '../public/images');
const dataFilePath = path.join(__dirname, '../data/images.json');

await fs.ensureDir(imagesDir);

const answers = await inquirer.prompt([
  {
    type: 'input',
    name: 'imagePath',
    message: '图片本地路径（支持拖拽文件或输入绝对/相对路径）:',
    validate: (input) => {
      if (!fs.existsSync(input.trim())) {
        return '文件不存在，请检查路径';
      }
      return true;
    }
  },
  {
    type: 'input',
    name: 'description',
    message: '图片描述:',
    default: '无描述'
  },
  {
    type: 'input',
    name: 'author',
    message: '作者:',
    default: '匿名'
  }
]);

const imagePath = answers.imagePath.trim();
const fileName = `${Date.now()}_${path.basename(imagePath)}`;
const destPath = path.join(imagesDir, fileName);

await fs.copy(imagePath, destPath);
console.log(` 图片已复制到: ${destPath}`);

let existingData = [];
if (await fs.pathExists(dataFilePath)) {
  existingData = await fs.readJson(dataFilePath);
}

const newRecord = {
  id: Date.now(),
  image_url: `/images/${fileName}`,
  description: answers.description,
  author: answers.author,
  created_at: new Date().toISOString()
};

existingData.unshift(newRecord);
await fs.writeJson(dataFilePath, existingData, { spaces: 2 });
console.log(' 图片信息已添加到 data/images.json');
console.log('\n 现在请运行: npm run build');