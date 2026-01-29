"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, AlertCircle, Calendar, X, Droplets } from "lucide-react"
import api from "@/lib/api"

interface Notification {
  type: 'calving_due_soon' | 'insemination_due'
  priority: 'high' | 'medium' | 'low'
  message: string
  tag_number: string
  name?: string
  days_remaining?: number
  days_until_ideal?: number
  days_since_calving?: number
  expected_calving_date?: string
  last_calving_date?: string
  is_overdue?: boolean
  is_in_window?: boolean
  is_approaching?: boolean
}

export function NotificationsWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadNotifications()
    // Refresh every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/api/animals/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (err) {
      console.error("Error loading notifications:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = (index: number) => {
    const key = `${notifications[index].type}-${notifications[index].tag_number}`
    setDismissed(new Set(dismissed).add(key))
  }

  const visibleNotifications = notifications.filter((_, index) => {
    const key = `${notifications[index].type}-${notifications[index].tag_number}`
    return !dismissed.has(key)
  })

  const highPriorityCount = visibleNotifications.filter(n => n.priority === 'high').length

  if (isLoading) {
    return null
  }

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
              {highPriorityCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {highPriorityCount}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-green-800 dark:text-green-100">
                Notifications
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Important alerts and reminders
              </CardDescription>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {visibleNotifications.length}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleNotifications.map((notification, index) => {
            const isHighPriority = notification.priority === 'high'
            const IconComponent = notification.type === 'calving_due_soon' ? Calendar : Droplets
            
            return (
              <div
                key={`${notification.type}-${notification.tag_number}-${index}`}
                className={`rounded-lg p-4 border-l-4 ${
                  isHighPriority
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`flex-shrink-0 mt-0.5 ${
                      isHighPriority
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold mb-1 ${
                        isHighPriority
                          ? 'text-red-800 dark:text-red-200'
                          : 'text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {notification.message}
                      </p>
                      {notification.expected_calving_date && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Expected: {new Date(notification.expected_calving_date).toLocaleDateString()}
                        </p>
                      )}
                      {notification.last_calving_date && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Last calving: {new Date(notification.last_calving_date).toLocaleDateString()} 
                          {notification.days_since_calving !== undefined && (
                            <span> ({notification.days_since_calving} days ago)</span>
                          )}
                        </p>
                      )}
                      {notification.is_in_window && (
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          ✓ Currently in ideal window (50-90 days)
                        </p>
                      )}
                      {notification.is_overdue && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          ⚠ Past ideal window - inseminate soon
                        </p>
                      )}
                      {notification.is_approaching && notification.days_until_ideal !== undefined && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                          ⏳ {notification.days_until_ideal} days until ideal window starts
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(index)}
                    className="flex-shrink-0 h-6 w-6 p-0 hover:bg-white/50 dark:hover:bg-black/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
