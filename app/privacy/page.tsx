import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Lock, Users, Globe, Mail } from "lucide-react"

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 15, 2024"

  const sections = [
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Information We Collect",
      content: [
        "Personal information you provide when creating an account (name, email, phone number)",
        "Payment information processed securely through our payment partners",
        "Shipping and billing addresses for order fulfillment",
        "Purchase history and preferences to improve your shopping experience",
        "Device and browser information for security and optimization purposes",
        "Cookies and similar technologies for website functionality",
      ],
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: "How We Use Your Information",
      content: [
        "Process and fulfill your orders and provide customer service",
        "Send order confirmations, shipping updates, and important account information",
        "Personalize your shopping experience and recommend products",
        "Improve our website, products, and services",
        "Prevent fraud and ensure the security of our platform",
        "Comply with legal obligations and enforce our terms of service",
      ],
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Information Sharing",
      content: [
        "We do not sell, rent, or trade your personal information to third parties",
        "Service providers who help us operate our business (payment processors, shipping companies)",
        "Legal authorities when required by law or to protect our rights",
        "Business partners only with your explicit consent",
        "Aggregated, non-personal data for analytics and business insights",
      ],
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Data Security",
      content: [
        "Industry-standard encryption for all data transmission and storage",
        "Secure payment processing through PCI-compliant partners",
        "Regular security audits and vulnerability assessments",
        "Limited access to personal information on a need-to-know basis",
        "Secure data centers with physical and digital protection measures",
        "Incident response procedures for any potential security breaches",
      ],
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Your Rights",
      content: [
        "Access and review the personal information we have about you",
        "Request corrections to inaccurate or incomplete information",
        "Delete your account and associated personal data",
        "Opt-out of marketing communications at any time",
        "Data portability - receive your data in a structured format",
        "Lodge complaints with relevant data protection authorities",
      ],
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Contact Us",
      content: [
        "If you have questions about this Privacy Policy or our data practices, please contact us:",
        "Email: privacy@solestyle.com",
        "Phone: +1 (555) 123-4567",
        "Mail: SoleStyle Privacy Team, 123 Fashion Street, New York, NY 10001",
        "We will respond to your inquiry within 30 days",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Legal
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold mb-6">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-muted-foreground mt-4">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <p className="text-muted-foreground leading-relaxed">
                At SoleStyle, we are committed to protecting your privacy and ensuring the security of your personal
                information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information
                when you visit our website, make a purchase, or interact with our services. By using our services, you
                consent to the practices described in this policy.
              </p>
            </CardContent>
          </Card>

          {/* Policy Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      {section.icon}
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cookies Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze website
                traffic, and personalize content. You can control cookie settings through your browser preferences.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Essential Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Required for basic website functionality, security, and your shopping cart.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Analytics Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Help us understand how visitors interact with our website to improve performance.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Marketing Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Used to deliver personalized advertisements and track campaign effectiveness.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Preference Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Remember your settings and preferences for a better user experience.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
                legal requirements, or other factors. We will notify you of any material changes by posting the updated
                policy on our website and updating the "Last updated" date. We encourage you to review this policy
                periodically to stay informed about how we protect your information.
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="mt-8 bg-muted/30">
            <CardContent className="p-8 text-center">
              <h3 className="font-semibold mb-4">Questions About Our Privacy Policy?</h3>
              <p className="text-muted-foreground mb-6">
                If you have any questions or concerns about this Privacy Policy or our data practices, please don't
                hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:privacy@solestyle.com"
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Privacy Team
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
