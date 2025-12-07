import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { 
    Gamepad2, 
    Package, 
    ShoppingCart, 
    Wallet 
} from 'lucide-react';

export default function Dashboard({ auth, stats, recent_transactions }) {
    
    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout auth={auth}>
            <Head title="Dashboard Admin" />

            <div className="py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        title="Total Games" 
                        value={stats.total_games} 
                        icon={Gamepad2} 
                        color="bg-blue-500" 
                    />
                    <StatCard 
                        title="Total Items" 
                        value={stats.total_items} 
                        icon={Package} 
                        color="bg-purple-500" 
                    />
                    <StatCard 
                        title="Total Transaksi" 
                        value={stats.total_transactions} 
                        icon={ShoppingCart} 
                        color="bg-orange-500" 
                    />
                    <StatCard 
                        title="Total Revenue" 
                        value={`Rp ${stats.total_revenue.toLocaleString('id-ID')}`} 
                        icon={Wallet} 
                        color="bg-green-500" 
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Transaksi Terbaru</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Game</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recent_transactions.length > 0 ? (
                                    recent_transactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {trx.invoice_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {trx.game?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {trx.item?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                Rp {trx.amount.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    trx.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    trx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {trx.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500 text-sm">
                                            Belum ada transaksi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}