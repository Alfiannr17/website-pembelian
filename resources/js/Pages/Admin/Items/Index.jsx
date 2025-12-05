import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, items, games, filters }) {
    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus item ini?')) {
            router.delete(`/admin/items/${id}`);
        }
    };

    const handleToggleStatus = (id) => {
        router.patch(`/admin/items/${id}/toggle-status`);
    };

    return (
        <AdminLayout auth={auth}>
            <Head title="Manage Items" />

            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manage Items</h1>
                <Link href="/admin/items/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Tambah Item
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <select
                    value={filters.game_id || ''}
                    onChange={(e) => router.get('/admin/items', { game_id: e.target.value })}
                    className="border rounded px-3 py-2"
                >
                    <option value="">Semua Game</option>
                    {games.map(game => (
                        <option key={game.id} value={game.id}>{game.name}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.data.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4">{item.game.name}</td>
                                <td className="px-6 py-4">{item.name}</td>
                                <td className="px-6 py-4">Rp {parseInt(item.price).toLocaleString('id-ID')}</td>
                                <td className="px-6 py-4">{item.stock}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggleStatus(item.id)}
                                        className={`px-2 py-1 rounded text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                    >
                                        {item.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <Link href={`/admin/items/${item.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}