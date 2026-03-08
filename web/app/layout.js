import "./globals.css";

export const metadata = {
  title: "Hỗ trợ khẩn cấp",
  description: "Hệ thống điều phối tình nguyện viên cấp cứu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}