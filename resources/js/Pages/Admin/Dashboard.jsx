import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth, stats, recent_transactions }) {
    return (
        <AdminLayout auth={auth}>
            <Head title="Dashboard Admin" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm">Total Games</h3>
                    <p className="text-3xl font-bold mt-2">{stats.total_games}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm">Total Items</h3>
                    <p className="text-3xl font-bold mt-2">{stats.total_items}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm">Total Transaksi</h3>
                    <p className="text-3xl font-bold mt-2">{stats.total_transactions}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm">Total Revenue</h3>
                    <p className="text-3xl font-bold mt-2">Rp {stats.total_revenue.toLocaleString('id-ID')}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Transaksi Terbaru</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recent_transactions.map((trx) => (
                                <tr key={trx.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{trx.invoice_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{trx.game.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{trx.item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">Rp {trx.amount.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            trx.status === 'paid' ? 'bg-green-100 text-green-800' :
                                            trx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {trx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}