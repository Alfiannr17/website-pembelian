import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth, games }) {
    const { data, setData, post, errors, processing } = useForm({
        game_id: '',
        name: '',
        description: '',
        price: '',
        stock: 999999,
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/items');
    };

    return (
        <AdminLayout auth={auth}>
            <Head title="Tambah Item" />

            <div className="max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Tambah Item Baru</h1>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Game</label>
                        <select
                            value={data.game_id}
                            onChange={e => setData('game_id', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">Pilih Game</option>
                            {games.map(game => (
                                <option key={game.id} value={game.id}>{game.name}</option>
                            ))}
                        </select>
                        {errors.game_id && <p className="text-red-600 text-sm mt-1">{errors.game_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Nama Item</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="100 Diamond"
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Deskripsi</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            rows="3"
                        />
                        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Harga</label>
                        <input
                            type="number"
                            value={data.price}
                            onChange={e => setData('price', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Stock</label>
                        <input
                            type="number"
                            value={data.stock}
                            onChange={e => setData('stock', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.stock && <p className="text-red-600 text-sm mt-1">{errors.stock}</p>}
                    </div>

                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm font-medium">Active</span>
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Simpan
                        </button>
                        <Link href="/admin/items" className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}