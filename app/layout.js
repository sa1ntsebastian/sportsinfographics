import "./globals.css";

export const metadata = {
  title: "Sports Infographics",
  description: "Stat-Angles für Sport-Sharepics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
