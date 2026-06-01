import Header from "@/components/custom/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
