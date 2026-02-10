import { CheckCircle, XCircle, Clock } from "lucide-react"

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'approved':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      )
    case 'rejected':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      )
  }
}
