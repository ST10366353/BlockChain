import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Camera,
  Globe,
  Lock,
  ArrowLeft,
  Building,
  Users,
  Settings as SettingsIcon,
  Mail,
  Smartphone
} from "lucide-react";
import {
  FormField,
  FormValidationSummary,
  ValidatedInput,
  ValidatedTextarea,
  FieldValidationHint,
  PasswordStrengthIndicator,
  FormActions,
  useZodForm,
  useValidationState
} from "@/components/forms/form-utils";
import { enhancedSecuritySettingsSchema, profileSettingsSchema, EnhancedSecuritySettingsForm, ProfileSettingsForm } from "@/shared/types";
import { authService } from "@/lib/api/auth-service";
import { useAppStore } from "@/stores";
import { useAuth } from "@/contexts/AuthContext";

interface SettingsProps {
  isEnterprise?: boolean;
}

export default function Settings({ isEnterprise = false }: SettingsProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Get auth context and store
  const { user } = useAuth();
  const { addNotification, setLoading } = useAppStore();

  // Enhanced forms with real-time validation
  const profileForm = useZodForm<ProfileSettingsForm>(profileSettingsSchema, {
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: ""
    }
  });

  const securityForm = useZodForm<EnhancedSecuritySettingsForm>(enhancedSecuritySettingsSchema, {
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFactorEnabled: false,
      biometricEnabled: true
    }
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isValid: isProfileValid },
    watch: watchProfile
  } = profileForm;

  const {
    register: registerSecurity,
    handleSubmit: handleSecuritySubmit,
    formState: { errors: securityErrors, isValid: isSecurityValid },
    watch: watchSecurity
  } = securityForm;

  // Real-time validation states
  const nameValidation = useValidationState(profileForm, "name");
  const emailValidation = useValidationState(profileForm, "email");
  const bioValidation = useValidationState(profileForm, "bio");
  const currentPasswordValidation = useValidationState(securityForm, "currentPassword");
  const newPasswordValidation = useValidationState(securityForm, "newPassword");
  const confirmPasswordValidation = useValidationState(securityForm, "confirmPassword");

  // Watch form values for dynamic feedback
  const watchedName = watchProfile("name");
  const watchedEmail = watchProfile("email");
  const watchedBio = watchProfile("bio");
  const watchedNewPassword = watchSecurity("newPassword");
  const watchedConfirmPassword = watchSecurity("confirmPassword");

  // Form submit handlers
  const onProfileSubmit = async (data: ProfileSettingsForm) => {
    try {
      setLoading('global', true);

      // Update profile via API
      await authService.updateProfile({
        name: data.name,
        email: data.email
      });

      // Show success notification
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.'
      });

      // Reset form to show updated values
      profileForm.reset(data);
    } catch (error) {
      console.error("Failed to update profile:", error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading('global', false);
    }
  };

  const onSecuritySubmit = async (data: EnhancedSecuritySettingsForm) => {
    try {
      setLoading('global', true);

      // Update password via API
      await authService.changePassword(data.currentPassword, data.newPassword);

      // Show success notification
      addNotification({
        type: 'success',
        title: 'Security Updated',
        message: 'Your password has been successfully changed.'
      });

      // Reset form
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactorEnabled: data.twoFactorEnabled,
        biometricEnabled: data.biometricEnabled
      });
    } catch (error) {
      console.error("Failed to update security settings:", error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update security settings. Please try again.'
      });
    } finally {
      setLoading('global', false);
    }
  };

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    credentialExpiry: true,
    securityAlerts: true,
    weeklyReports: false
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "notifications", label: "Notifications", icon: Bell },
    ...(isEnterprise ? [
      { id: "organization", label: "Organization", icon: Building },
      { id: "team", label: "Team Management", icon: Users },
      { id: "system", label: "System Settings", icon: SettingsIcon }
    ] : [])
  ];


  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
                <p className="text-gray-600">Update your profile picture and personal information</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  label="Full Name"
                  error={profileErrors.name?.message}
                  validationState={nameValidation.validationState}
                  required
                  validationIcon={nameValidation.icon}
                  description="Your full legal name as it appears on official documents"
                >
                  <ValidatedInput
                    type="text"
                    placeholder="Enter your full name"
                    validationState={nameValidation.validationState}
                    {...registerProfile("name")}
                  />
                  <FieldValidationHint
                    hint={`${watchedName?.length || 0}/50 characters`}
                    validationState={watchedName?.length > 50 ? 'error' : watchedName?.length > 40 ? 'warning' : 'success'}
                  />
                </FormField>

                <FormField
                  label="Email Address"
                  error={profileErrors.email?.message}
                  validationState={emailValidation.validationState}
                  required
                  validationIcon={emailValidation.icon}
                  description="Your primary email address for notifications and recovery"
                >
                  <ValidatedInput
                    type="email"
                    placeholder="your.email@example.com"
                    validationState={emailValidation.validationState}
                    {...registerProfile("email")}
                  />
                    <FieldValidationHint
                      hint={
                        (watchedEmail || "").includes('@') && (watchedEmail || "").includes('.')
                          ? "✓ Valid email format"
                          : (watchedEmail || "").length > 0
                            ? "Please enter a valid email address"
                            : "Required for account recovery"
                      }
                      validationState={
                        (watchedEmail || "").includes('@') && (watchedEmail || "").includes('.') ? 'success' :
                        (watchedEmail || "").length > 0 ? 'error' : 'idle'
                      }
                    />
                </FormField>

                <div className="md:col-span-2">
                  <FormField
                    label="Bio"
                    error={profileErrors.bio?.message}
                    validationState={bioValidation.validationState}
                    validationIcon={bioValidation.icon}
                    description="Tell others about yourself and your interests"
                  >
                    <ValidatedTextarea
                      rows={3}
                      placeholder="Brief description of yourself..."
                      validationState={bioValidation.validationState}
                      {...registerProfile("bio")}
                    />
                    <FieldValidationHint
                      hint={`${(watchedBio || "").length}/500 characters`}
                      validationState={(watchedBio || "").length > 500 ? 'error' : (watchedBio || "").length > 400 ? 'warning' : 'success'}
                    />
                  </FormField>
                </div>
              </div>

              <FormActions
                onCancel={() => profileForm.reset()}
                submitLabel="Save Changes"
                isValid={isProfileValid}
                isLoading={false}
              />
            </form>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <FormValidationSummary form={securityForm} />

            <form onSubmit={handleSecuritySubmit(onSecuritySubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    label="Current Password"
                    error={securityErrors.currentPassword?.message}
                    validationState={currentPasswordValidation.validationState}
                    required
                    validationIcon={currentPasswordValidation.icon}
                    description="Enter your current password to verify your identity"
                  >
                    <div className="relative">
                      <ValidatedInput
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        validationState={currentPasswordValidation.validationState}
                        {...registerSecurity("currentPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>

                  <FormField
                    label="New Password"
                    error={securityErrors.newPassword?.message}
                    validationState={newPasswordValidation.validationState}
                    required
                    validationIcon={newPasswordValidation.icon}
                    description="Create a strong password with uppercase, lowercase, numbers, and special characters"
                  >
                    <div className="relative">
                      <ValidatedInput
                        type="password"
                        placeholder="Enter new password"
                        validationState={newPasswordValidation.validationState}
                        {...registerSecurity("newPassword")}
                      />
                      <PasswordStrengthIndicator password={watchedNewPassword || ""} />
                    </div>
                  </FormField>

                  <FormField
                    label="Confirm New Password"
                    error={securityErrors.confirmPassword?.message}
                    validationState={confirmPasswordValidation.validationState}
                    required
                    validationIcon={confirmPasswordValidation.icon}
                    description="Re-enter your new password to confirm"
                  >
                    <ValidatedInput
                      type="password"
                      placeholder="Confirm new password"
                      validationState={confirmPasswordValidation.validationState}
                      {...registerSecurity("confirmPassword")}
                    />
                    <FieldValidationHint
                      hint={
                        watchedConfirmPassword && watchedNewPassword === watchedConfirmPassword
                          ? "✓ Passwords match"
                          : watchedConfirmPassword
                            ? "❌ Passwords don't match"
                            : "Re-enter your new password"
                      }
                      validationState={
                        watchedConfirmPassword && watchedNewPassword === watchedConfirmPassword ? 'success' :
                        watchedConfirmPassword ? 'error' : 'idle'
                      }
                    />
                  </FormField>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Authenticator App</p>
                      <p className="text-sm text-gray-600">Use an authenticator app to generate codes</p>
                    </div>
                    <Button
                      variant={twoFactorEnabled ? "outline" : "default"}
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={twoFactorEnabled ? "" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"}
                    >
                      {twoFactorEnabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Biometric Authentication
                  </CardTitle>
                  <CardDescription>
                    Use fingerprint or face recognition for quick access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Biometric Login</p>
                      <p className="text-sm text-gray-600">Use Touch ID, Face ID, or Windows Hello</p>
                    </div>
                    <Button
                      variant={biometricEnabled ? "outline" : "default"}
                      onClick={() => setBiometricEnabled(!biometricEnabled)}
                      className={biometricEnabled ? "" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"}
                    >
                      {biometricEnabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <FormActions
                onCancel={() => securityForm.reset()}
                submitLabel="Update Security Settings"
                isValid={isSecurityValid}
                isLoading={false}
              />
            </form>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Data Sharing Preferences
                  </CardTitle>
                  <CardDescription>
                    Control how your data is shared with third parties
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Minimal Sharing</p>
                        <p className="text-sm text-gray-600">Only share data you explicitly approve</p>
                      </div>
                      <input type="radio" name="sharing" value="minimal" />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Selective Sharing</p>
                        <p className="text-sm text-gray-600">Share with trusted organizations only</p>
                      </div>
                      <input type="radio" name="sharing" value="selective" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Automatic Sharing</p>
                        <p className="text-sm text-gray-600">Share data automatically with verified partners</p>
                      </div>
                      <input type="radio" name="sharing" value="automatic" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your privacy preferences and data retention
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Analytics Tracking</p>
                        <p className="text-sm text-gray-600">Help improve our service with anonymous usage data</p>
                      </div>
                      <input type="checkbox" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Marketing Communications</p>
                        <p className="text-sm text-gray-600">Receive updates about new features and services</p>
                      </div>
                      <input type="checkbox" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Data Retention</p>
                        <p className="text-sm text-gray-600">Automatically delete old data after 2 years</p>
                      </div>
                      <input type="checkbox" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Choose what email notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Credential Updates</p>
                        <p className="text-sm text-gray-600">Notifications about credential changes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Security Alerts</p>
                        <p className="text-sm text-gray-600">Important security notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.securityAlerts}
                        onChange={(e) => setNotificationSettings({...notificationSettings, securityAlerts: e.target.checked})}
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Weekly Reports</p>
                        <p className="text-sm text-gray-600">Weekly summary of your activity</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyReports}
                        onChange={(e) => setNotificationSettings({...notificationSettings, weeklyReports: e.target.checked})}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Push Notifications
                  </CardTitle>
                  <CardDescription>
                    Manage push notifications on your devices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-600">Receive push notifications on your devices</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Credential Expiry</p>
                        <p className="text-sm text-gray-600">Reminders about expiring credentials</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.credentialExpiry}
                        onChange={(e) => setNotificationSettings({...notificationSettings, credentialExpiry: e.target.checked})}
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Receive critical alerts via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "organization":
        return isEnterprise ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Organization Details
                </CardTitle>
                <CardDescription>
                  Manage your organization's information and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name
                    </label>
                    <Input type="text" defaultValue="TechCorp Inc." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>Technology</option>
                      <option>Healthcare</option>
                      <option>Finance</option>
                      <option>Education</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null;

      default:
        return (
          <div className="text-center py-12">
            <SettingsIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Section</h3>
            <p className="text-gray-600">This section is under development</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEnterprise ? "Enterprise Settings" : "Settings"}
              </h1>
              <p className="text-gray-600">
                Manage your account preferences and security settings
              </p>
            </div>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {renderTabContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
