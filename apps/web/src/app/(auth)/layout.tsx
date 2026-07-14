import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-col">
      <div className="absolute inset-x-0 top-0 h-[380px] glow" aria-hidden />
      <header className="relative z-10 flex items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" aria-label="Accueil">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
