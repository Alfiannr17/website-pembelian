// resources/js/Pages/Esim/Invoice.jsx
import UserLayout from '@/Layouts/UserLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { 
    Clock, Copy, Download, RefreshCw, CreditCard, 
    CheckCircle2, XCircle, ChevronDown, Smartphone,
    Calendar, User, FileText, Check, DollarSign, ChevronUp
} from 'lucide-react';

export default function Invoice({ auth, order, paymentInfo }) {
    const [timeLeft, setTimeLeft] = useState(null);
    const [expandedHelp, setExpandedHelp] = useState(null);

    // 1. Timer Logic
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

    // 2. Auto-refresh Logic
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

    // Data Bantuan
    const helpSections = {
        'Mobile Banking': ['Login Aplikasi', 'Pilih Transfer > Virtual Account', `Input: ${getPaymentCode()}`, 'Konfirmasi PIN'],
        'ATM': ['Masukkan Kartu & PIN', 'Menu Transaksi Lain > Transfer', `Pilih Virtual Account: ${getPaymentCode()}`, 'Selesai'],
        'Internet Banking': ['Login Website', 'Menu Pembayaran', `Input VA: ${getPaymentCode()}`, 'Gunakan Token']
    };

    return (
        <UserLayout auth={auth}>
            <Head title={`Invoice ${order.invoice_number}`} />

            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-7xl mx-auto px-2 lg:px-10">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* === LEFT COLUMN: PAYMENT CARD === */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-200">
                                
                                {/* Logo / Title */}
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
                                        {/* QRIS Display */}
                                        {getQrImage() ? (
                                            <div className="flex flex-col items-center">
                                                <p className="text-gray-500 text-sm mb-4">Scan Kode QR di bawah ini:</p>
                                                <div className="bg-white p-2 border-2 border-gray-100 rounded-xl mb-6 shadow-sm">
                                                    <img src={getQrImage()} alt="QR Code" className="w-48 h-48 object-contain" />
                                                </div>
                                            </div>
                                        ) : (
                                            /* VA Display */
                                            <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 mb-6">
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

                                {/* Help Section */}
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

                        {/* === RIGHT COLUMN: ORDER DETAILS === */}
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 h-full flex flex-col">
                                <h2 className="text-xl font-bold text-gray-900 mb-8">Rincian Pesanan</h2>

                                {/* Stepper */}
                                <div className="flex justify-between items-center mb-10 px-4 relative">
                                    <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 -z-0"></div>
                                    <div className={`absolute top-4 left-0 h-0.5 bg-pink-500 -z-0 transition-all duration-500`} 
                                         style={{ width: currentStep() === 3 ? '100%' : currentStep() === 2 ? '50%' : '0%' }}></div>

                                    {['Menunggu', 'Diterima', 'Selesai'].map((step, index) => {
                                        const isActive = currentStep() >= index + 1;
                                        return (
                                            <div key={step} className="flex flex-col items-center relative z-10 bg-white px-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${isActive ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-gray-100 text-gray-400'}`}>
                                                    {index === 0 && <Clock className="w-4 h-4" />}
                                                    {index === 1 && <DollarSign className="w-4 h-4" />}
                                                    {index === 2 && <Check className="w-4 h-4" />}
                                                </div>
                                                <span className={`text-xs font-bold ${isActive ? 'text-pink-500' : 'text-gray-300'}`}>{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Product Info */}
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

                                {/* Details Table */}
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
                                        <span className="text-gray-500 text-sm">Total Bayar</span>
                                        <span className="text-gray-900 font-sm">{order.email}</span>
                                    </div>

                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Total Bayar</span>
                                        <span className="text-gray-900 font-bold">Rp {parseInt(order.amount).toLocaleString('id-ID')}</span>
                                    </div>
                                    

                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Waktu Pemesanan</span>
                                        <span className="text-gray-900 text-sm text-right">
                                            {new Date(order.created_at).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                                

                                {/* eSIM Download Button (Only if Completed) */}
                                {currentStep() === 3 && order.profiles?.length > 0 && (
                                    <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                        <h3 className="font-bold text-green-800 mb-2">eSIM Siap!</h3>
                                        <Link href={`/essim/details/${order.id}`} className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition">
                                            <Download className="w-4 h-4" /> Download QR
                                        </Link>
                                    </div>
                                )}

                                {/* Loading State */}
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