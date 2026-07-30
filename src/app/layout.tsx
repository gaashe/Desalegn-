
import type { Metadata } from "next";  
import "./globals.css";  
import Navbar from "@/components/Navbar";  
import Footer from "@/components/Footer";  
import Script from "next/script";  
  
export const metadata: Metadata = {  
  title: {  
    default: "Zodaic — Professional Web Development Services",  
    template: "%s | Zodaic",  
  },  
  description:  
    "Professional web development services — custom websites, applications, and tutoring platforms built with modern technologies. Based in Addis Ababa, Ethiopia.",  
  keywords: [  
    "web development",  
    "web design",  
    "Next.js",  
    "React",  
    "portfolio",  
    "tutoring platform",  
    "e-commerce",  
    "Addis Ababa",  
    "Ethiopia",  
  ],  
  authors: [{ name: "Zodaic" }],  
  openGraph: {  
    type: "website",  
    locale: "en_US",  
    url: "https://zodaic.com",  
    siteName: "Zodaic",  
    title: "Zodaic — Professional Web Development Services",  
    description:  
      "Custom websites, applications, and tutoring platforms built with modern technologies.",  
  },  
  twitter: {  
    card: "summary_large_image",  
    title: "Zodaic — Professional Web Development Services",  
    description:  
      "Custom websites, applications, and tutoring platforms built with modern technologies.",  
  },  
  robots: {  
    index: true,  
    follow: true,  
  },  
  other: {  
    "google-adsense-account": "ca-pub-2489819512124255",  
  },  
};  
  
export default function RootLayout({  
  children,  
}: Readonly<{  
  children: React.ReactNode;  
}>) {  
  return (  
    <html lang="en">  
      <head>  
        <Script  
          async  
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2489819512124255"  
          crossOrigin="anonymous"  
          strategy="afterInteractive"  
        />  
      </head>  
      <body>  
        <Navbar />  
        <main className="min-h-screen pt-16">{children}</main>  
        <Footer />  
      </body>  
    </html>  
  );  
}
