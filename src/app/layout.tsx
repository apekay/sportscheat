import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
// Adsterra zone script URLs, copied per-zone from the publisher dashboard
// ("GET CODE" on each ad unit). Inert until set.
const adsterraSocialBarSrc = process.env.NEXT_PUBLIC_ADSTERRA_SOCIALBAR_SRC;
const adsterraPopunderSrc = process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_SRC;

export const metadata: Metadata = {
  title: "Sporting Chance — Your Daily Sports Briefing",
  description: "Everything you need to sound like a sports fan, in 3 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the pre-paint script below sets data-skin
    // from localStorage, which the server can't know about
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased`}
      >
        {/* Apply the saved reading skin before first paint. Plain script at
            the top of body: renders identically on server and client, and
            stays clear of ad-loader head mutations. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem('sc-skin');if(s)document.documentElement.dataset.skin=s}catch(e){}`,
          }}
        />
        {/* Adsterra (non-Google ad network, no approval gate). Social Bar
            is the site-wide unit — floating bottom bar + interstitials,
            their equivalent of auto/anchor ads. Popunder is the optional
            max-permissive extra. Each renders only when its zone script
            URL is present in env. */}
        {adsterraSocialBarSrc && (
          <Script src={adsterraSocialBarSrc} strategy="afterInteractive" />
        )}
        {adsterraPopunderSrc && (
          <Script src={adsterraPopunderSrc} strategy="afterInteractive" />
        )}
        <Providers>{children}</Providers>
        {googleAdsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
              strategy="afterInteractive"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${googleAdsId}', {
                    send_page_view: true
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
