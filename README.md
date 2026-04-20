# Image Frame Studio 📸

> Một Full-stack WebApp cho phép tải ảnh lên, tự động đọc thông số máy ảnh (EXIF Metadata), thay đổi kích thước và chèn các khung viền (Frame) với phong cách nhiếp ảnh hiện đại (tương tự như ứng dụng Liit trên iOS).

Dự án được xây dựng theo kiến trúc **Monorepo** với UI cực kỳ đẹp và trải nghiệm mượt mà, bao gồm cả Realtime Preview và Batch Processing.

---

## 🎨 Tính năng nổi bật

### 1. Editor Giao diện Realtime
- Trải nghiệm Live Preview tự động cực nhanh (debounced).
- Mọi thay đổi về thông số hay Frame style đều hiển thị ngay lập tức (không cần bấm "Apply").

### 2. Xử lý ảnh chuyên nghiệp & EXIF
- Upload ảnh hỗ trợ đa định dạng: **JPEG, PNG, WebP**, và tự động convert **HEIC/HEIF** (ảnh từ iPhone) ngay trên trình duyệt trước khi upload.
- Tự động bóc tách và làm chuẩn format các EXIF metadata: Lens, Focal Length, Aperture (f/1.8), Shutter Speed (1/200s), ISO.

### 3. Đa dạng bộ lọc khung (9 Styles Mới Nhất)
| Style | Phong cách | Style | Phong cách |
|---|---|---|---|
| `white-minimal` | Nền trắng, Minimalist sans-serif | `instax` | Kỷ niệm Instax Mini, viền kem |
| `black-film` | Nền đen, Title In hoa, Điện ảnh | `kodachrome` | Vàng ấm cổ điển Kodachrome |
| `light-leica` | Nền kem, Font Serif sang trọng | `darkroom` | Nền đen sâu, Accent đỏ thẫm |
| `film-strip` | Analog film cuộn lỗ vuông | `fujifilm` | Nền trắng, Xanh lơ Fuji |
| `polaroid` | Viền dưới dày, font nghiêng | | |

### 4. Custom Watermark
- Upload logo cá nhân (PNG/SVG).
- Hỗ trợ tuỳ chỉnh: Vị trí (Top, Bottom, Center), Kích thước (Scale), và Độ trong suốt (Opacity).

### 5. Xử lý hàng loạt (Batch Processing)
- Kéo thả nhiều ảnh cùng lúc, apply chung một Profile thông số và xuất ra đồng bộ. *(Đang được hoàn thiện giao diện, Core API đã hoạt động)*

---

## 🏗 Công nghệ sử dụng (Tech Stack)

### Workspace Monorepo
Dự án chia làm 2 phân vùng `apps/frontend` và `apps/backend`. Việc quản lý do `npm workspaces` đảm nhận.

- **Frontend (Next.js 15, React 19):**
  - Không sử dụng Tailwind (để code CSS Vanilla kiểm soát Dark Theme + Animations cực chi tiết).
  - Sử dụng `heic2any` (Client-side HEIC parser).
  - Trải nghiệm Responsive 1-màn-hình (`100vh`) siêu mượt ở cả Desktop và Mobile.

- **Backend (NestJS, TypeScript):**
  - **Sharp**: Lõi xử lý đồ hoạ ảnh bằng NodeJS mạnh mẽ, tốc độ milli-giây.
  - **exifr**: Thư viện trích xuất EXIF an toàn.
  - Sẵn sàng tối ưu RAM/Bundle cho *Vercel Serverless Functions*.

---

## 🚀 Hướng dẫn chạy dự án (Quick Start)

**Yêu cầu hệ thống:** Node.js v20+

```bash
# 1. Cài đặt toàn bộ Packges (Frontend + Backend)
npm install

# 2. Khởi động đồng thời cả Backend (Port 3000) và Frontend (Port 3001)
npm run dev
```

*Sau đó truy cập:*
- UI Editor: [http://localhost:3001](http://localhost:3001)
- Backend Swagger API Docs: [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 📖 Cấu trúc Thư mục Code

```text
snap-frame/
├── package.json               # Monorepo Scripts (start: dev, build, ...)
│
├── apps/
│   ├── frontend/              # (Next.js 15 App Router)
│   │   ├── src/
│   │   │   ├── app/           # Pages, Layout, Global CSS
│   │   │   ├── components/    # StylePicker, DropZone, WatermarkPanel,...
│   │   │   └── lib/           # API Client, Base64/Blob helpers
│   │   └── package.json       
│   │
│   └── backend/               # (NestJS Core API)
│       ├── src/
│       │   ├── frame/         # Logic bóc tách ảnh, SVG config, Frame generator
│       │   └── batch/         # Module xử lý batch processing
│       ├── api/index.ts       # Entry point cho Vercel Serverless
│       └── vercel.json        # Config Deploy
```

---

## ☁️ Deployment (Vercel)

Dự án này đã được tinh chỉnh cho Free Tier của Vercel (1GB Memory, 4.5MB Payload limit).
Để Deploy, hãy kết nối repository này với Vercel. 
- Build framework cho folder `apps/frontend` là `Next.js`.
- Endpoint backend được gọi thông qua `/api`. Nếu deploy dạng Monorepo, bạn cần link các function theo `vercel.json` ở backend.

> Lưu ý về Vercel Free-tier: Dung lượng upload file qua HTTP giới hạn ở mức 4.5MB. Quá mức này API có thể trả về lỗi 413. Chạy `npm run dev` ở Local thì có thể lên tới ảnh 20MB.
