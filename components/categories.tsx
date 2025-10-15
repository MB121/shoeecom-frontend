import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    name: "Men's Shoes",
    href: "/products?category=men",
    image: "/mens-dress-shoes-and-sneakers-collection.png",
    count: "150+ styles",
  },
  {
    name: "Women's Shoes",
    href: "/products?category=women",
    image: "/womens-heels-boots-and-sneakers-collection.png",
    count: "200+ styles",
  },
  {
    name: "Kids Shoes",
    href: "/products?category=kids",
    image: "/colorful-kids-shoes-and-sneakers.png",
    count: "80+ styles",
  },
  {
    name: "Sports & Athletic",
    href: "/products?category=sports",
    image: "/athletic-sports-shoes-running-sneakers.png",
    count: "120+ styles",
  },
];

export function Categories() {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground text-lg">
            Find the perfect shoes for every occasion and style
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.name} href={category.href}>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {category.count}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
