import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Sync({ auth, apiGames }) {
    const { data, setData, post, processing } = useForm({
        selected_brands: [],
        profit_margin: 10, 
    });

    const [searchTerm, setSearchTerm] = useState('');

    const handleCheck = (brand) => {
        if (data.selected_brands.includes(brand)) {
            setData('selected_brands', data.selected_brands.filter(b => b !== brand));
        } else {
            setData('selected_brands', [...data.selected_brands, brand]);
        }
    };

    const handleSelectAll = () => {
        if (data.selected_brands.length === filteredGames.length) {
            setData('selected_brands', []);
        } else {
            setData('selected_brands', filteredGames.map(g => g.brand));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.games.sync-process'));
    };

    const filteredGames = apiGames.filter(g => 
        g.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout auth={auth}>
            <Head title="Sync Game VIP" />

            <div className="py-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Sinkronisasi Game</h1>
                            <p className="text-sm text-gray-500">Pilih game dari API VIP Payment untuk ditambahkan ke sistem.</p>
                        </div>
                        <div className="w-full md:w-auto relative">
                            <input 
                                type="text" 
                                placeholder="Cari nama game..." 
                                className="w-full md:w-64 border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl mb-6 flex flex-col md:flex-row items-center gap-6">
                        
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Keuntungan Otomatis (%)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    min="0"
                                    value={data.profit_margin}
                                    onChange={e => setData('profit_margin', e.target.value)}
                                    className="w-full border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <span className="absolute right-3 top-2 text-gray-500 font-bold">%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Contoh: Beli 10.000 + Margin 10% = Jual 11.000</p>
                        </div>

                        <div className="w-full md:w-2/3 flex flex-col md:flex-row justify-between md:justify-end items-center gap-4">
                            <div className="text-center md:text-right">
                                <p className="text-sm text-gray-600">Game Terpilih</p>
                                <p className="text-2xl font-bold text-blue-700">{data.selected_brands.length}</p>
                            </div>
                            
                            <button 
                                onClick={submit} 
                                disabled={processing || data.selected_brands.length === 0}
                                className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                        SYNC SEKARANG
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <h3 className="font-bold text-gray-700">Daftar Game ({filteredGames.length})</h3>
                        <button 
                            onClick={handleSelectAll} 
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded transition"
                        >
                            {data.selected_brands.length === filteredGames.length && filteredGames.length > 0 ? 'Batalkan Semua' : 'Pilih Semua'}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-[600px] overflow-y-auto p-1 custom-scrollbar">
                        {filteredGames.length > 0 ? (
                            filteredGames.map((game, idx) => {
                                const isSelected = data.selected_brands.includes(game.brand);
                                return (
                                    <div 
                                        key={idx}
                                        onClick={() => handleCheck(game.brand)}
                                        className={`cursor-pointer group relative border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                                            isSelected
                                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                            : 'border-gray-100 hover:border-blue-300 hover:shadow-md bg-white'
                                        }`}
                                    >
                                        <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                                        }`}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                            )}
                                        </div>

                                        <div className={`w-12 h-12 rounded-lg mb-3 flex items-center justify-center text-2xl shadow-sm ${
                                            isSelected ? 'bg-white' : 'bg-gray-100'
                                        }`}>
                                            🎮
                                        </div>

                                        <h3 className={`font-bold text-sm leading-tight mb-1 ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                                            {game.brand}
                                        </h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            isSelected ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {game.total_items} Layanan
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-12 text-center text-gray-500">
                                <p>Tidak ada game yang cocok dengan pencarian "{searchTerm}"</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}