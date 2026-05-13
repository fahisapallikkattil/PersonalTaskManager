
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const { user } = useAuth();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-tasks');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-card">
        <Link className="flex items-center justify-center gap-2" href="/">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-xl tracking-tight text-primary">PrimeTask</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          {user ? (
            <Link href="/dashboard">
              <Button variant="default">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Login
              </Link>
              <Link href="/signup">
                <Button variant="default">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                    Master Your Day with <span className="text-primary">PrimeTask</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    The simple, secure, and AI-powered task manager for personal productivity. Organize your life, one task at a time.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href={user ? "/dashboard" : "/signup"}>
                    <Button size="lg" className="gap-2">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative aspect-video lg:aspect-square overflow-hidden rounded-xl shadow-2xl border bg-card">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage.imageHint}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card border-y">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-bold">Strictly Private</h3>
                <p className="text-muted-foreground">Your tasks are yours alone. Secured by industry-standard encryption and privacy controls.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-accent/10">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-headline font-bold">AI Powered</h3>
                <p className="text-muted-foreground">Leverage GenAI to suggest detailed descriptions based on your task titles instantly.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-bold">Simple Workflow</h3>
                <p className="text-muted-foreground">Clean interface designed for speed and clarity. Focus on what matters without the clutter.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 px-4 md:px-6 border-t bg-card">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 mx-auto">
          <p className="text-xs text-muted-foreground">
            © 2024 PrimeTask. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
              Terms of Service
            </Link>
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
