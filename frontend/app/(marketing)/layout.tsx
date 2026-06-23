import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNav />
      <main className="pt-[68px]">{children}</main>
      <Footer />
    </>
  );
}
