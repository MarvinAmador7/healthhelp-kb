import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchPageContent from "./SearchPageContent";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across all health articles and topics.",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        <Suspense>
          <SearchPageContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
