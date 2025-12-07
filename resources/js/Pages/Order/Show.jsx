
import UserLayout from '@/Layouts/UserLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios'; 
export default function Show({ auth, game }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState('');
    
    const [nickname, setNickname] = useState(null);
    const [checkingId, setCheckingId] = useState(false);
    const [idError, setIdError] = useState(null);

    const { data, setData, post, errors, processing } = useForm({
        game_id: game.id,
        item_id: '',
        game_user_id: '',
        game_zone_id: '', 
        email: auth.user?.email || '',
        payment_method: '',
    });

    const paymentMethods = [
        { id: 'qris', name: 'QRIS (All E-Wallet)', src: '/storage/images/qris.jpg'},
        { id: 'bca_va', name: 'BCA Virtual Account', src: '/storage/images/bca.jpg' },
        { id: 'bni_va', name: 'BNI Virtual Account', src: '/storage/images/bni.jpg' },
        { id: 'bri_va', name: 'BRI Virtual Account', src: '/storage/images/bri.jpg' },
        { id: 'alfamart', name: 'Alfamart',src: '/storage/images/alfa.jpg' },
        { id: 'indomaret', name: 'Indomaret',src: '/storage/images/indo.jpg' },
    ];

  
    const handleCheckId = async () => {
        if (!data.game_user_id) {
            setIdError("Masukkan User ID terlebih dahulu");
            return;
        }

        setCheckingId(true);
        setNickname(null);
        setIdError(null);

        try {
      
            const response = await axios.post('/order/check-id', {
                game_id: game.id,
                user_id: data.game_user_id,
                zone_id: data.game_zone_id
            });

            if (response.data.status === 'success') {
                setNickname(response.data.nickname); 
            } else {
                setIdError('ID tidak ditemukan / Salah');
            }
        } catch (error) {
            setIdError('Gagal mengecek ID. Coba lagi.');
        } finally {
            setCheckingId(false);
        }
    };

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

        if (!data.game_user_id) {
            alert("Mohon masukkan User ID Game terlebih dahulu!");
            return;
        }
        if (!data.item_id) {
            alert("Mohon pilih nominal item!");
            return;
        }
        if (!data.payment_method) {
            alert("Mohon pilih metode pembayaran!");
            return;
        }

        post(route('order.process'), {
            preserveScroll: true,
            onStart: () => console.log("Mengirim data...", data),
            onSuccess: () => console.log("Berhasil!"),
            onError: (errors) => {
                console.error("Gagal Validasi:", errors);
                const firstError = Object.values(errors)[0];
                alert("Gagal Memproses Order: " + firstError);
            },
            onFinish: () => console.log("Selesai request.")
        });
    };

    const requiresZoneId = game.name.toLowerCase().includes('mobile legends');

    return (
        <UserLayout auth={auth}>
            <Head title={`Order ${game.name}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali ke Beranda
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
                            {game.image && (
                                <img src={`/storage/${game.image}`} alt={game.name} className="w-full rounded-2xl mb-4"/>
                            )}
                            <h1 className="text-2xl font-bold mb-2">{game.name}</h1>
                            <p className="text-pink-500 font-semibold mb-4">{game.category}</p>
                            
                            <h2 className="font-medium mb-1 text-sm">Cara Top Up:</h2>
                            <ul className="list-decimal pl-4 space-y-1 text-xs text-gray-500">
                                <li>Masukkan User ID {requiresZoneId && '& Zone ID'}</li>
                                <li>Klik tombol "Cek ID" untuk memastikan nama akun benar</li>
                                <li>Pilih Nominal Item</li>
                                <li>Pilih Metode Pembayaran</li>
                                <li>Selesaikan Pembayaran</li>
                            </ul>
                        </div>
                    </div>

             
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
        
                       
                            <div className="bg-white rounded-2xl border border-gray-100  overflow-hidden">
                                <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4">
                                    <h2 className="text-lg font-bold flex items-center">
                                        <span className="bg-white text-pink-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">1</span>
                                        MASUKKAN DATA AKUN
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={requiresZoneId ? "col-span-1" : "col-span-2"}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                                            <input
                                                type="text"
                                                value={data.game_user_id}
                                                onChange={e => setData('game_user_id', e.target.value)}
                                                placeholder="Masukan User Id"
                                                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:border-transparent focus:ring-pink-500"
                                            />
                                        </div>
                                        {requiresZoneId && (
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Zone ID</label>
                                                <input
                                                    type="text"
                                                    value={data.game_zone_id}
                                                    onChange={e => setData('game_zone_id', e.target.value)}
                                                    placeholder="Masukan Zone Id"
                                                   className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-pink-500 custom-no-blue"
                                                />
                                            </div>
                                        )}
                                    </div>

                                  
                                    <div className="flex items-center ">
                                        <button 
                                            type="button" 
                                            onClick={handleCheckId}
                                            disabled={checkingId || !data.game_user_id}
                                            className=" rounded-lg text-sm font-bold disabled:opacity-50"
                                        >
                                            Cek kembali User ID Anda agar tidak terjadi kesalahan.
                                        </button>

                                        {nickname && (
                                            <div className="text-green-600 font-bold text-sm bg-green-50 px-3 py-2  ">
                                                {nickname}
                                            </div>
                                        )}
                                        
                                        
                                    </div>  

                                    {errors.game_user_id && <p className="text-red-600 text-sm">{errors.game_user_id}</p>}

                             
                                    <div className="pt-2 border-t border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="nama@email.com"
                                            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-pink-500"
                                            required
                                        />
                                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                                    </div>
                                  
                                </div>


                                
                            </div>

                    
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
                                                className={`border rounded-2xl p-4 text-left transition relative ${
                                                    selectedItem?.id === item.id
                                                       ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500' 
                                                        : 'border-gray-200 hover:border-pink-500 hover:bg-pink-50'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-gray-900">{item.name}</div>
                                                        <div className="text-pink-600 font-bold mt-2">
                                                            Rp {parseInt(item.price).toLocaleString('id-ID')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.item_id && <p className="text-red-600 text-sm mt-2">{errors.item_id}</p>}
                                </div>
                            </div>

                         
                            <div className="bg-white rounded-2xl border border-gray-100  overflow-hidden">
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
                                                        <img src={method.src} alt={method.name} className="h-full w-auto object-contain" />
                                                    ) : (
                                                        <span className="text-2xl">💳</span>
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
                                <div className="bg-white rounded-2xl border border-gray-100 p-6">
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