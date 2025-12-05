import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, games }) {
    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus game ini?')) {
            router.delete(`/admin/games/${id}`);
        }
    };

    return (
        <AdminLayout auth={auth}>
            <Head title="Manage Games" />

            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manage Games</h1>
                <Link href="/admin/games/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Tambah Game
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {games.data.map((game) => (
                            <tr key={game.id}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        {game.image && (
                                            <img src={`/storage/${game.image}`} alt={game.name} className="h-10 w-10 rounded mr-3" />
                                        )}
                                        {game.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">{game.category || '-'}</td>
                                <td className="px-6 py-4">{game.items_count}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${game.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {game.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <Link href={`/admin/games/${game.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(game.id)} className="text-red-600 hover:text-red-900">
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