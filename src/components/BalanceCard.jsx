import { Users, ArrowRight, CheckCircle } from 'lucide-react';

function BalanceCard({ expenses, user1Name, user2Name }) {
  // Calculate shared expenses and who owes who
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Users size={24} />
        <h3 className="text-lg font-semibold">Balance</h3>
      </div>
      
      <div className="flex items-center justify-between">
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

      <div className="mt-4 pt-4 border-t border-blue-400 text-center">
        <p className="text-sm text-blue-100">
          Based on shared expenses only
        </p>
      </div>
    </div>
  );
}

export default BalanceCard;
