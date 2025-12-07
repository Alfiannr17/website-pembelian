
import UserLayout from '@/Layouts/UserLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Wifi, Calendar, Zap, Shield, Smartphone } from 'lucide-react';

export default function Show({ auth, package: pkg }) {
    const { data, setData, post, errors, processing } = useForm({
        package_code: pkg.packageCode,

        email: auth.user?.email || '',
        phone: '',
        payment_method: '',
    });
    
    const paymentMethods = [
        { 
        id: 'qris', name: 'QRIS (All E-Wallet)', src: '/storage/images/qris.jpg'},
        { id: 'bca_va', name: 'BCA Virtual Account', src: '/storage/images/bca.jpg' },
   
        { id: 'bri_va', name: 'BRI Virtual Account', src: '/storage/images/bri.jpg' },
     
    ];

    const formatBytes = (bytes) => {
        const gb = bytes / (1024 * 1024 * 1024);
        return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(gb * 1024).toFixed(0)} MB`;
    };


const handleSubmit = (e) => {
    e.preventDefault();
    
    post(route('essim.order'), {
        preserveScroll: true,
        onSuccess: () => {
        },
        onError: (errors) => {
            console.log(errors);
        }
    });
};

    return (
        <UserLayout auth={auth}>
            <Head title={pkg.name} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link href="/essim" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali ke Daftar Paket
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
                                    <Smartphone className="w-8 h-8 text-pink-500" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h1>
                                <p className="text-gray-600">{pkg.location_name}</p>
                            </div>

               
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600 flex items-center">
                                        <Zap className="w-5 h-5 mr-2 text-pink-500" />
                                        Data
                                    </span>
                                    <span className="font-bold text-gray-900">{formatBytes(pkg.volume)}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600 flex items-center">
                                        <Calendar className="w-5 h-5 mr-2 text-pink-500" />
                                        Berlaku
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        {pkg.duration} {pkg.durationUnit === 'DAY' ? 'Hari' : 'Bulan'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600 flex items-center">
                                        <Shield className="w-5 h-5 mr-2 text-pink-500" />
                                        Jaringan
                                    </span>
                                    <span className="font-bold text-gray-900">{pkg.speed}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl ">
                                <p className="text-sm text-gray-600 mb-1">Total Harga</p>
                                <p className="text-3xl font-bold text-pink-500">
                                    Rp {pkg.price_idr.toLocaleString('id-ID')}
                                </p>
                                {pkg.description && (
                                <p className="text-sm text-gray-600 leading-relaxed mt-4">
                                    {pkg.description}
                                </p>
                            )}
                            </div>

                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="bg-pink-500 text-white px-6 py-4">
                                    <h2 className="text-lg font-bold flex items-center">
                                        <span className="bg-white text-pink-500 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">1</span>
                                        DATA KONTAK
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="email@example.com"
                                            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            required
                                        />
                                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 ">
                                            Nomor HP (Opsional)
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            placeholder="+62 812 3456 7890"
                                            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                    
                            <div className="bg-white rounded-2xl border border-gray-100  overflow-hidden">
                                <div className="bg-pink-500 text-white px-6 py-4">
                                    <h2 className="text-lg font-bold flex items-center">
                                        <span className="bg-white text-pink-500 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">2</span>
                                        METODE PEMBAYARAN
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {paymentMethods.map(method => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setData('payment_method', method.id)}
                                                className={`w-full border rounded-xl p-4 flex items-center transition ${
                                                    data.payment_method === method.id
                                                      ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500' 
                                                        : 'border-gray-200 hover:border-pink-500 hover:bg-pink-50'
                                                }`}
                                            >
                                            
                                                <div className="w-12 h-8 mr-4 flex items-center justify-center shrink-0">
                                                    {method.src ? (
                                                        <img 
                                                            src={method.src} 
                                                            alt={method.name} 
                                                            className="w-full h-full object-contain" 
                                                        />
                                                    ) : (
                                                        <span className="text-2xl">{method.logo}</span>
                                                    )}
                                                </div>

                                                <span className={`font-medium text-left ${data.payment_method === method.id ? 'text-pink-700' : 'text-gray-900'}`}>
                                                    {method.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.payment_method && (
                                        <p className="text-red-600 text-sm mt-2">{errors.payment_method}</p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-600">Total Pembayaran:</span>
                                        <span className="text-2xl font-bold text-pink-600">
                                            Rp {pkg.price_idr.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                <button
                                
                                    type="submit"
                                    disabled={processing || !data.payment_method}
                                    className="w-full bg-pink-500 text-white py-4 rounded-lg font-bold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Memproses...' : 'BAYAR SEKARANG'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}