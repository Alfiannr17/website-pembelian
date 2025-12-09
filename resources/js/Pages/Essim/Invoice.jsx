// resources/js/Pages/Esim/Invoice.jsx
import UserLayout from '@/Layouts/UserLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { 
    Clock, Copy, Download, RefreshCw, CreditCard, 
    CheckCircle2, XCircle, ChevronDown, Smartphone,
    Calendar, User, FileText, Check, DollarSign, ChevronUp,
    Wifi, Key,
    WifiPenIcon
} from 'lucide-react';

export default function Invoice({ auth, order, paymentInfo }) {
    const [timeLeft, setTimeLeft] = useState(null);
    const [expandedHelp, setExpandedHelp] = useState(null);

    useEffect(() => {
        if (order.payment_status === 'pending') {
            const expiryTime = new Date(order.created_at).getTime() + (24 * 60 * 60 * 1000);
            const timer = setInterval(() => {
                const now = new Date().getTime();
                const distance = expiryTime - now;
                if (distance < 0) {
                    clearInterval(timer);
                    setTimeLeft('Expired');
                } else {
                    const hours = Math.floor(distance / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    setTimeLeft(`${hours} jam ${minutes} menit ${seconds} detik`);
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [order]);

    useEffect(() => {
        const needsProfile = order.api_order_no && (!order.profiles || order.profiles.length === 0);
        if (needsProfile) {
            const interval = setInterval(() => {
                router.post(route('essim.check.process'), { invoice_number: order.invoice_number }, {
                    preserveScroll: true, preserveState: true, only: ['order'],
                });
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [order]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Disalin!');
    };

    const getBankName = () => {
        switch(order.payment_method) {
            case 'bca_va': return 'BCA Virtual Account';
            case 'bni_va': return 'BNI Virtual Account';
            case 'bri_va': return 'BRI Virtual Account';
            case 'mandiri_va': return 'Mandiri Virtual Account';
            case 'permata_va': return 'Permata Virtual Account';
            case 'qris': return 'QRIS';
            default: return 'Virtual Account';
        }
    };

    const getPaymentCode = () => {
        if (!paymentInfo) return '-';
        if (paymentInfo.va_numbers?.[0]) return paymentInfo.va_numbers[0].va_number;
        if (paymentInfo.permata_va_number) return paymentInfo.permata_va_number;
        return paymentInfo.payment_code || '-';
    };

    const getQrImage = () => {
        if (['qris', 'gopay'].includes(order.payment_method)) {
            const actionUrl = paymentInfo?.actions?.find(a => a.name === 'generate-qr-code')?.url;
            if (actionUrl) return actionUrl;
            const qrString = paymentInfo?.qr_string;
            if (qrString) return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;
        }
        return null;
    };

    const currentStep = () => {
        if (order.payment_status === 'failed') return 0;
        if (order.payment_status === 'pending') return 1;
        if (order.payment_status === 'paid' && (!order.profiles || order.profiles.length === 0)) return 2;
        return 3;
    };

    const helpSections = {
        'Mobile Banking': ['Login Aplikasi', 'Pilih Transfer > Virtual Account', `Masukan No Virtual Account ${getPaymentCode()}`, 'Konfirmasi PIN'],
        'ATM': ['Masukkan Kartu & PIN', 'Menu Transaksi Lain > Transfer', `Pilih Virtual Account`,`Masukan No Virtual Account ${getPaymentCode()}`, 'Selesai'],
        'Internet Banking': ['Login Website', 'Menu Pembayaran', `Masukan No Virtual Account ${getPaymentCode()}`, 'Gunakan Token']
    };

    return (
        <UserLayout auth={auth}>
            <Head title={`Invoice ${order.invoice_number}`} />

            <div className="min-h-screen bg-white py-12 px-4">
                <div className="max-w-7xl mx-auto px-2 lg:px-10">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                
                                <div className="mb-6 flex justify-center">
                                    {order.payment_method === 'qris' ? (
                                        <h2 className="text-3xl font-black text-gray-800 tracking-tighter">QRIS</h2>
                                    ) : (
                                        <h2 className="text-xl font-bold uppercase text-gray-700">{getBankName()}</h2>
                                    )}
                                </div>

                                <p className="text-gray-500 text-sm font-medium mb-2">Total Pembayaran</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 mb-8">
                                    Rp {parseInt(order.amount).toLocaleString('id-ID')}
                                </h3>

                                {order.payment_status === 'pending' ? (
                                    <>
                                        {getQrImage() ? (
                                            <div className="flex flex-col items-center">
                                                <p className="text-gray-500 text-sm mb-4">Scan Kode QR di bawah ini:</p>
                                                <div className="bg-white p-2 border-2 border-gray-100 rounded-xl mb-6 shadow-sm">
                                                    <img src={getQrImage()} alt="QR Code" className="w-48 h-48 object-contain" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-100 p-6 rounded-xl border border-gray-100 mb-6">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Nomor Virtual Account</p>
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="text-2xl font-mono font-bold text-gray-800 tracking-wide">
                                                        {getPaymentCode()}
                                                    </span>
                                                    <button onClick={() => copyToClipboard(getPaymentCode())} className="text-gray-400 hover:text-pink-500 transition">
                                                        <Copy className="w-5 h-5"/>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-100 pt-6">
                                            <p className="text-gray-400 text-xs font-medium mb-1">Batas Waktu Pembayaran</p>
                                            <p className="text-lg font-bold text-pink-500">{timeLeft || 'Loading...'}</p>
                                        </div>
                                    </>
                                ) : order.payment_status === 'paid' ? (
                                    <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold flex flex-col items-center gap-2">
                                        <CheckCircle2 className="w-10 h-10" />
                                        <span>Pembayaran Berhasil</span>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 text-red-700 p-4 rounded-xl font-bold flex flex-col items-center gap-2">
                                        <XCircle className="w-10 h-10" />
                                        <span>Pembayaran Gagal</span>
                                    </div>
                                )}

                                <div className="mt-8 text-left border-t border-gray-100 pt-6">
                                    <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
                                        <span className="text-sm">Butuh Bantuan?</span>
                                    </div>
                                    <div className="space-y-2">
                                        {Object.keys(helpSections).map((section) => (
                                            <div key={section} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedHelp(expandedHelp === section ? null : section)}
                                                    className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition text-sm text-gray-600 font-medium"
                                                >
                                                    {section}
                                                    {expandedHelp === section ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                                                </button>
                                                {expandedHelp === section && (
                                                    <div className="px-4 pb-4 pt-1 bg-gray-50">
                                                        <ol className="list-decimal list-inside space-y-1 text-xs text-gray-500">
                                                            {helpSections[section].map((step, idx) => <li key={idx}>{step}</li>)}
                                                        </ol>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 h-full flex flex-col">
                                <h2 className="text-xl font-bold text-gray-900 mb-8">Rincian Pesanan</h2>

                                <div className="flex justify-around items-center mb-10 px-4 relative">
                                    {['Menunggu', 'Diterima',].map((step, index) => {
                                        const isActive = currentStep() >= index + 1;
                                        return (
                                            <div key={step} className="flex flex-col items-center relative z-10 bg-white px-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${isActive ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    {index === 0 && <Clock className="w-4 h-4" />}
                                                    {index === 1 && <DollarSign className="w-4 h-4" />}
                                                </div>
                                                <span className={`text-xs font-bold ${isActive ? 'text-pink-500' : 'text-gray-300'}`}>{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="bg-gray-50 rounded-xl p-5 mb-8 flex items-center gap-5">
                                    <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center text-blue-600">
                                        <Smartphone className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs mb-1">Produk</p>
                                        <h3 className="font-bold text-gray-900 text-lg">{order.package?.name}</h3>
                                        <p className="text-gray-500 text-sm">eSIM Indonesia</p>
                                    </div>
                                </div>

                                <div className="space-y-5 flex-grow">
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">No. Transaksi</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-900 font-mono font-medium text-sm">{order.invoice_number}</span>
                                            <button onClick={() => copyToClipboard(order.invoice_number)} className="text-gray-400 hover:text-pink-500">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                            
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Status</span>
                                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                                            order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                            order.payment_status === 'paid' ? 'bg-green-100 text-green-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                            {order.payment_status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Email</span>
                                        <span className="text-gray-900 font-sm">{order.email}</span>
                                    </div>
                                </div>
                               
                            {currentStep() === 3 && order.profiles?.length > 0 && (
                            <div className="mt-8 space-y-6 animate-fade-in-up">
                                {order.profiles.map((profile, index) => {
                                    
                                    const parts = profile.activation_code ? profile.activation_code.split('$') : [];
                                    const smdpAddress = parts.length > 1 ? parts[1] : null;

                                    return (
                                    <div key={index} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    
                                        <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4 flex justify-between items-center text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                    <WifiPenIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm">eSIM Ready to Install</h3>
                                                    <p className="text-green-100 text-xs">Profile #{index + 1}</p>
                                                </div>
                                            </div>
                                        
                                            <div className="flex gap-2">
                                                <a
                                                    href={profile.qr_code_url.replace('.png', '')}
                                                    target="_blank"
                                                    className="text-xs bg-white text-pink-500 px-3 py-1.5 rounded-md font-bold hover:bg-pink-100"
                                                >
                                                    Cek Data
                                                </a>
                                            </div>

                                        </div>

                                        <div className="p-6 bg-white">
                                
                                            <div className="flex flex-col items-center mb-8">
                                                <div className="p-3 border-2 border-dashed border-gray-300 rounded-xl mb-3">
                                                    
                                                    <img src={profile.qr_code_url} alt="eSIM QR" className="w-48 h-48 object-contain" />
                                                </div>
                                                <p className="text-xs text-center text-gray-500 max-w-xs">
                                                    Scan QR Code ini pada menu Pengaturan Seluler / SIM Manager di HP Anda.
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">Instalasi Manual</h4>
                                                
                                                {smdpAddress && (
                                                    <div>
                                                        <label className="text-xs text-gray-400 block mb-1">SM-DP+ Address</label>
                                                        <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center group">
                                                            <code className="text-sm font-mono text-gray-700 break-all">
                                                                {smdpAddress}
                                                            </code>
                                                            <button onClick={() => copyToClipboard(smdpAddress)} className="text-gray-400 hover:text-green-600">
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Activation Code</label>
                            <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center group">
                                <code className="text-sm font-mono text-gray-700 break-all pr-2">
                                    {profile.activation_code}
                                </code>
                                <button onClick={() => copyToClipboard(profile.activation_code)} className="text-gray-400 hover:text-green-600 shrink-0">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                       
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">ICCID</label>
                                <div className="bg-gray-50 p-2 rounded-lg flex justify-between items-center">
                
                                    <span className="text-xs font-mono font-bold text-gray-700 truncate">{profile.iccid}</span>
                                    <button onClick={() => copyToClipboard(profile.iccid)} className="text-gray-400 hover:text-green-600">
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 block mb-1">APN</label>
                                <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2">
                                    <Wifi className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-700">{profile.apn || 'Manual'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )})}

        <div className="bg-yellow-50 p-4 rounded-xl flex gap-3 items-start border border-yellow-100">
            <div className="mt-1 text-yellow-600">
                <Key className="w-5 h-5" />
            </div>
            <div className="text-sm text-yellow-800">
                <p className="font-bold mb-1">Penting!</p>
                <p className="text-xs opacity-90 leading-relaxed">
                    Halaman ini bersifat publik (invoice). Mohon simpan data Activation Code Anda. Jangan bagikan URL ini kepada orang yang tidak berkepentingan.
                </p>
            </div>
        </div>
    </div>
)}


                                {currentStep() === 2 && (
                                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-center gap-3">
                                        <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                                        <span className="text-blue-700 font-bold text-sm">Sedang memproses eSIM...</span>
                                    </div>
                                )}

                                <div className="mt-8 pt-4 text-center">
                                    <Link href="/essim" className="text-pink-500 font-bold hover:text-pink-600 transition text-sm">
                                        Beli Produk Lainnya
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </UserLayout>
    );
}