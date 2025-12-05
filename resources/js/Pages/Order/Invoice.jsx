import UserLayout from '@/Layouts/UserLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Invoice({ auth, transaction, paymentInfo }) {
    const [timeLeft, setTimeLeft] = useState(null);
    const [copied, setCopied] = useState(false);
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

    const copyToClipboard = (text) => {
        if (!text || text === '-') return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        alert('Disalin ke clipboard!');
    };

    
    const getPaymentCode = () => {
        if (!paymentInfo) return '-';
      
        if (paymentInfo.va_numbers && paymentInfo.va_numbers.length > 0) {
            return paymentInfo.va_numbers[0].va_number;
        }

        if (paymentInfo.permata_va_number) {
            return paymentInfo.permata_va_number;
        }
      
        if (['alfamart', 'indomaret'].includes(transaction.payment_method)) {
            return paymentInfo.payment_code || '-';
        }
      
        if (paymentInfo.bill_key) {
            return paymentInfo.bill_key;
        }
        return '-';
    };

    const getQrImage = () => {
        
        if (['qris', 'gopay', 'shopeepay'].includes(transaction.payment_method)) {
          
            const actionUrl = paymentInfo?.actions?.find(a => a.name === 'generate-qr-code')?.url;
            if (actionUrl) return actionUrl;

           
            const qrString = paymentInfo?.qr_string;
            if (qrString) return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;
        }
        return null;
    };


    const helpSections = {
        'ATM': [
            'Masukkan kartu & PIN', 
            'Pilih Transaksi Lain > Pembayaran', 
            `Masukkan Nomor Virtual Account: ${getPaymentCode()}`, 
            'Konfirmasi Pembayaran'
        ],
        'Mobile Banking': [
            'Login Aplikasi', 
            'Pilih menu Transfer / Bayar', 
            `Masukkan No VA: ${getPaymentCode()}`, 
            'Konfirmasi PIN'
        ],
        'Internet Banking': [
            'Login Website', 
            'Menu Pembayaran', 
            `Input Virtual Account: ${getPaymentCode()}`, 
            'Gunakan Token'
        ]
    };

    return (
        <UserLayout auth={auth}>
            <Head title={`Invoice ${transaction.invoice_number}`} />

            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-10">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                     
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-300">
                            
                                <div className="mb-6 flex justify-center">
                                    {['qris', 'gopay', 'shopeepay'].includes(transaction.payment_method) ? (
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/ddee/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png" alt="QRIS" className="h-12" />
                                    ) : (
                                        <h2 className="text-2xl font-bold uppercase text-gray-700">{transaction.payment_method.replace('_', ' ')}</h2>
                                    )}
                                </div>

                                <p className="text-gray-500 text-sm font-medium mb-2">Total Pembayaran</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 mb-8">
                                    Rp {parseInt(transaction.amount).toLocaleString('id-ID')}
                                </h3>

                                {transaction.status === 'pending' ? (
                                    <>
                                     
                                        {['qris', 'gopay', 'shopeepay'].includes(transaction.payment_method) ? (
                                            <div className="flex flex-col items-center">
                                                <p className="text-gray-500 text-sm mb-4">Scan Kode QR di bawah ini:</p>
                                                <div className="bg-white p-2 border-2 border-gray-100 rounded-xl mb-6 shadow-sm">
                                                    {getQrImage() ? (
                                                        <img 
                                                            src={getQrImage()} 
                                                            alt="QR Code" 
                                                            className="w-48 h-48 object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-48 h-48 flex items-center justify-center bg-gray-50 text-gray-400 text-xs text-center">
                                                            QR Code tidak tersedia.<br/>Cek status pesanan.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                      
                                            <div className="bg-gray-200 p-6 rounded-xl border border-gray-200 mb-6">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Nomor Virtual Account</p>
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="text-2xl font-mono font-bold text-gray-800 tracking-wide">
                                                        {getPaymentCode()}
                                                    </span>
                                                    <button onClick={() => copyToClipboard(getPaymentCode())} className="text-gray-400 hover:text-pink-500 transition">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-100 pt-6">
                                            <p className="text-gray-400 text-xs font-medium mb-1">Batas Waktu Pembayaran</p>
                                            <p className="text-lg font-bold text-pink-500">{timeLeft || 'Loading...'}</p>
                                        </div>
                                    </>
                                ) : (
                                
                                    <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold flex items-center justify-center gap-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                        Pembayaran Berhasil
                                    </div>
                                )}

                          
                                <div className="mt-8 text-left">
                                    <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        <span>Butuh Bantuan?</span>
                                    </div>
                                    <div className="space-y-2">
                                        {Object.keys(helpSections).map((section) => (
                                            <div key={section} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedHelp(expandedHelp === section ? null : section)}
                                                    className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition text-sm text-gray-600 font-medium"
                                                >
                                                    {section}
                                                    <svg className={`w-4 h-4 transition-transform ${expandedHelp === section ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
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
                            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-300 h-full flex flex-col">
                                <h2 className="text-xl font-bold text-gray-900 mb-8">Rincian Pesanan</h2>

                
                                <div className="flex justify-between items-center mb-10 px-4 relative">
                                    {['Menunggu', 'Sudah di bayar'].map((step, index) => {
                                    
                                        const status = transaction.status; 
                                        let isActive = false;
                                        if (index === 0) isActive = true;
                                        if (index === 1 && (status === 'paid' || status === 'done')) isActive = true;
                                        
                                        
                                        return (
                                            <div key={step} className="flex flex-col items-center relative z-10 w-1/3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${isActive ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-gray-100 text-gray-400'}`}>
                                                    {index === 0 && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                                    {index === 1 && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                                   
                                                </div>
                                                <span className={`text-xs font-bold ${isActive ? 'text-pink-500' : 'text-gray-300'}`}>{step}</span>
                                            </div>
                                        );
                                    })}
                                    <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 -z-0 hidden md:block" style={{ left: '50%', transform: 'translateX(-50%)', width: '80%' }}></div>
                                </div>

                           
                                <div className="bg-gray-200 rounded-xl p-5 mb-8 flex items-center gap-5">
                                    {transaction.game?.image && (
                                        <img 
                                            src={`/storage/${transaction.game.image}`} 
                                            alt={transaction.game.name}
                                            className="w-16 h-16 rounded-lg object-cover shadow-sm"
                                        />
                                    )}
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
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Status</span>
                                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                            transaction.status === 'paid' ? 'bg-green-100 text-green-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
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
                                            {new Date(transaction.created_at).toLocaleString('id-ID', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            }).replace(/\./g, ':')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">User ID</span>
                                        <span className="text-gray-900 font-medium text-sm">{transaction.game_user_id}</span>
                                    </div>
                                </div>

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