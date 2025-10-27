import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';

function PeriodSelector({ selectedPeriod, onPeriodChange, customDateRange, onCustomDateChange }) {
  const periods = [
    { value: 'today', label: 'Today', icon: Calendar },
    { value: 'week', label: 'Week', icon: TrendingUp },
    { value: 'month', label: 'Month', icon: BarChart3 },
    { value: 'all', label: 'All Time', icon: Calendar }
  ];

  return (
    <div className="space-y-4">
      {/* Period Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {periods.map((period) => {
          const Icon = period.icon;
          return (
            <button
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition ${
                selectedPeriod === period.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{period.label}</span>
              <span className="sm:hidden text-sm">{period.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Date Range */}
      <div className="bg-gray-50 rounded-xl p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Custom Date Range
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={customDateRange.start}
              onChange={(e) => onCustomDateChange('start', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={customDateRange.end}
              onChange={(e) => onCustomDateChange('end', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        {customDateRange.start && customDateRange.end && (
          <button
            onClick={() => onPeriodChange('custom')}
            className={`mt-3 w-full py-2 rounded-lg font-semibold transition ${
              selectedPeriod === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Apply Custom Range
          </button>
        )}
      </div>
    </div>
  );
}

export default PeriodSelector;
