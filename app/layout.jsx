import "./globals.css";

export const metadata = {
  title: "Proyecto Ceiba",
  description: "Base Next.js para experiencias animadas con GSAP, anime.js y Tailwind.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
