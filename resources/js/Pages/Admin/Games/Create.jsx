import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';


export default function Create({ auth }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        description: '',
        category: '',
        image: null,
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/games');
    };

    return (
        <AdminLayout auth={auth}>
            <Head title="Tambah Game" />

            <div className="max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Tambah Game Baru</h1>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nama Game</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <input
                            type="text"
                            value={data.category}
                            onChange={e => setData('category', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Game Publisher</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            rows="4"
                        />
                        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Image</label>
                        <input
                            type="file"
                            onChange={e => setData('image', e.target.files[0])}
                            className="w-full border rounded px-3 py-2"
                            accept="image/*"
                        />
                        {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
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
                        <Link href="/admin/games" className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}