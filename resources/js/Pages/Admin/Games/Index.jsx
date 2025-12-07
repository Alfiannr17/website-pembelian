import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, RefreshCw, Pencil, Trash2, Gamepad2 } from 'lucide-react';

export default function Index({ auth, games }) {
    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus game ini?')) {
            router.delete(route('admin.games.destroy', id));
        }
    };

    return (
        <AdminLayout auth={auth}>
            <Head title="Manage Games" />

            <div className="py-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Gamepad2 className="text-blue-600" /> Manage Games
                        </h1>
                        <p className="text-sm text-gray-500">Kelola daftar game dan layanan top up.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      
                        <Link 
                            href={route('admin.games.sync-page')} 
                            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition shadow-sm font-medium"
                        >
                            <RefreshCw className="w-4 h-4" /> Sync API
                        </Link>

                        <Link 
                            href={route('admin.games.create')} 
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200 font-bold"
                        >
                            <Plus className="w-5 h-5" /> Tambah Game
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Game Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Total Item</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {games.data.length > 0 ? (
                                    games.data.map((game) => (
                                        <tr key={game.id} className="hover:bg-blue-50/50 transition-colors group">
                                           
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                        {game.image ? (
                                                            <img className="h-12 w-12 object-cover" src={`/storage/${game.image}`} alt={game.name} />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-2xl">🎮</div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">{game.name}</div>
                                                        <div className="text-xs text-gray-500">{game.provider === 'vip' ? 'Otomasis (API)' : 'Manual'}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium border border-gray-200">
                                                    {game.category || 'General'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                                    {game.items_count}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    game.is_active 
                                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                    {game.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center gap-2">
                                                    <Link 
                                                        href={route('admin.games.edit', game.id)} 
                                                        className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 border border-yellow-200 transition"
                                                        title="Edit Game"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(game.id)} 
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition"
                                                        title="Hapus Game"
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
                                                <Gamepad2 className="w-12 h-12 text-gray-300 mb-3" />
                                                <p className="text-lg font-medium">Belum ada game</p>
                                                <p className="text-sm">Silakan tambah manual atau sync dari API.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {games.links && games.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Menampilkan <span className="font-medium">{games.from}</span> sampai <span className="font-medium">{games.to}</span> dari <span className="font-medium">{games.total}</span> hasil
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        {games.links.map((link, key) => (
                                            <Link
                                                key={key}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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