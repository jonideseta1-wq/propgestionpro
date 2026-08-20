export const metadata = {
  title: "InmoGest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, minHeight: "100vh", background: "#EFE8D8" }}>{children}</body>
    </html>
  );
}
