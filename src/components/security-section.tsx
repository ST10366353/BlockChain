import { Shield, Lock, Key, Fingerprint, AlertTriangle, CheckCircle, Users, Globe } from "lucide-react"

export function SecuritySection() {

  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data is encrypted using AES-256 encryption before leaving your device."
    },
    {
      icon: Key,
      title: "Zero-Knowledge Architecture",
      description: "We never see or store your private keys or sensitive data."
    },
    {
      icon: Fingerprint,
      title: "Biometric Authentication",
      description: "Optional biometric authentication for enhanced security."
    },
    {
      icon: AlertTriangle,
      title: "Real-time Threat Detection",
      description: "Advanced algorithms detect and prevent unauthorized access attempts."
    }
  ];

  const complianceItems = [
    "GDPR Compliant",
    "CCPA Compliant",
    "ISO 27001 Certified",
    "SOC 2 Type II",
    "Regular Security Audits",
    "Open Source Transparency"
  ];

  return (
    <section id="security" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full mb-6">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Enterprise-Grade Security</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Security is Our
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Top Priority</span>
          </h2>

          <p className="text-xl text-gray-600 leading-relaxed">
            Built with security-first principles, IdentityVault uses military-grade encryption
            and follows industry best practices to protect your digital identity.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Security Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">AES-256</div>
            <div className="text-gray-600">Encryption Standard</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-gray-600">Security Monitoring</div>
          </div>
        </div>

        {/* Compliance Section */}
        <div className="bg-white rounded-3xl p-12 shadow-sm">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Compliance & Certifications
            </h3>
            <p className="text-lg text-gray-600">
              We maintain the highest standards of security and compliance across all jurisdictions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {complianceItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{item}</span>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="border-t pt-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Trusted by Enterprises</h4>
                <p className="text-gray-600">Used by Fortune 500 companies worldwide</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Global Compliance</h4>
                <p className="text-gray-600">Meets international security standards</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Bank-Level Security</h4>
                <p className="text-gray-600">Military-grade encryption and protocols</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
