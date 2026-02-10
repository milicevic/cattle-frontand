interface ErrorAlertProps {
  error: string
  onDismiss?: () => void
}

export function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  if (!error) return null

  return (
    <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
      <div className="flex justify-between items-start">
        <span>{error}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
