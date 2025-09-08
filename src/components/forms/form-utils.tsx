import { useForm, UseFormProps, FieldValues, UseFormReturn, FieldPath, FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Generic hook for creating forms with Zod validation
export function useZodForm<T extends FieldValues>(
  schema: z.ZodTypeAny,
  options?: UseFormProps<T>
): UseFormReturn<T> {
  return useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...options,
  });
}

// Enhanced validation hook for real-time feedback
export function useValidationState<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: FieldPath<T>
) {
  const fieldState = form.getFieldState(fieldName);
  const fieldValue = form.watch(fieldName);

  const isDirty = fieldState.isDirty;
  const isTouched = fieldState.isTouched;
  const hasError = !!fieldState.error;
  const isValidating = fieldState.isValidating;
  const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';

  // Determine validation state
  const getValidationState = () => {
    if (isValidating) return 'validating';
    if (hasError && (isTouched || isDirty)) return 'error';
    if (!hasError && hasValue && (isTouched || isDirty)) return 'success';
    if (!hasValue && (isTouched || isDirty)) return 'warning';
    return 'idle';
  };

  const validationState = getValidationState();

  // Get appropriate icon and color
  const getValidationIcon = () => {
    switch (validationState) {
      case 'validating':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getValidationColor = () => {
    switch (validationState) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'validating':
        return 'text-blue-600';
      default:
        return 'text-gray-400';
    }
  };

  const getBorderColor = () => {
    switch (validationState) {
      case 'success':
        return 'border-green-500 focus:ring-green-500';
      case 'error':
        return 'border-red-500 focus:ring-red-500';
      case 'warning':
        return 'border-yellow-500 focus:ring-yellow-500';
      case 'validating':
        return 'border-blue-500 focus:ring-blue-500';
      default:
        return 'border-gray-300 focus:ring-indigo-500';
    }
  };

  return {
    validationState,
    isDirty,
    isTouched,
    hasError,
    isValidating,
    hasValue,
    icon: getValidationIcon(),
    color: getValidationColor(),
    borderColor: getBorderColor(),
    error: fieldState.error
  };
}

// Enhanced form field error component with validation feedback
export function FormFieldError({
  error,
  validationState,
  className = ""
}: {
  error?: FieldError | string;
  validationState?: string;
  className?: string;
}) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  if (!errorMessage) return null;

  const getErrorIcon = () => {
    switch (validationState) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getErrorColor = () => {
    switch (validationState) {
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <div className={cn("flex items-start space-x-2 mt-1 p-2 rounded-md border text-sm", getErrorColor(), className)}>
      {getErrorIcon()}
      <span>{errorMessage}</span>
    </div>
  );
}

// Enhanced form field wrapper with real-time validation
export function FormField({
  label,
  children,
  error,
  validationState,
  required = false,
  description,
  className = "",
  showValidationIcon = true,
  validationIcon
}: {
  label?: string;
  children: React.ReactNode;
  error?: FieldError | string;
  validationState?: string;
  required?: boolean;
  description?: string;
  className?: string;
  showValidationIcon?: boolean;
  validationIcon?: React.ReactNode;
}) {
  const hasError = !!error;

  const getFieldWrapperClass = () => {
    if (hasError) return 'space-y-1';
    return 'space-y-2';
  };

  return (
    <div className={cn(getFieldWrapperClass(), className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {showValidationIcon && validationIcon && (
            <div className="flex items-center">
              {validationIcon}
            </div>
          )}
        </div>
      )}

      {description && (
        <p className="text-xs text-gray-500 mb-1">{description}</p>
      )}

      <div className="relative">
        {children}
      </div>

      <FormFieldError error={error} validationState={validationState} />
    </div>
  );
}

// Enhanced input component with validation feedback
export function ValidatedInput({
  validationState,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  validationState?: string;
}) {
  const getInputClass = () => {
    const baseClass = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors";

    switch (validationState) {
      case 'success':
        return `${baseClass} border-green-500 focus:ring-green-500 bg-green-50`;
      case 'error':
        return `${baseClass} border-red-500 focus:ring-red-500 bg-red-50`;
      case 'warning':
        return `${baseClass} border-yellow-500 focus:ring-yellow-500 bg-yellow-50`;
      case 'validating':
        return `${baseClass} border-blue-500 focus:ring-blue-500 bg-blue-50`;
      default:
        return `${baseClass} border-gray-300 focus:ring-indigo-500`;
    }
  };

  return (
    <input
      className={cn(getInputClass(), className)}
      {...props}
    />
  );
}

// Enhanced textarea component with validation feedback
export function ValidatedTextarea({
  validationState,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  validationState?: string;
}) {
  const getTextareaClass = () => {
    const baseClass = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors resize-none";

    switch (validationState) {
      case 'success':
        return `${baseClass} border-green-500 focus:ring-green-500 bg-green-50`;
      case 'error':
        return `${baseClass} border-red-500 focus:ring-red-500 bg-red-50`;
      case 'warning':
        return `${baseClass} border-yellow-500 focus:ring-yellow-500 bg-yellow-50`;
      case 'validating':
        return `${baseClass} border-blue-500 focus:ring-blue-500 bg-blue-50`;
      default:
        return `${baseClass} border-gray-300 focus:ring-indigo-500`;
    }
  };

  return (
    <textarea
      className={cn(getTextareaClass(), className)}
      {...props}
    />
  );
}

// Enhanced select component with validation feedback
export function ValidatedSelect({
  validationState,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  validationState?: string;
}) {
  const getSelectClass = () => {
    const baseClass = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white";

    switch (validationState) {
      case 'success':
        return `${baseClass} border-green-500 focus:ring-green-500 bg-green-50`;
      case 'error':
        return `${baseClass} border-red-500 focus:ring-red-500 bg-red-50`;
      case 'warning':
        return `${baseClass} border-yellow-500 focus:ring-yellow-500 bg-yellow-50`;
      case 'validating':
        return `${baseClass} border-blue-500 focus:ring-blue-500 bg-blue-50`;
      default:
        return `${baseClass} border-gray-300 focus:ring-indigo-500`;
    }
  };

  return (
    <select
      className={cn(getSelectClass(), className)}
      {...props}
    >
      {children}
    </select>
  );
}

// Form section component
export function FormSection({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Submit button component
export function SubmitButton({
  children,
  isLoading = false,
  disabled = false,
  className = "",
  loadingText = "Saving...",
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Cancel button component
export function CancelButton({
  children = "Cancel",
  onClick,
  className = "",
}: {
  children?: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

// Form validation summary component
export function FormValidationSummary<T extends FieldValues>({
  form,
  className = ""
}: {
  form: UseFormReturn<T>;
  className?: string;
}) {
  const { errors, isValid, isValidating } = form.formState;
  const errorFields = Object.keys(errors);

  if (errorFields.length === 0 && isValid) {
    return null;
  }

  return (
    <div className={cn("mb-6 p-4 rounded-lg border", className)}>
      {errorFields.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <h4 className="font-semibold">Please fix the following errors:</h4>
          </div>
          <ul className="space-y-1 ml-7">
            {errorFields.map((fieldName) => {
              const error = errors[fieldName as keyof T];
              const errorMessage = typeof error === 'object' && error !== null && 'message' in error
                ? (error as any).message
                : 'Invalid value';

              return (
                <li key={fieldName} className="text-sm text-red-600">
                  • <span className="font-medium capitalize">{fieldName.replace(/([A-Z])/g, ' $1')}:</span> {errorMessage}
                </li>
              );
            })}
          </ul>
        </div>
      ) : isValidating ? (
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Validating form...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Form is valid and ready to submit</span>
        </div>
      )}
    </div>
  );
}

// Form progress indicator component
export function FormProgressIndicator<T extends FieldValues>({
  form,
  totalFields,
  className = ""
}: {
  form: UseFormReturn<T>;
  totalFields: number;
  className?: string;
}) {
  const { errors, dirtyFields, touchedFields } = form.formState;
  const errorCount = Object.keys(errors).length;
  const touchedCount = Object.keys(touchedFields).length;
  const dirtyCount = Object.keys(dirtyFields).length;

  const completionPercentage = totalFields > 0 ? Math.round((touchedCount / totalFields) * 100) : 0;
  const validFields = touchedCount - errorCount;

  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Form Progress</span>
        <span>{validFields}/{totalFields} fields completed</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Status indicators */}
      <div className="flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">{validFields} valid</span>
        </div>
        {errorCount > 0 && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">{errorCount} errors</span>
          </div>
        )}
        {dirtyCount > 0 && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">{dirtyCount} modified</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Form actions component (for save/cancel buttons)
export function FormActions({
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isLoading = false,
  isValid = false,
  disabled = false,
  className = "",
}: {
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isValid?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex justify-end space-x-3 ${className}`}>
      <CancelButton onClick={onCancel}>
        {cancelLabel}
      </CancelButton>
      <SubmitButton
        isLoading={isLoading}
        disabled={disabled || !isValid}
        className={!isValid ? "opacity-50 cursor-not-allowed" : ""}
      >
        {submitLabel}
      </SubmitButton>
    </div>
  );
}

// Field validation hint component
export function FieldValidationHint({
  hint,
  validationState,
  className = ""
}: {
  hint?: string;
  validationState?: string;
  className?: string;
}) {
  if (!hint) return null;

  const getHintColor = () => {
    switch (validationState) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <p className={cn("text-xs mt-1", getHintColor(), className)}>
      {hint}
    </p>
  );
}

// Password strength indicator component
export function PasswordStrengthIndicator({
  password,
  className = ""
}: {
  password: string;
  className?: string;
}) {
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(password);

  const getStrengthLabel = () => {
    switch (strength) {
      case 0:
      case 1:
        return { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-600' };
      case 2:
        return { label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-600' };
      case 3:
        return { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
      case 4:
        return { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' };
      case 5:
        return { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' };
      default:
        return { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-600' };
    }
  };

  const { label, color, textColor } = getStrengthLabel();

  if (!password) return null;

  return (
    <div className={cn("mt-2", className)}>
      <div className="flex items-center space-x-2 mb-1">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className={cn("text-xs font-medium", textColor)}>{label}</span>
      </div>
      <div className="text-xs text-gray-500">
        Password should contain uppercase, lowercase, numbers, and special characters
      </div>
    </div>
  );
}
