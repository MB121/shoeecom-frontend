import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-slate-900 to-slate-700 text-white">
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Step Into Style
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-slate-200">
            Discover the perfect pair from our premium collection of shoes for
            every occasion
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Shop Now
              </Button>
            </Link>
            <Link href="/products?category=new">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-slate-900 bg-transparent"
              >
                New Arrivals
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-black/20"></div>
      <img
        src="/modern-shoe-store-hero-background-with-stylish-sne.png"
        alt="Hero background"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />
    </section>
  );
}
