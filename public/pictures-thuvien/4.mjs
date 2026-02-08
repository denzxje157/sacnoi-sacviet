import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// 1. IMPORT DATA (Đảm bảo file data.js của bạn có lệnh 'export const libraryData = ...')
import { libraryData } from './data.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hàm xóa dấu tiếng Việt để làm tên thư mục an toàn cho code
const slugify = (str) => {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '');
};

const categoryMap = {
  'architecture': 'kien-truc',
  'ritual': 'nghi-le',
  'festival': 'le-hoi'
};

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        res.pipe(fileStream);
        fileStream.on('finish', () => { fileStream.close(); resolve(); });
      } else { reject(new Error(`Lỗi: ${res.statusCode}`)); }
    }).on('error', reject);
  });
};

async function start() {
  console.log("🚀 Bắt đầu xử lý dữ liệu...");
  const newData = [];

  for (const item of libraryData) {
    try {
      const catSlug = categoryMap[item.category] || slugify(item.category);
      const ethnicSlug = slugify(item.ethnic);
      const targetDir = path.join(__dirname, catSlug, ethnicSlug);

      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      const ext = path.extname(item.image.split('?')[0]) || '.jpg';
      const fileName = `${item.id}${ext}`;
      const savePath = path.join(targetDir, fileName);

      // Tải ảnh
      console.log(`📸 Đang tải: ${fileName}`);
      await downloadImage(item.image, savePath);

      // Cập nhật đường dẫn mới cho item (dùng cho .tsx)
      // Đường dẫn này sẽ là: pictures-thuvien/kien-truc/kinh/ten-file.jpg
      const newImagePath = `pictures-thuvien/${catSlug}/${ethnicSlug}/${fileName}`;
      
      newData.push({
        ...item,
        image: newImagePath
      });

    } catch (err) {
      console.error(`❌ Lỗi tại ${item.id}:`, err.message);
      newData.push(item); // Giữ nguyên nếu lỗi
    }
  }

  // 2. XUẤT RA FILE DATA MỚI
  const fileContent = `export const libraryData = ${JSON.stringify(newData, null, 2)};`;
  fs.writeFileSync(path.join(__dirname, 'data-new.js'), fileContent);
  
  console.log("\n✅ HOÀN THÀNH!");
  console.log("1. Ảnh đã tải vào các thư mục kien-truc, nghi-le, le-hoi.");
  console.log("2. File dữ liệu mới đã được tạo: data-new.js (đã đổi toàn bộ link image).");
}

start();