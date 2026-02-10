"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VetUpcomingCalvingsWidget } from "./VetUpcomingCalvingsWidget"
import { VetInseminationWidget } from "./VetInseminationWidget"
import { VetAnimalsManagement } from "./VetAnimalsManagement"
import type { Farm } from "@/types"

interface VetFarmDetailsProps {
  farm: Farm
}

export function VetFarmDetails({ farm }: VetFarmDetailsProps) {
  return (
    <>
      {/* Farm Details */}
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-100">
            Farm Details: {farm.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {farm.location && (
              <p className="text-sm text-green-700 dark:text-green-300">
                <span className="font-medium">Location:</span> {farm.location}
                {farm.state && `, ${farm.state}`}
              </p>
            )}
            <p className="text-sm text-green-700 dark:text-green-300">
              <span className="font-medium">Status:</span>{" "}
              <span className={farm.is_active ? "text-green-600" : "text-red-600"}>
                {farm.is_active ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Calving and Insemination Widgets */}
      <VetUpcomingCalvingsWidget farmId={farm.id} />
      <VetInseminationWidget farmId={farm.id} />

      {/* Animals Management */}
      <VetAnimalsManagement 
        farmId={farm.id} 
        farmName={farm.name}
      />
    </>
  )
}
