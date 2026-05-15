import "./globals.css";

export const metadata = {
  title: "CEIBA 2026",
  description: "Cumbre de Innovación para la Biodiversidad y las Economías Futuras.",
  openGraph: {
    title: "CEIBA 2026",
    description: "Cumbre de Innovación para la Biodiversidad y las Economías Futuras.",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "CEIBA 2026",
    description: "Cumbre de Innovación para la Biodiversidad y las Economías Futuras.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
