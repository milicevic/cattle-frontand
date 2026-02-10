interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 dark:bg-green-950">
      <div className="text-green-800 dark:text-green-200">{message}</div>
    </div>
  )
}
