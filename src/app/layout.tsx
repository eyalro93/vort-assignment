import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Vort — כמה אתה שווה",
  description:
    "בנצ׳מרק שכר לאנשי תקשורת ומדיה בישראל. חמש שאלות, טווח שכר מיידי, ומדויק יותר אם תרצו.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable}`}>
      <body className="min-h-screen bg-page-bg font-sans text-ink-body antialiased">
        {children}
      </body>
    </html>
  );
}
