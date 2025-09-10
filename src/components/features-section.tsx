import { Shield, Lock, Globe, Smartphone, Cloud, Users, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"

export function FeaturesSection() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Decentralized Identity",
      description: "Take control of your digital identity without relying on centralized authorities.",
      benefits: ["Self-sovereign", "Privacy-first", "Blockchain-secured"]
    },
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All your credentials are encrypted and can only be accessed by you or authorized parties.",
      benefits: ["Zero-knowledge proof", "Military-grade encryption", "Secure sharing"]
    },
    {
      icon: Globe,
      title: "Universal Compatibility",
      description: "Works across all platforms and services that support decentralized identity standards.",
      benefits: ["Interoperable", "Standards-compliant", "Future-proof"]
    },
    {
      icon: Smartphone,
      title: "Mobile & Web Access",
      description: "Access your identity wallet from any device, anywhere in the world.",
      benefits: ["Cross-platform", "Offline access", "Seamless sync"]
    },
    {
      icon: Cloud,
      title: "Secure Backup & Recovery",
      description: "Your credentials are safely backed up with advanced recovery mechanisms.",
      benefits: ["Distributed backup", "Social recovery", "Emergency access"]
    },
    {
      icon: Users,
      title: "Selective Disclosure",
      description: "Share only the information you want to share, when you want to share it.",
      benefits: ["Granular control", "Minimal disclosure", "Privacy-preserving"]
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Modern Identity</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            IdentityVault combines cutting-edge cryptography with user-friendly design to give you
            complete control over your digital identity.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-all duration-300 hover:shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <IconComponent className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Secure Your Digital Identity?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already taken control of their digital identity.
              Start your journey to a more secure and private online experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button
                size="lg"
                className="group"
                onClick={() => navigate("/onboarding")}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/login")}
              >
                Sign In to Existing Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
