import UserLayout from '@/Layouts/UserLayout';
import { Head, Link } from '@inertiajs/react';
import { Wifi, Clock, Zap } from 'lucide-react';
import React, { useState } from 'react';

export default function Index({ auth, packages }) {

    return (
        <UserLayout auth={auth}>
            <Head title="eSIM Indonesia" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500 mb-4">
                        <Wifi className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        eSIM Indonesia
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Aktivasi instan. Tanpa kartu fisik. Data internet berkecepatan tinggi di Indonesia.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                            <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Aktivasi Instan</h3>
                        <p className="text-sm text-gray-600">
                            Scan QR code dan langsung terkoneksi dalam hitungan menit
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                            <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Fleksibel</h3>
                        <p className="text-sm text-gray-600">
                            Pilih paket sesuai kebutuhan, dari harian hingga bulanan
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
                            <Wifi className="w-6 h-6 text-pink-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Jaringan Terbaik</h3>
                        <p className="text-sm text-gray-600">
                            Koneksi 4G/5G dengan coverage terluas di Indonesia
                        </p>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Pilih Paket eSIM</h2>
                    {(() => {
                        const itemsPerPage = 3;
                        const totalPages = Math.ceil(packages.length / itemsPerPage);

                        const groupSize = 5;
                        const [page, setPage] = useState(1);

                        const currentGroup = Math.ceil(page / groupSize);
                        const startPage = (currentGroup - 1) * groupSize + 1;
                        const endPage = Math.min(currentGroup * groupSize, totalPages);

                        const start = (page - 1) * itemsPerPage;
                        const currentItems = packages.slice(start, start + itemsPerPage);

                        return (
                            <>
                                {packages.length === 0 ? (
                                    <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                                        <p className="text-gray-500">Belum ada paket tersedia</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {currentItems.map((pkg) => (
                                                <Link
                                                    key={pkg.packageCode}
                                                    href={`/essim/packages/${pkg.packageCode}`}
                                                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 
                                                               hover:border-pink-500 hover:bg-pink-50 hover:shadow transition-all duration-300 group
                                                               flex flex-col h-full"
                                                >     
                                                    {pkg.duration <= 7 && (
                                                        <div className="w-fit bg-pink-100 text-pink-500 text-xs font-bold px-3 py-1 rounded-full mb-4">
                                                            BEST SELLER
                                                        </div>
                                                    )}

                                                    <div className="mb-4">
                                                        <span className="text-3xl font-bold text-gray-900">
                                                            {pkg.name}
                                                        </span>
                                                        <p className="text-gray-600 text-sm">
                                                            Berlaku {pkg.duration} {pkg.duration_unit === "DAYS" ? "Day" : "Hari"}
                                                        </p>
                                                    </div>

                                                    <div className="pt-4 border-t border-gray-100 mt-auto">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">Harga</p>
                                                                <p className="text-2xl font-bold text-pink-500">
                                                                    Rp {pkg.price_idr.toLocaleString("id-ID")}
                                                                </p>
                                                            </div>
                                                            <div className="bg-pink-500 text-white p-3 rounded-lg group-hover:bg-pink-700 transition">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex justify-center items-center gap-2 mt-6">

                                            <button
                                                disabled={page === 1}
                                                onClick={() => setPage(page - 1)}
                                                className={`px-3 py-2 border rounded-lg ${
                                                    page === 1
                                                        ? "text-gray-400 border-gray-300"
                                                        : "text-pink-600 border-pink-400 hover:bg-pink-100"
                                                }`}
                                            >
                                                Prev
                                            </button>

                                            {Array.from(
                                                { length: endPage - startPage + 1 },
                                                (_, i) => startPage + i
                                            ).map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => setPage(p)}
                                                    className={`px-3 py-2 rounded-lg border ${
                                                        page === p
                                                            ? "bg-pink-500 text-white border-pink-600"
                                                            : "border-gray-300 text-gray-700 hover:bg-pink-100 hover:border-pink-400"
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}

                                            <button
                                                disabled={page === totalPages}
                                                onClick={() => setPage(page + 1)}
                                                className={`px-3 py-2 border rounded-lg ${
                                                    page === totalPages
                                                        ? "text-gray-400 border-gray-300"
                                                        : "text-pink-600 border-pink-400 hover:bg-pink-100"
                                                }`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        );
                    })()}
                </div>

                <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        Cara Menggunakan eSIM
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1,2,3,4].map((num, idx) => {
                            const steps = [
                                ["Pilih Paket", "Pilih paket data sesuai kebutuhan Anda"],
                                ["Bayar", "Selesaikan pembayaran dengan metode pilihan Anda"],
                                ["Terima QR Code", "Dapatkan QR code aktivasi via email"],
                                ["Scan & Aktifkan", "Scan QR code di pengaturan HP Anda"],
                            ];
                            return (
                                <div key={idx} className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-500 text-white font-bold mb-4">
                                        {num}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">{steps[idx][0]}</h3>
                                    <p className="text-sm text-gray-600">{steps[idx][1]}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </UserLayout>
    );
}
