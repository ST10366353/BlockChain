import { useEffect } from "react"
import { useNavigate } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { LoadingWrapper } from "@/components/ui/loading-wrapper"
import { useAppStore } from "@/stores"
import { Shield, Plus, Eye, Share2, Download, Bell, Search, Filter, MoreVertical, User, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Use Zustand store for global state
  const {
    loading,
    setLoading,
    credentials,
    setCredentials,
    addNotification,
  } = useAppStore()

  // Simulate loading data and populate store
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading('global', true)
      setLoading('credentials', true)

      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Mock credentials data
        const mockCredentials = [
          {
            id: '1',
            name: 'University Degree',
            type: 'Educational',
            issuer: 'MIT University',
            holder: 'john.doe@example.com',
            description: 'Bachelor of Computer Science',
            status: 'active' as const,
            issuedAt: new Date('2023-01-15').toISOString(),
            metadata: { gpa: '3.8', graduationYear: '2023' },
          },
          {
            id: '2',
            name: 'Driver License',
            type: 'Government',
            issuer: 'DMV',
            holder: 'john.doe@example.com',
            description: 'Class C Driver License',
            status: 'active' as const,
            issuedAt: new Date('2022-06-10').toISOString(),
            expirationDate: new Date('2027-06-10').toISOString(),
          },
          {
            id: '3',
            name: 'Employment Certificate',
            type: 'Employment',
            issuer: 'TechCorp Inc.',
            holder: 'john.doe@example.com',
            description: 'Senior Software Engineer',
            status: 'active' as const,
            issuedAt: new Date('2023-03-01').toISOString(),
          },
        ]

        setCredentials(mockCredentials)

        // Add a welcome notification
        addNotification({
          type: 'success',
          title: 'Welcome back!',
          message: 'Your dashboard has been loaded successfully.',
        })

      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Loading Error',
          message: 'Failed to load dashboard data. Please try again.',
        })
      } finally {
        setLoading('global', false)
        setLoading('credentials', false)
      }
    }

    loadDashboardData()
  }, [setLoading, setCredentials, addNotification])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleSettings = () => {
    navigate('/consumer/settings')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">IdentityVault</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search credentials..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-80"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase() || user?.did?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || user?.did || 'user@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSettings}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-gray-600">Manage your digital identity and credentials securely</p>
        </div>

        {/* Stats Cards */}
        <LoadingWrapper
          isLoading={loading.global}
          skeleton="stats"
          className="mb-8"
        >
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{credentials.length}</div>
                <p className="text-xs text-green-600 mt-1">Active credentials</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">3</div>
                <p className="text-xs text-orange-600 mt-1">Requires attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {credentials.filter(c => c.status === 'active').length}
                </div>
                <p className="text-xs text-blue-600 mt-1">Currently valid</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">DID Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Active</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Verified identity</p>
              </CardContent>
            </Card>
          </div>
        </LoadingWrapper>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Credentials */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Credentials</CardTitle>
                    <CardDescription>Your latest digital credentials</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Credential
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Credential Item */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">University Degree</h3>
                        <p className="text-sm text-gray-600">Issued by Stanford University</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Verified
                          </span>
                          <span className="text-xs text-gray-500">2 days ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Professional License</h3>
                        <p className="text-sm text-gray-600">Issued by State Board</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Verified
                          </span>
                          <span className="text-xs text-gray-500">1 week ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Identity Document</h3>
                        <p className="text-sm text-gray-600">Issued by Government</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                          <span className="text-xs text-gray-500">3 hours ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>Organizations requesting verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">Acme Corp</h4>
                    <span className="text-xs text-gray-500">2h ago</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Requesting employment verification</p>
                  <div className="flex space-x-2">
                    <Button size="sm" className="text-xs h-7">Approve</Button>
                    <Button variant="outline" size="sm" className="text-xs h-7">Decline</Button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">TechStart Inc</h4>
                    <span className="text-xs text-gray-500">5h ago</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Requesting education credentials</p>
                  <div className="flex space-x-2">
                    <Button size="sm" className="text-xs h-7">Approve</Button>
                    <Button variant="outline" size="sm" className="text-xs h-7">Decline</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Credential
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Credentials
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Verify Identity
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
