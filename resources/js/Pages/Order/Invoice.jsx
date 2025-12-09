
import UserLayout from '@/Layouts/UserLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { 
    Clock, Copy, Download, RefreshCw, CreditCard, 
    CheckCircle2, XCircle, ChevronDown, ChevronUp, Smartphone,
    Calendar, User, FileText, Check, DollarSign, Gamepad2
} from 'lucide-react';

export default function Invoice({ auth, transaction, paymentInfo }) {
    const [timeLeft, setTimeLeft] = useState(null);
    const [expandedHelp, setExpandedHelp] = useState(null);

    useEffect(() => {
        if (transaction.status === 'pending') {
            const expiryTime = new Date(transaction.created_at).getTime() + (24 * 60 * 60 * 1000);
            
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
    }, [transaction]);

    useEffect(() => {
        if (transaction.status === 'paid' || transaction.status === 'processing') {
            const interval = setInterval(() => {
                router.reload({ only: ['transaction'] });
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [transaction]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Disalin!');
    };

    const paymentData = (() => {
        if (!paymentInfo) return null;
        if (typeof paymentInfo === 'string') {
            try { return JSON.parse(paymentInfo); } catch (e) { return null; }
        }
        return paymentInfo;
    })();

    const getBankName = () => {
        switch(transaction.payment_method) {
            case 'bca_va': return 'BCA Virtual Account';
            case 'bni_va': return 'BNI Virtual Account';
            case 'bri_va': return 'BRI Virtual Account';
            case 'mandiri_va': return 'Mandiri Virtual Account';
            case 'permata_va': return 'Permata Virtual Account';
            case 'alfamart': return 'Alfamart';
            case 'indomaret': return 'Indomaret';
            case 'qris': return 'QRIS';
            default: return 'Virtual Account';
        }
    };

    const getPaymentCode = () => {
        if (!paymentData) return '-';
        if (paymentData.va_numbers?.[0]) return paymentData.va_numbers[0].va_number;
        if (paymentData.permata_va_number) return paymentData.permata_va_number;
        if (paymentData.payment_code) return paymentData.payment_code; 
        return '-';
    };

    const getQrImage = () => {
        if (['qris', 'gopay'].includes(transaction.payment_method)) {
            const actionUrl = paymentData?.actions?.find(a => a.name === 'generate-qr-code')?.url;
            if (actionUrl) return actionUrl;
            const qrString = paymentData?.qr_string;
            if (qrString) return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;
        }
        return null;
    };

    const currentStep = () => {
        if (transaction.status === 'failed' || transaction.status === 'expired') return 0;
        if (transaction.status === 'pending') return 1;
        if (transaction.status === 'paid' || transaction.status === 'processing') return 2;
        if (transaction.status === 'success' || transaction.status === 'completed') return 3;
        return 1;
    };

    const getStatusColor = (status) => {
        if (['paid', 'success', 'completed'].includes(status)) return 'bg-green-100 text-green-700';
        if (['pending', 'processing'].includes(status)) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    const helpSections = {
        'Mobile Banking': ['Login Aplikasi', 'Menu Transfer > Virtual Account', `Input: ${getPaymentCode()}`, 'Konfirmasi'],
        'ATM': ['Masukkan Kartu', 'Menu Transaksi Lain > Transfer', `Pilih Virtual Account: ${getPaymentCode()}`, 'Selesai'],
        'Internet Banking': ['Login Website', 'Menu Pembayaran', `Input VA: ${getPaymentCode()}`, 'Gunakan Token']
    };

    return (
        <UserLayout auth={auth}>
            <Head title={`Invoice ${transaction.invoice_number}`} />

            <div className="min-h-screen bg-white py-12 px-4">
                <div className="max-w-7xl mx-auto px-2 lg:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                                
                                <div className="mb-6 flex justify-center">
                                    {transaction.payment_method === 'qris' ? (
                                        <h2 className="text-3xl font-black text-gray-800 tracking-tighter">QRIS</h2>
                                    ) : (
                                        <h2 className="text-xl font-bold uppercase text-gray-700">{getBankName()}</h2>
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm font-medium mb-2">Total Pembayaran</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 mb-8">
                                    Rp {parseInt(transaction.amount).toLocaleString('id-ID')}
                                </h3>
                                {transaction.status === 'pending' ? (
                                    <>
                                        {getQrImage() ? (
                                            <div className="flex flex-col items-center">
                                                <p className="text-gray-500 text-sm mb-4">Scan Kode QR di bawah ini:</p>
                                                <div className="bg-white p-2 border-2 border-gray-100 rounded-xl mb-6 shadow-sm">
                                                    <img src={getQrImage()} alt="QR Code" className="w-48 h-48 object-contain" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 mb-6">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Nomor Virtual Account</p>
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="text-2xl font-mono font-bold text-gray-800 tracking-wide break-all">
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
                                ) : transaction.status === 'paid' ? (
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
                                            <div key={section} className="border border-gray-100 rounded-lg overflow-hidden">
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
                                    {['Menunggu', 'Diterima'].map((step, index) => {
                                        const isActive = currentStep() >= index + 1;
                                        return (
                                            <div key={step} className="flex flex-col items-center relative z-10 bg-white px-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${isActive ? 'bg-pink-500 text-white ' : 'bg-gray-100 text-gray-400'}`}>
                                                    {index === 0 && <Clock className="w-4 h-4" />}
                                                    {index === 1 && <DollarSign className="w-4 h-4" />}
                                            
                                                </div>
                                                <span className={`text-xs font-bold ${isActive ? 'text-pink-500' : 'text-gray-300'}`}>{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="bg-gray-50 rounded-xl p-5 mb-8 flex items-center gap-5">
                                    <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center text-blue-600 overflow-hidden">
                                        {transaction.game?.image ? (
                                            <img src={`/storage/${transaction.game.image}`} alt="Game" className="w-full h-full object-cover" />
                                        ) : (
                                            <Gamepad2 className="w-8 h-8" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs mb-1">Produk</p>
                                        <h3 className="font-bold text-gray-900 text-lg">{transaction.item?.name}</h3>
                                        <p className="text-gray-500 text-sm">{transaction.game?.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-5 flex-grow">
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">No. Transaksi</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-900 font-mono font-medium text-sm">
                                                {transaction.invoice_number}
                                            </span>
                                            <button onClick={() => copyToClipboard(transaction.invoice_number)} className="text-gray-400 hover:text-pink-500">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Status</span>
                                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${getStatusColor(transaction.status)}`}>
                                            {transaction.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Total Bayar</span>
                                        <span className="text-gray-900 font-bold">
                                            Rp {parseInt(transaction.amount).toLocaleString('id-ID')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Waktu Pemesanan</span>
                                        <span className="text-gray-900 text-sm text-right">
                                            {new Date(transaction.created_at).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">User ID (Game)</span>
                                        <span className="text-gray-900 text-sm font-medium">
                                            {transaction.game_user_id} {transaction.game_zone_id ? `(${transaction.game_zone_id})` : ''}
                                        </span>
                                    </div>
                                </div>

                                {transaction.status === 'processing' && (
                                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-center gap-3 animate-pulse">
                                        <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                                        <span className="text-blue-700 font-bold text-sm">Pesanan sedang diproses provider...</span>
                                    </div>
                                )}

                                <div className="mt-8 pt-4 text-center">
                                    <Link href="/" className="text-pink-500 font-bold hover:text-pink-600 transition text-sm">
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