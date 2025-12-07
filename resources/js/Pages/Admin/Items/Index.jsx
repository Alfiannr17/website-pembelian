import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Package, Filter } from 'lucide-react';

export default function Index({ auth, items, games, filters }) {
    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus item ini?')) {
            router.delete(route('admin.items.destroy', id));
        }
    };

    const handleToggleStatus = (id) => {
        router.patch(route('admin.items.toggle-status', id));
    };

    return (
        <AdminLayout auth={auth}>
            <Head title="Manage Items" />

            <div className="py-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Package className="text-purple-600" /> Manage Items
                        </h1>
                        <p className="text-sm text-gray-500">Kelola daftar produk dan layanan top up.</p>
                    </div>
                    
                    <Link 
                        href={route('admin.items.create')} 
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200 font-bold"
                    >
                        <Plus className="w-5 h-5" /> Tambah Item
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={filters.game_id || ''}
                        onChange={(e) => router.get(route('admin.items.index'), { game_id: e.target.value }, { preserveState: true })}
                        className="border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-purple-500 focus:border-purple-500 w-full sm:w-64"
                    >
                        <option value="">Semua Game</option>
                        {games.map(game => (
                            <option key={game.id} value={game.id}>{game.name}</option>
                        ))}
                    </select>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Game</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Item</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Harga</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.data.length > 0 ? (
                                    items.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-purple-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {item.game?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                                                Rp {parseInt(item.price).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(item.id)}
                                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${
                                                        item.is_active 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center gap-2">
                                                    <Link 
                                                        href={route('admin.items.edit', item.id)} 
                                                        className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 border border-yellow-200 transition"
                                                        title="Edit Item"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(item.id)} 
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition"
                                                        title="Hapus Item"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Package className="w-12 h-12 text-gray-300 mb-3" />
                                                <p className="text-lg font-medium">Belum ada item</p>
                                                <p className="text-sm">Silakan tambah manual atau sync dari API.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {items.links && items.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Menampilkan <span className="font-medium">{items.from}</span> sampai <span className="font-medium">{items.to}</span> dari <span className="font-medium">{items.total}</span> hasil
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        {items.links.map((link, key) => (
                                            <Link
                                                key={key}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}