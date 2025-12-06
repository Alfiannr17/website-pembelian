import UserLayout from '@/Layouts/UserLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ auth, game }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState('');

    const { data, setData, post, errors, processing } = useForm({
        game_id: game.id,
        item_id: '',
        game_user_id: '',
        email: auth.user?.email || '',
        payment_method: '',
    });

    const paymentMethods = [
        { 
        id: 'qris', name: 'QRIS (All E-Wallet)', src: '/storage/images/qris.jpg'},
        { id: 'bca_va', name: 'BCA Virtual Account', src: '/storage/images/bca.jpg' },
        { id: 'bni_va', name: 'BNI Virtual Account', src: '/storage/images/bni.jpg' },
        { id: 'bri_va', name: 'BRI Virtual Account', src: '/storage/images/bri.jpg' },
        { id: 'alfamart', name: 'Alfamart',src: '/storage/images/alfa.jpg' },
        { id: 'indomaret', name: 'Indomaret',src: '/storage/images/indo.jpg' },
    ];

    const handleItemSelect = (item) => {
        setSelectedItem(item);
        setData('item_id', item.id);
    };

    const handlePaymentSelect = (method) => {
        setSelectedPayment(method);
        setData('payment_method', method);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/order/process');
    };

    return (
        <UserLayout auth={auth}>
            <Head title={`Order ${game.name}`} />

            <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       
                <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali ke Beranda
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-300  shadow p-6 sticky top-6">
                            {game.image && (
                                <img 
                                    src={`/storage/${game.image}`} 
                                    alt={game.name} 
                                    className="w-full rounded-2xl mb-4"
                                />
                            )}
                            <h1 className="text-2xl font-bold mb-2">{game.name}</h1>
                            <p className="text-pink-500 font-semibold mb-4">{game.category || 'Tencent'} / {game.description || 'Top up Honor of Kings resmi dan murah.'}</p>
                            
                            <h2 className="font-medium mb-1 text-sm ">Cara Top Up {game.name}</h2>
                            <div className="space-y-2">
                                <ol className="list-decimal pl-3">
                                <li className="text-xs text-gray-400 mb-1">Masukkan User ID kamu</li>
                                <li className="text-xs text-gray-400 mb-1">Contoh : 1234567 (1234)</li>
                                <li className="text-xs text-gray-400 mb-1">Pilih Nominal Item yang kamu inginkan</li>
                                <li className="text-xs text-gray-400 mb-1">Selesaikan pembayaran</li>
                                <li className="text-xs text-gray-400 mb-1">Item akan ditambahkan ke akun {game.name} kamu</li>
                                </ol>
                            </div>
                        </div>
                    </div>

        
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
        
                            <div className="bg-white rounded-2xl border border-gray-300 shadow overflow-hidden">
                                <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4">
                                    <h2 className="text-lg font-bold flex items-center">
                                        <span className="bg-white text-pink-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">1</span>
                                        MASUKKAN DATA AKUN
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </span>
                                            <input
                                                type="text"
                                                value={data.game_user_id}
                                                onChange={e => setData('game_user_id', e.target.value)}
                                                placeholder="21421421"
                                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            />
                                        </div>
                                        {errors.game_user_id && <p className="text-red-600 text-sm mt-1">{errors.game_user_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email (Opsional)</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </span>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                placeholder="inertia@inertia.com"
                                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                                    </div>
                                </div>
                            </div>

                   
                            <div className="bg-white rounded-2xl border border-gray-300 shadow overflow-hidden">
                                <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4">
                                    <h2 className="text-lg font-bold flex items-center">
                                        <span className="bg-white text-pink-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">2</span>
                                        PILIH NOMINAL
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {game.items.map(item => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleItemSelect(item)}
                                                className={`border-2 rounded-lg p-4 text-left transition relative ${
                                                    selectedItem?.id === item.id
                                                        ? 'border-pink-500 bg-pink-50'
                                                        : 'border-gray-200 hover:border-pink-300'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-gray-900">{item.name}</div>
                                                        <div className="text-pink-600 font-bold mt-2">
                                                            Rp {parseInt(item.price).toLocaleString('id-ID')}
                                                        </div>
                                                    </div>
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.item_id && <p className="text-red-600 text-sm mt-2">{errors.item_id}</p>}
                                </div>
                            </div>

                 
                            <div className="bg-white rounded-2xl border border-gray-300 shadow overflow-hidden">
                                <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4">
                                    <h2 className="text-lg font-bold flex items-center">
                                        <span className="bg-white text-pink-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">3</span>
                                        PILIH PEMBAYARAN
                                    </h2>
                                </div>
                                <div className="p-6">
    <div className="space-y-3">
        {paymentMethods.map(method => (
            <button
                key={method.id}
                type="button"
                onClick={() => handlePaymentSelect(method.id)}
                className={`w-full border rounded-2xl p-4 flex items-center transition ${
                    selectedPayment === method.id
                        ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500' 
                        : 'border-gray-200 hover:border-pink-500 hover:bg-pink-50'
                }`}
            >
  
                <div className="w-12 h-8 mr-4 flex items-center justify-center shrink-0">
                    {method.src ? (
                        <img 
                            src={method.src} 
                            alt={method.name} 
                            className="h-full w-auto object-contain" 
                        />
                    ) : (
                        <span className="text-2xl">{method.logo}</span>
                    )}
                </div>

                <span className={`font-medium text-left ${selectedPayment === method.id ? 'text-pink-700' : 'text-gray-900'}`}>
                    {method.name}
                </span>
            </button>
        ))}
    </div>
    {errors.payment_method && <p className="text-red-600 text-sm mt-2">{errors.payment_method}</p>}
</div>
                            </div>

                      
                            {selectedItem && (
                                <div className="bg-white rounded-2xl border border-gray-300  shadow p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-600">Total Pembayaran:</span>
                                        <span className="text-2xl font-bold text-pink-600">
                                            Rp {parseInt(selectedItem.price).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing || !selectedItem || !selectedPayment}
                                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-lg font-bold hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        BAYAR SEKARANG
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}