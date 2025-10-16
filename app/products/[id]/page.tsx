import { mockProducts } from "@/lib/mock-data";
import ProductDetailClient from "./ProductDetailClient";
import type { Product } from "@/types/product";

// ✅ This tells Next.js which product IDs to statically generate at build time
export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    id: product.id.toString(),
  }));
}

// ✅ This is a server component (no "use client")
export default function ProductPage({ params }: { params: { id: string } }) {
  const product: Product | undefined = mockProducts.find(
    (p) => p.id.toString() === params.id
  );

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <p className="text-muted-foreground">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Pass the product data into the client component
  return <ProductDetailClient product={product} />;
}
