

export default function AllFeaturesPanel() {
  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-lg font-semibold text-primary-700 mb-2">Upcoming:</h2>
      <div className="text-gray-500 text-sm">
        {/* Add more features/actions here as needed */}
        <ul className="list-disc pl-5 space-y-1">
          <li>Share itinerary (coming soon)</li>
          <li>Export as PDF (coming soon)</li>
          <li>AI trip summary (coming soon)</li>
          <li>Settings & preferences (coming soon)</li>
        </ul>
      </div>
    </div>
  );
}
