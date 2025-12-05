import UserLayout from '@/Layouts/UserLayout';
import { Head, useForm } from '@inertiajs/react';

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

            <div className="min-h-screen bg-gray-50 flex flex-col px-4  py-12 sm:px-6 lg:px-8">
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

                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg rounded-2xl sm:px-10 border border-gray-300">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="invoice" className="block text-sm font-medium text-gray-700">
                                    Nomor Invoice / Transaksi
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        id="invoice"
                                        type="text"
                                        placeholder="Contoh: INV-XXXXXXXX"
                                        value={data.invoice_number}
                                        onChange={(e) => setData('invoice_number', e.target.value)}
                                        className={`block w-full pr-10 border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 sm:text-sm py-3 ${
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
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 transition-colors"
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
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.897.003-6.111 4.981-11.086 11.094-11.086 2.964.002 5.751 1.156 7.848 3.253 2.096 2.098 3.249 4.885 3.251 7.85 0 6.115-4.978 11.09-11.095 11.09-2.007-.001-3.996-.532-5.776-1.528L0 24.057zm3.876-4.575l.394.233c1.658.985 3.526 1.503 5.435 1.505 5.567.001 10.096-4.529 10.097-10.097-.002-2.697-1.052-5.232-2.956-7.135-1.905-1.905-4.44-2.954-7.138-2.954-5.569 0-10.098 4.53-10.1 10.1-.001 1.93.535 3.824 1.554 5.525l.245.412-1.033 3.771 3.502-1.06zm12.353-7.567c.361.202.766.197 1.058-.088.354-.343.896-1.12 1.144-1.512.247-.393.284-.755.123-.957-.161-.202-.423-.323-.886-.545-.462-.222-2.731-1.353-3.154-1.515-.423-.162-.731-.242-1.038.222-.308.465-1.192 1.515-1.461 1.818-.269.303-.538.343-1.001.121-.461-.222-1.951-.719-3.717-2.293-1.365-1.218-2.287-2.723-2.556-3.188-.269-.465-.029-.716.203-.948.209-.209.462-.545.693-.818.23-.273.308-.465.461-.777.154-.313.077-.586-.038-.818-.115-.232-1.039-2.505-1.423-3.434-.374-.903-.755-.78-1.039-.794-.275-.013-.59-.013-.905-.013-.315 0-.827.118-1.26.591-.433.474-1.654 1.616-1.654 3.939 0 2.324 1.692 4.566 1.923 4.869.231.303 3.328 5.085 8.064 7.131 2.822 1.218 3.921 1.218 5.312 1.157 1.11-.049 2.731-1.121 3.115-2.202.385-1.081.385-2.01.269-2.202z"/>
                                    </svg>
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