import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Shield, RotateCcw, Award, Users, Globe } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const features = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Free Shipping",
      description: "Free shipping on orders over ₹500 worldwide",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "2 Year Warranty",
      description: "Comprehensive warranty on all our products",
    },
    {
      icon: <RotateCcw className="w-6 h-6" />,
      title: "30 Day Returns",
      description: "Easy returns within 30 days of purchase",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Premium Quality",
      description: "Only the finest materials and craftsmanship",
    },
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "100+", label: "Shoe Brands" },
    { number: "25+", label: "Countries Served" },
    { number: "99%", label: "Customer Satisfaction" },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "/professional-woman-ceo.png",
    },
    {
      name: "Mike Chen",
      role: "Head of Design",
      image: "/professional-man-designer.png",
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Experience",
      image: "/professional-woman-customer-service.png",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              About SoleStyle
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold mb-6">
              Your Premier Destination for
              <span className="text-primary"> Premium Footwear</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Since 2020, we've been curating the finest collection of shoes
              from around the world, bringing you style, comfort, and quality
              that stands the test of time.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  SoleStyle was born from a simple belief: everyone deserves to
                  walk in shoes that make them feel confident, comfortable, and
                  stylish. What started as a small passion project has grown
                  into a trusted destination for shoe enthusiasts worldwide.
                </p>
                <p>
                  We partner directly with renowned brands and emerging
                  designers to bring you an exclusive selection of footwear that
                  combines cutting-edge design with uncompromising quality. From
                  athletic performance to elegant formal wear, we have something
                  for every step of your journey.
                </p>
                <p>
                  Our commitment goes beyond just selling shoes. We're dedicated
                  to providing an exceptional shopping experience, expert
                  guidance, and customer service that exceeds your expectations.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                <Image
                  src="/modern-shoe-store-interior.png"
                  alt="SoleStyle store interior"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Why Choose SoleStyle?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing you with the best shopping experience
              and highest quality products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate individuals behind SoleStyle who work tirelessly to
              bring you the best.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-2xl lg:text-3xl font-bold">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              To make premium footwear accessible to everyone, while building a
              sustainable future for the fashion industry. We believe that great
              shoes shouldn't just look good – they should feel good and do good
              for the world.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Customer First</h3>
                <p className="text-sm text-muted-foreground">
                  Every decision we make puts our customers at the center
                </p>
              </div>
              <div>
                <Award className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Quality Promise</h3>
                <p className="text-sm text-muted-foreground">
                  We never compromise on quality or craftsmanship
                </p>
              </div>
              <div>
                <Globe className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Global Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Building a more sustainable and inclusive fashion future
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
