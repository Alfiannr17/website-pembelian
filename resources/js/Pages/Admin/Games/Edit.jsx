import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ auth, game }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put', 
        name: game.name || '',
        category: game.category || '',
        description: game.description || '',
        is_active: game.is_active ? true : false,
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(game.image ? `/storage/${game.image}` : null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('admin.games.update', game.id), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout auth={auth}>
            <Head title={`Edit ${game.name}`} />

            <div className="max-w-4xl mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Edit Game: {game.name}</h1>
                    <Link href={route('admin.games.index')} className="text-gray-600 hover:text-gray-900">
                        &larr; Kembali
                    </Link>
                </div>

                <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                    <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Game (Dari API)</label>
                            <input
                                type="text"
                                value={data.name}
                                readOnly
                                className="w-full border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Nama game disinkronkan dengan API, sebaiknya tidak diubah total.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <input
                                    type="text"
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value)}
                                    placeholder="Contoh: MOBA, Battle Royale"
                                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                            </div>

                         
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Publisher atau deskripsi</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows="3"
                                className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            ></textarea>
                             {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gambar / Cover Game</label>
                         
                            {imagePreview && (
                                <div className="mb-3">
                                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300" />
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengubah gambar.</p>
                            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                        </div>

                         <div className="flex items-center">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                Aktifkan Game Ini
                            </label>
                        </div>

                        <div className="flex justify-end border-t pt-6">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {processing ? 'Menyimpan...' : 'SIMPAN PERUBAHAN'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}