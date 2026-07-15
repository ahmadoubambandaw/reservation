import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              Le système d&apos;exploitation modulaire pour restaurants.
              Développé par Ndaw-Tech.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterCol
              title="Produit"
              links={[
                { href: "/#modules", label: "Modules" },
                { href: "/pricing", label: "Tarifs" },
                { href: "/restaurants", label: "Restaurants" },
              ]}
            />
            <FooterCol
              title="Compte"
              links={[
                { href: "/login", label: "Connexion" },
                { href: "/register", label: "Créer un compte" },
              ]}
            />
            <FooterCol
              title="Entreprise"
              links={[
                { href: "/#faq", label: "FAQ" },
                { href: "/#contact", label: "Contact" },
              ]}
            />
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ndaw-Tech. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
