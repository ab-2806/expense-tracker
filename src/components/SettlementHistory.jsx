import { X, DollarSign, Calendar, User } from 'lucide-react';

function SettlementHistory({ expenses, user1Name, user2Name, onClose }) {
  // Filter only settlement transactions
  const settlements = expenses
    .filter(exp => exp.type === 'settlement')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Settlement History</h2>
              <p className="text-sm text-gray-500">{settlements.length} settlements recorded</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {settlements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-500 text-lg">No settlements yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Settlements will appear here when you settle balances
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {settlements.map((settlement) => (
                <div
                  key={settlement.firebaseKey}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <DollarSign className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-lg">
                          {settlement.paidBy} → {settlement.paidTo}
                        </p>
                        <p className="text-sm text-gray-600">
                          {settlement.paidBy} paid {settlement.paidTo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ₹{parseFloat(settlement.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-green-200">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(settlement.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>Settled by: {settlement.settledBy}</span>
                    </div>
                  </div>

                  {settlement.note && (
                    <div className="mt-2 text-sm text-gray-600 italic">
                      {settlement.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">
              Total settled: <span className="font-semibold text-gray-800">
                ₹{settlements.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0).toFixed(2)}
              </span>
            </p>
            <button
              onClick={onClose}
              className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettlementHistory;
