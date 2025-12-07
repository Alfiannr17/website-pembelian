import UserLayout from '@/Layouts/UserLayout';
import { Head, useForm } from '@inertiajs/react';
import { Headset } from 'lucide-react';

export default function Check({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        invoice_number: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('transaction.process'));
    };

    return (
        <UserLayout auth={auth}>
            <Head title="Cek Transaksi" />

            <div className="min-h-screen bg-white flex flex-col px-4  py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
                            <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Cek Pesanan
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Lacak status pembayaran dan pengiriman item kamu.
                        </p>
                    </div>

                    <div className="bg-white py-8 px-4 sm:rounded-lg rounded-2xl sm:px-10 border border-gray-100">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="invoice" className="block text-sm font-medium text-gray-700">
                                    Nomor Invoice / Transaksi
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        id="invoice"
                                        type="text"
                                        placeholder="Masukan No. Invoice"
                                        value={data.invoice_number}
                                        onChange={(e) => setData('invoice_number', e.target.value)}
                                        className={`block w-full pr-10 border-gray-100 rounded-lg focus:ring-pink-500 focus:border-pink-500 sm:text-sm py-3 ${
                                            errors.invoice_number ? 'border-red-300' : ''
                                        }`}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.invoice_number && (
                                    <p className="mt-2 text-sm text-red-600" id="email-error">
                                        {errors.invoice_number}
                                    </p>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Mencari...' : 'Cek Status Pesanan'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">
                                        Butuh bantuan?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-3">
                                <a
                                    href="https://wa.me/628123456789" // Ganti nomor WA Anda
                                    target="_blank"
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-100 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    
                                       <Headset className="h-5 w-5 text-green-500 mr-2" />
                                    
                                    Hubungi Admin
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}