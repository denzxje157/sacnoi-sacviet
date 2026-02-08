import fs from "fs"
import https from "https"
import http from "http"
import path from "path"
import { fileURLToPath } from "url"
import { data } from "./data.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const OUTPUT_DIR = path.join(__dirname, "pictures-sanpham")

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

// Tải ảnh với timeout và bỏ qua lỗi
function download(url, folderPath, filename, timeout = 10000) {
  return new Promise((resolve) => {  // never reject, chỉ resolve
    const proto = url.startsWith("https") ? https : http
    const req = proto.get(url, res => {
      if (res.statusCode !== 200) {
        console.log(`⚠️ Failed: ${filename}, status ${res.statusCode}`)
        res.resume() // tiêu thụ dữ liệu để giải phóng socket
        return resolve()
      }

      const ext =
        path.extname(url.split("?")[0]) ||
        (res.headers["content-type"]?.includes("webp") ? ".webp" : ".jpg")

      const filePath = path.join(folderPath, filename + ext)
      const file = fs.createWriteStream(filePath)

      res.pipe(file)
      file.on("finish", () => {
        file.close()
        console.log("Downloaded:", filePath)
        resolve()
      })
      file.on("error", (err) => {
        console.log(`⚠️ Failed writing: ${filename}`, err.message)
        resolve()
      })
    })

    req.on("error", err => {
      console.log(`⚠️ Request error: ${filename}`, err.message)
      resolve()
    })

    req.setTimeout(timeout, () => {
      console.log(`⚠️ Timeout: ${filename}`)
      req.abort()
      resolve()
    })
  })
}

;(async () => {
  for (const ethnic of data) {
    const ethnicFolder = path.join(OUTPUT_DIR, slugify(ethnic.e))
    if (!fs.existsSync(ethnicFolder)) fs.mkdirSync(ethnicFolder, { recursive: true })

    for (const item of ethnic.items) {
      const filename = slugify(item.n)
      await download(item.img, ethnicFolder, filename)
    }
  }
  console.log("✅ Hoàn tất tải ảnh theo dân tộc (bỏ qua link lỗi)!")
})()