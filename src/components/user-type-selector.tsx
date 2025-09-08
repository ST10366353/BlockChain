import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Building2, Zap, ArrowRight } from "lucide-react"

export function UserTypeSelector() {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Experience</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Different users have different needs. Select the experience that's right for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Consumer */}
          <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-indigo-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Consumer</CardTitle>
              <CardDescription className="text-base">
                Perfect for individuals managing personal digital credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Personal credential wallet
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Easy sharing & verification
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Privacy-first design
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Mobile-optimized
                </li>
              </ul>
              <Button
                className="w-full group-hover:shadow-lg"
                onClick={() => navigate("/onboarding")}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-purple-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <CardDescription className="text-base">
                For organizations managing employee credentials and compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Bulk credential management
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Compliance dashboard
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Audit trails & reporting
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Team management
                </li>
              </ul>
              <Button
                className="w-full group-hover:shadow-lg"
                onClick={() => navigate("/enterprise/dashboard")}
              >
                Schedule Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Power User */}
          <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-orange-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Power User</CardTitle>
              <CardDescription className="text-base">
                Advanced features for developers and technical professionals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  API access & integrations
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Custom workflows
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Developer tools
                </li>
              </ul>
              <Button
                className="w-full group-hover:shadow-lg"
                onClick={() => navigate("/power-user/dashboard")}
              >
                Start Building
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
