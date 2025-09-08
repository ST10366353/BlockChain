import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  QrCode,
  FileText,
  Link,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Camera,
  Download,
  Shield,
  Plus,
  X,
  Building
} from "lucide-react";

export default function AddCredential() {
  const navigate = useNavigate();
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState({
    title: "",
    issuer: "",
    type: "",
    description: "",
    issueDate: "",
    expiryDate: ""
  });

  const importMethods = [
    {
      id: "file",
      title: "File Upload",
      description: "Upload JSON, PDF, or VC files",
      icon: Upload,
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: "qr",
      title: "QR Code Scan",
      description: "Scan QR code from mobile device",
      icon: QrCode,
      color: "from-green-500 to-emerald-600"
    },
    {
      id: "manual",
      title: "Manual Entry",
      description: "Enter credential details manually",
      icon: FileText,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: "api",
      title: "API Integration",
      description: "Import from external sources",
      icon: Link,
      color: "from-orange-500 to-red-600"
    }
  ];

  const handleFileUpload = (files: FileList | null) => {
    if (files && files[0]) {
      setUploadedFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const renderImportMethod = () => {
    switch (activeMethod) {
      case "file":
        return (
          <div className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <Button
                      onClick={() => setUploadedFile(null)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                      Process File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Drop your credential file here
                    </p>
                    <p className="text-gray-600">
                      or <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
                        browse to upload
                        <input
                          type="file"
                          className="hidden"
                          accept=".json,.pdf,.vc"
                          onChange={(e) => handleFileUpload(e.target.files)}
                        />
                      </label>
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Supports JSON, PDF, and Verifiable Credential files
                  </div>
                </div>
              )}
            </div>

            {!uploadedFile && (
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">JSON File</p>
                    <p className="text-xs text-gray-600">Verifiable Credential</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">PDF Document</p>
                    <p className="text-xs text-gray-600">Certificate or license</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">VC File</p>
                    <p className="text-xs text-gray-600">W3C Verifiable Credential</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      case "qr":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                <QrCode className="w-12 h-12 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Scan QR Code
                </h3>
                <p className="text-gray-600">
                  Use your camera to scan a QR code containing credential data
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Camera access is required to scan QR codes
              </p>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Camera className="w-4 h-4 mr-2" />
                Enable Camera
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">QR Code Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure good lighting for better scanning</li>
                    <li>• Hold your device steady while scanning</li>
                    <li>• QR codes should be at least 2x2 inches in size</li>
                    <li>• Supported formats: JSON, URL, and VC data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "manual":
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credential Title *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., University Degree"
                    value={manualData.title}
                    onChange={(e) => setManualData({...manualData, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issuer *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Stanford University"
                    value={manualData.issuer}
                    onChange={(e) => setManualData({...manualData, issuer: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credential Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={manualData.type}
                    onChange={(e) => setManualData({...manualData, type: e.target.value})}
                  >
                    <option value="">Select type...</option>
                    <option value="education">Education</option>
                    <option value="employment">Employment</option>
                    <option value="license">License</option>
                    <option value="certification">Certification</option>
                    <option value="achievement">Achievement</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <Input
                    type="date"
                    value={manualData.issueDate}
                    onChange={(e) => setManualData({...manualData, issueDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <Input
                    type="date"
                    value={manualData.expiryDate}
                    onChange={(e) => setManualData({...manualData, expiryDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={3}
                    placeholder="Brief description of the credential..."
                    value={manualData.description}
                    onChange={(e) => setManualData({...manualData, description: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline">
                Preview
              </Button>
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={!manualData.title || !manualData.issuer}
              >
                Create Credential
              </Button>
            </div>
          </div>
        );

      case "api":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg flex items-center justify-center mx-auto">
                <Link className="w-12 h-12 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  API Integration
                </h3>
                <p className="text-gray-600">
                  Connect to external services to automatically import credentials
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Educational Institutions</h4>
                      <p className="text-sm text-gray-600">Universities, colleges, online learning platforms</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Connect
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Government Agencies</h4>
                      <p className="text-sm text-gray-600">DMV, Social Security, licensing boards</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Connect
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Professional Organizations</h4>
                      <p className="text-sm text-gray-600">Certifications, memberships, professional licenses</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Connect
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Custom Integration</h4>
                      <p className="text-sm text-gray-600">Connect to your own API or service</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Configure
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Choose an import method</h3>
            <p className="text-gray-600">
              Select one of the options above to start adding your credential
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Credential</h1>
                <p className="text-gray-600">Import or create a new digital credential</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Import Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {importMethods.map((method) => (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                activeMethod === method.id
                  ? "ring-2 ring-indigo-500 shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => setActiveMethod(method.id)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <method.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Method Content */}
        {activeMethod && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                {(() => {
                  const method = importMethods.find(m => m.id === activeMethod);
                  return method ? (
                    <>
                      <div className={`w-8 h-8 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center`}>
                        <method.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <CardTitle>{method.title}</CardTitle>
                        <CardDescription>{method.description}</CardDescription>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            </CardHeader>
            <CardContent>
              {renderImportMethod()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
