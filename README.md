# Quản lý xe

PWA quản lý đội xe. Chạy được cả trên điện thoại lẫn máy tính. Dữ liệu lưu Firestore.

## 1. Đẩy lên GitHub

```bash
git init
git add .
git commit -m "init quan ly xe"
git branch -M main
git remote add origin https://github.com/<user>/quanlyxe.git
git push -u origin main
```

**Settings → Pages → Source: Deploy from a branch → main / (root) → Save**
Vài phút sau app chạy ở `https://<user>.github.io/quanlyxe/`.

## 2. Nối Firebase

Firebase Console → Project Settings → Your apps → Web app → copy `firebaseConfig`,
dán đè vào biến `FIREBASE_CONFIG` ở đầu `<script>` trong `index.html`.

Chưa dán thì app chạy **dữ liệu mẫu** để xem giao diện — không lưu gì cả.

Thêm domain `<user>.github.io` vào **Authentication → Settings → Authorized domains**.

## 3. Firestore rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /vehicles/{v} {
      allow read, write: if true;
      match /monthly/{m} { allow read, write: if true; }
    }
  }
}
```

Muốn chặt hơn thì bật Anonymous Auth rồi đổi `if true` → `if request.auth != null`.

## 4. Cấu trúc dữ liệu

```
vehicles/{bienSo}
  hangXe, soCho, loaiXe, namSX, khuVuc
  dungGiayTo, hinhThuc                 ← đứng tên ai / hình thức khai thác
  vin, soMay, caVet

  dangKiemMoi, hetHanDangKiem          ← YYYY-MM-DD
  dinhViMoi,   hetHanDinhVi,  nhaMangDinhVi, linkDinhVi
  phuHieuMoi,  hetHanPhuHieu, soPhuHieu

  ngayMua, giaMua, phuongThucMua, traTruoc, soTienVay
  ghiChuPhapLy
  linkDrive                            ← link thư mục hồ sơ xe
  anh: [link, link, ...]

vehicles/{bienSo}/monthly/{YYYY-MM}
  doanhThu, chiPhi, nganHang, ghiChu
```

Biển số làm document ID nên không bao giờ trùng.
Lợi nhuận **không lưu** — app tự tính `doanhThu − chiPhi − nganHang`.

## 5. Cảnh báo & thông báo

Ngưỡng nằm ở dòng `const WARN_DAYS = 14;` — đổi số đó là đổi toàn app.

App theo dõi 3 loại thời hạn: **đăng kiểm, định vị, phù hiệu**.

- Chuông 🔔 trên thanh tiêu đề hiện số mục đang ≤ 14 ngày hoặc đã quá hạn. Bấm vào xem danh sách.
- Lần đầu app hiện nút **Bật thông báo** → cho phép → từ đó mỗi ngày mở app lần đầu sẽ có thông báo hệ thống.
- Tem tròn trên mỗi xe hiển thị **giấy tờ gấp nhất**, chữ nhỏ bên dưới cho biết là ĐK / ĐV / PH.
- Ba pill nhỏ trên thẻ xe cho thấy cả 3 loại cùng lúc.

Thông báo chạy khi app đang mở. Muốn nhắc kể cả lúc không mở app thì cần Firebase Cloud
Messaging + Cloud Function chạy theo lịch — làm sau được.

**iPhone**: phải Add to Home Screen (iOS 16.4+) rồi mở từ icon thì thông báo mới hoạt động.

## 6. Máy tính vs điện thoại

Cùng một file, tự đổi layout ở mốc 900px:

| | Điện thoại | Máy tính |
|---|---|---|
| Menu | thanh dưới đáy | sidebar bên trái |
| Danh sách xe | 1 cột | lưới nhiều cột |
| Chi tiết | 1 cột | 2 cột |

## 7. Logo & icon

`icon-192.png` và `icon-512.png` đã có sẵn trong thư mục — biển vàng chữ **QLX** trên nền đen.
Dùng cho icon màn hình chính và ảnh trong thông báo.

Logo trong app là SVG viết thẳng trong `index.html`, ở hằng số `LOGO` gần đầu `<script>`:

- Đổi chữ: sửa `QLX` trong thẻ `<text>`
- Thay hẳn bằng ảnh riêng: đổi giá trị `LOGO` thành `` `<img src="logo.png" class="mark">` `` rồi bỏ file `logo.png` vào cùng thư mục

Muốn đổi luôn icon PWA thì thay 2 file png, giữ nguyên tên và kích thước.

## 8. Google Drive

**Thư mục hồ sơ**: dán link thư mục vào ô "Link thư mục Google Drive" khi thêm/sửa xe.
Tab *Giấy tờ & xe* sẽ có nút mở thẳng ra Drive.

**Ảnh**: dán link file Drive vào ô "Link ảnh" là được, app tự đổi sang dạng hiện được.
Nhận cả 3 kiểu link:

```
https://drive.google.com/file/d/<ID>/view?usp=sharing
https://drive.google.com/open?id=<ID>
https://drive.google.com/uc?export=view&id=<ID>
```

Điều kiện: file phải đặt chia sẻ **"Bất kỳ ai có đường liên kết" → Người xem**.
Để "Bị hạn chế" thì ô ảnh sẽ báo không mở được.

Dán nhầm link *thư mục* vào ô ảnh thì app nhận ra và hiện ô "📁 Thư mục Drive" thay vì báo lỗi.

Lưu ý: endpoint `drive.google.com/thumbnail` là API không chính thức của Google, chạy ổn
nhưng họ có quyền đổi. Cần sửa thì chỉ sửa hàm `imgSrc()` trong `index.html`, không phải
đụng tới dữ liệu.

## 9. Khu vực

Trường `khuVuc` dùng ở 3 chỗ:

- Hàng chip lọc trên đầu danh sách (chỉ hiện khi có từ 2 khu vực trở lên)
- Dòng mô tả trên thẻ xe và màn chi tiết
Ô nhập có gợi ý các khu vực đã dùng, gõ tên mới cũng được.

## Ghi chú

- **Ảnh**: dán link, mỗi dòng một cái. Link hỏng hiện ô báo lỗi thay vì vỡ layout.
- **Dư nợ** ở tab Tài chính = số tiền vay − tổng cột "Ngân hàng" các tháng đã nhập. Chưa tính lãi.
