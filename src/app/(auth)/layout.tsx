import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-background flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="text-h6 text-foreground mb-8 font-semibold">
        MenuMaker AI
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
