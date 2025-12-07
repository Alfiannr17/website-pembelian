import UserLayout from '@/Layouts/UserLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Search, Wifi, Database, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Check({ auth, result }) {
    const { data, setData, post, processing, errors } = useForm({
        invoice_number: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/essim/check');
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <UserLayout auth={auth}>
            <Head title="Cek Status & Usage eSIM" />

            <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
                <div className="max-w-2xl w-full">

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <Search className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                            Cek Status & Kuota
                        </h2>
                        <p className="text-gray-600">
                            Masukkan <b>Nomor Invoice</b> atau <b>ID Transaksi eSIM</b>
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 mb-8">
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label htmlFor="invoice" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nomor Invoice / eSIM ID
                                </label>
                                <div className="relative">
                                    <input
                                        id="invoice"
                                        type="text"
                                        placeholder="Contoh: ESIM-XXXX atau 250303..."
                                        value={data.invoice_number}
                                        onChange={(e) => setData('invoice_number', e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        required
                                    />
                                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                </div>
                                {errors.invoice_number && (
                                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.invoice_number}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-200"
                            >
                                {processing ? 'Sedang Mencari...' : 'CEK DATA'}
                            </button>
                        </form>
                    </div>

                    {result && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Hasil Pencarian</h3>
                                {result.order && (
                                    <Link href={`/essim/invoice/${result.order.invoice_number}`} className="text-sm text-blue-600 hover:underline">
                                        Lihat Invoice &rarr;
                                    </Link>
                                )}
                            </div>

                            <div className="p-6 space-y-6">
                                {result.order && (
                                    <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Status Pembayaran</p>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                                result.order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {result.order.payment_status === 'paid' ? <CheckCircle2 className="w-3 h-3"/> : null}
                                                {result.order.payment_status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                                            <p className="font-medium text-gray-900">{result.order.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Paket</p>
                                            <p className="font-medium text-gray-900">{result.order.package?.name}</p>
                                        </div>
                                    </div>
                                )}

                                {result.usages && result.usages.length > 0 ? (
                                    result.usages.map((usage, idx) => {
                                        const total = usage.totalData || 1; 
                                        const used = usage.dataUsage || 0;
                                        const remaining = total - used;
                                        const percentUsed = Math.min(100, Math.max(0, (used / total) * 100));
                                        
                                        return (
                                            <div key={idx} className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="bg-blue-500 p-2 rounded-lg text-white">
                                                        <Wifi className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">eSIM ID</p>
                                                        <p className="font-mono font-bold text-gray-800 text-sm">{usage.esimTranNo}</p>
                                                    </div>
                                                </div>

                                                <div className="mb-2 flex justify-between text-sm font-medium">
                                                    <span className="text-gray-600">Terpakai: {formatBytes(used)}</span>
                                                    <span className="text-gray-900">Total: {formatBytes(total)}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                                                    <div 
                                                        className={`h-3 rounded-full transition-all duration-500 ${percentUsed > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                        style={{ width: `${percentUsed}%` }}
                                                    ></div>
                                                </div>

                                                <div className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2 text-green-700 font-bold">
                                                        <Database className="w-4 h-4" />
                                                        Sisa: {formatBytes(remaining)}
                                                    </div>
                                                    <div className="text-gray-400 text-xs">
                                                        Update: {new Date(usage.lastUpdateTime).toLocaleTimeString('id-ID')}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>Data penggunaan belum tersedia atau eSIM belum aktif.</p>
                                        <p className="text-xs mt-1">(Data update setiap 2-3 jam)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}