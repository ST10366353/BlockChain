import { useForm, UseFormProps, FieldValues, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

// Form field error component
export function FormFieldError({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <p className="text-sm text-red-600 mt-1">
      {error}
    </p>
  );
}

// Form field wrapper component
export function FormField({
  label,
  children,
  error,
  required = false,
  className = "",
}: {
  label?: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      <FormFieldError error={error} />
    </div>
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

// Form actions component (for save/cancel buttons)
export function FormActions({
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isLoading = false,
  className = "",
}: {
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex justify-end space-x-3 ${className}`}>
      <CancelButton onClick={onCancel}>
        {cancelLabel}
      </CancelButton>
      <SubmitButton isLoading={isLoading}>
        {submitLabel}
      </SubmitButton>
    </div>
  );
}
