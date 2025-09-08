import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckSquare,
  Square,
  Upload,
  Download,
  FileText,
  Shield,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  X,
  Search
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface BulkOperation {
  id: string;
  type: "verify" | "share" | "update" | "delete" | "export";
  name: string;
  description: string;
  itemCount: number;
  estimatedTime: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  errors: string[];
}

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  operations?: BulkOperation[];
  onStartOperation?: (operationId: string) => void;
  onPauseOperation?: (operationId: string) => void;
  onCancelOperation?: (operationId: string) => void;
}

export function BulkOperationsModal({
  isOpen,
  onClose,
  title = "Bulk Operations",
  operations: initialOperations,
  onStartOperation,
  onPauseOperation,
  onCancelOperation,
}: BulkOperationsModalProps) {
  const { success } = useToast();

  const [operations, setOperations] = useState<BulkOperation[]>(initialOperations || [
    {
      id: "verify-credentials",
      type: "verify",
      name: "Verify Employee Credentials",
      description: "Bulk verification of employee ID cards and certifications",
      itemCount: 145,
      estimatedTime: "8-12 minutes",
      status: "pending",
      progress: 0,
      errors: []
    },
    {
      id: "export-reports",
      type: "export",
      name: "Generate Compliance Reports",
      description: "Export compliance reports for all departments",
      itemCount: 23,
      estimatedTime: "3-5 minutes",
      status: "pending",
      progress: 0,
      errors: []
    },
    {
      id: "update-metadata",
      type: "update",
      name: "Update Credential Metadata",
      description: "Update expiration dates and issuer information",
      itemCount: 67,
      estimatedTime: "5-8 minutes",
      status: "pending",
      progress: 0,
      errors: []
    }
  ]);

  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOperations = operations.filter(op => {
    const matchesSearch = op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         op.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || op.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedOperations.length === filteredOperations.length) {
      setSelectedOperations([]);
    } else {
      setSelectedOperations(filteredOperations.map(op => op.id));
    }
  };

  const handleSelectOperation = (operationId: string) => {
    setSelectedOperations(prev =>
      prev.includes(operationId)
        ? prev.filter(id => id !== operationId)
        : [...prev, operationId]
    );
  };

  const handleStartSelected = () => {
    selectedOperations.forEach(id => {
      handleStartOperation(id);
    });
    setSelectedOperations([]);
  };

  const handlePauseSelected = () => {
    selectedOperations.forEach(id => {
      handlePauseOperation(id);
    });
  };

  const handleCancelSelected = () => {
    selectedOperations.forEach(id => {
      handleCancelOperation(id);
    });
    setSelectedOperations([]);
  };

  const handleStartOperation = (operationId: string) => {
    setOperations(prev =>
      prev.map(op =>
        op.id === operationId
          ? { ...op, status: "running" as const }
          : op
      )
    );

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setOperations(prev =>
          prev.map(op =>
            op.id === operationId
              ? { ...op, status: "completed" as const, progress: 100 }
              : op
          )
        );
        success("Operation completed", `${operations.find(op => op.id === operationId)?.name} has been completed successfully.`);
      } else {
        setOperations(prev =>
          prev.map(op =>
            op.id === operationId
              ? { ...op, progress: Math.round(progress) }
              : op
          )
        );
      }
    }, 1000);

    if (onStartOperation) {
      onStartOperation(operationId);
    }
  };

  const handlePauseOperation = (operationId: string) => {
    setOperations(prev =>
      prev.map(op =>
        op.id === operationId
          ? { ...op, status: "pending" as const }
          : op
      )
    );

    if (onPauseOperation) {
      onPauseOperation(operationId);
    }
  };

  const handleCancelOperation = (operationId: string) => {
    setOperations(prev =>
      prev.map(op =>
        op.id === operationId
          ? { ...op, status: "pending" as const, progress: 0 }
          : op
      )
    );

    if (onCancelOperation) {
      onCancelOperation(operationId);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "running":
        return "text-blue-600 bg-blue-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "verify":
        return <Shield className="w-4 h-4" />;
      case "export":
        return <Download className="w-4 h-4" />;
      case "update":
        return <FileText className="w-4 h-4" />;
      case "share":
        return <Upload className="w-4 h-4" />;
      case "delete":
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CheckSquare className="w-5 h-5 mr-2" />
                {title}
              </CardTitle>
              <CardDescription>
                Manage and monitor bulk operations across your organization
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Controls */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search operations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedOperations.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedOperations.length} selected
                  </span>
                  <Button size="sm" onClick={handleStartSelected}>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                  <Button size="sm" variant="outline" onClick={handlePauseSelected}>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelSelected}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Operations List */}
          <div className="max-h-96 overflow-y-auto">
            <div className="p-4 space-y-3">
              {/* Header with Select All */}
              <div className="flex items-center space-x-3 pb-2 border-b">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  {selectedOperations.length === filteredOperations.length && filteredOperations.length > 0 ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span>Select All</span>
                </button>
              </div>

              {filteredOperations.map((operation) => (
                <Card key={operation.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleSelectOperation(operation.id)}
                        className="mt-1"
                      >
                        {selectedOperations.includes(operation.id) ? (
                          <CheckSquare className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {/* Operation Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(operation.type)}
                            <h3 className="font-medium text-gray-900">{operation.name}</h3>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(operation.status)}`}>
                            {operation.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{operation.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Items:</span>
                            <span className="ml-2 font-medium">{operation.itemCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Est. Time:</span>
                            <span className="ml-2 font-medium">{operation.estimatedTime}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Progress:</span>
                            <span className="ml-2 font-medium">{operation.progress}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Errors:</span>
                            <span className="ml-2 font-medium text-red-600">{operation.errors.length}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {operation.status === "running" && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${operation.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Errors */}
                        {operation.errors.length > 0 && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-800">Errors encountered:</p>
                                <ul className="text-sm text-red-700 mt-1">
                                  {operation.errors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        {operation.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartOperation(operation.id)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}

                        {operation.status === "running" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePauseOperation(operation.id)}
                            >
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelOperation(operation.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}

                        {operation.status === "completed" && (
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Results
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredOperations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No operations found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {filteredOperations.length} operation{filteredOperations.length !== 1 ? "s" : ""} •
                {operations.filter(op => op.status === "running").length > 0 && (
                  <span className="ml-2 text-blue-600">
                    {operations.filter(op => op.status === "running").length} running
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button
                  onClick={handleStartSelected}
                  disabled={selectedOperations.length === 0}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Start Selected ({selectedOperations.length})
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
