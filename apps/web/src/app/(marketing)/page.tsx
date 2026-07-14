import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MODULES } from "@/lib/modules";
import { Faq } from "./_components/faq";
import { HeroPreview } from "./_components/hero-preview";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-[420px] glow" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-5">
              <span className="size-1.5 rounded-full bg-primary" />
              Restaurant OS · multi-tenant
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Le système d&apos;exploitation{" "}
              <span className="text-gradient">de votre restaurant</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
              Réservations, point de vente, cuisine, stocks, CRM, comptabilité,
              marketing et rapports. Une seule plateforme — activez les modules
              dont vous avez besoin.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  Commencer gratuitement <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">Voir les tarifs</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-14">
            <HeroPreview />
          </Reveal>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Tous vos modules, un seul endroit
          </h2>
          <p className="mt-3 text-muted-foreground">
            Chaque module s&apos;active selon votre abonnement. Ajoutez ceux qui
            comptent, quand vous en avez besoin.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <Reveal key={m.key} delay={(i % 3) * 0.06}>
              <Card className="group h-full p-6 transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <m.icon className="size-5" />
                </div>
                <h3 className="font-semibold">{m.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {m.description}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Value strip */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">
          {[
            ["Multi-tenant sécurisé", "Chaque restaurant est totalement isolé. Vos données n'appartiennent qu'à vous."],
            ["Prêt pour le mobile", "Une API REST unique alimente le web et votre future application Flutter."],
            ["Design premium", "Interface moderne, rapide et responsive — en mode clair comme sombre."],
          ].map(([title, desc], i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="flex gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Questions fréquentes
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <Faq />
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <Card className="relative overflow-hidden border-primary/20 p-10 text-center sm:p-16">
            <div className="absolute inset-0 glow" aria-hidden />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Prêt à moderniser votre restaurant ?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Créez votre espace en quelques minutes. Essai gratuit, sans carte
                bancaire.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link href="/register">
                  Créer mon restaurant <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </Reveal>
      </section>
    </>
  );
}
