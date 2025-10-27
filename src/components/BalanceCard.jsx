import { Users, ArrowRight, CheckCircle, DollarSign, History } from 'lucide-react';
import { useState } from 'react';

function BalanceCard({ expenses, user1Name, user2Name, onSettle, onShowHistory }) {
  const [showSettleModal, setShowSettleModal] = useState(false);

  // Calculate shared expenses and who owes who (including settlements)
  // IMPORTANT: Uses the filtered expenses passed in, not all expenses
  const calculateBalance = () => {
    let user1Owes = 0;
    let user2Owes = 0;

    expenses.forEach(expense => {
      if (expense.type === 'shared') {
        const splitAmount = expense.splitAmount || (expense.amount / 2);
        
        if (expense.user === user1Name) {
          // User1 paid, so User2 owes User1
          user2Owes += splitAmount;
        } else if (expense.user === user2Name) {
          // User2 paid, so User1 owes User2
          user1Owes += splitAmount;
        }
      } else if (expense.type === 'settlement') {
        // Settlement offsets the balance
        if (expense.paidBy === user1Name && expense.paidTo === user2Name) {
          // User1 paid User2, so User1 owes less
          user1Owes -= expense.amount;
        } else if (expense.paidBy === user2Name && expense.paidTo === user1Name) {
          // User2 paid User1, so User2 owes less
          user2Owes -= expense.amount;
        }
      }
    });

    const netBalance = user2Owes - user1Owes;
    
    return {
      netBalance: Math.abs(netBalance),
      owedBy: netBalance > 0 ? user2Name : user1Name,
      owedTo: netBalance > 0 ? user1Name : user2Name,
      isSettled: Math.abs(netBalance) < 0.01
    };
  };

  const balance = calculateBalance();

  const handleSettleUp = () => {
    if (balance.isSettled) return;
    setShowSettleModal(true);
  };

  const confirmSettle = () => {
    onSettle(balance);
    setShowSettleModal(false);
  };

  if (balance.isSettled) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle size={32} />
            <div>
              <h3 className="text-xl font-bold">All Settled! 🎉</h3>
              <p className="text-green-100 text-sm">No pending balances</p>
            </div>
          </div>
          <button
            onClick={onShowHistory}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-semibold"
          >
            <History size={16} />
            History
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Users size={24} />
          <h3 className="text-lg font-semibold">Balance</h3>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <p className="text-sm text-blue-100 mb-1">{balance.owedBy}</p>
            <p className="text-xs text-blue-200">owes</p>
          </div>
          
          <div className="flex flex-col items-center px-4">
            <p className="text-3xl font-bold">₹{balance.netBalance.toFixed(2)}</p>
            <ArrowRight size={20} className="mt-1" />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-blue-100 mb-1">{balance.owedTo}</p>
            <p className="text-xs text-blue-200">to receive</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-blue-400">
          <button
            onClick={handleSettleUp}
            className="flex-1 bg-white text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition font-semibold text-sm flex items-center justify-center gap-2"
          >
            <DollarSign size={18} />
            Settle Up
          </button>
          <button
            onClick={onShowHistory}
            className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-lg transition font-semibold text-sm flex items-center justify-center gap-2"
          >
            <History size={18} />
            History
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-blue-100">
            Based on shared expenses
          </p>
        </div>
      </div>

      {/* Settlement Confirmation Modal */}
      {showSettleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Settle Balance</h2>
              <p className="text-gray-600">Confirm this settlement</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="text-center mb-3">
                <p className="text-lg font-semibold text-gray-800">
                  {balance.owedBy} pays {balance.owedTo}
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ₹{balance.netBalance.toFixed(2)}
                </p>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Clear current balance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Record settlement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Keep all expense history</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSettleModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmSettle}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BalanceCard;
