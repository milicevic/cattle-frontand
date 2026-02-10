interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-2 border-b border-green-200 dark:border-green-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === tab.id
              ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
              : "text-green-700 dark:text-green-300 hover:text-green-600 dark:hover:text-green-400"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
