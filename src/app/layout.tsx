import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

// metadataBase is derived from the actual request host (rather than a fixed
// env var) so absolute OG image URLs resolve correctly whether this is
// opened via localhost, a LAN IP for phone testing, or a public tunnel --
// all of which WhatsApp's own crawler needs to be able to reach.
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: "Vort — כמה אתם שווים",
    description:
      "בנצ׳מרק שכר לאנשי תקשורת ומדיה בישראל. חמש שאלות, טווח שכר מיידי, ומדויק יותר אם תרצו.",
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable}`}>
      <body className="min-h-screen bg-page-bg font-sans text-ink-body antialiased">
        {children}
      </body>
    </html>
  );
}
