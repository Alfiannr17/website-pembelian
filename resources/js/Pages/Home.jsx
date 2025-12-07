import UserLayout from '@/Layouts/UserLayout';
import { Head, Link } from '@inertiajs/react';
import { Wifi } from 'lucide-react';

export default function Home({ auth, featured_games, all_games }) {
    return (
        <UserLayout auth={auth}>
            <Head title="Home" />

        
            <div className="bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                

                <div className="mb-10 relative rounded-xl overflow-hidden group cursor-pointer">
                    <img 
                        src="/images/banner-home.jpg" 
                        alt="Banner Promo" 
                        className="w-full h-[200px] md:h-[350px] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-600 to-blue-400 pointer-events-none"></div>
                </div>

              
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-pink-500 text-2xl">🔥</span>
                        <h2 className="text-2xl font-bold text-gray-800">Produk Unggulan</h2>
                    </div>


                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {featured_games.map(game => (
                            <Link
                                key={game.id}
                                href={`/order/${game.slug}`}
                                className="bg-white rounded-2xl p-3 hover:shadow border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:bg-pink-100 hover:border-pink-500 block group"
                            >
                               
                                <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50 relative">
                                    {game.image ? (
                                        <img
                                            src={`/storage/${game.image}`}
                                            alt={game.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                </div>

                               
                                <div className="text-center">
                                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                                        {game.name}
                                    </h3>
                                    
                                    <p className="text-xs text-gray-500 font-medium">
                                        {game.description || 'Game Publisher'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>


                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-pink-500 text-2xl"> <Wifi>    </Wifi> </span>
                        <h2 className="text-2xl font-bold text-gray-800">Paket Internet(eSIM)</h2>
                    </div>

                    <Link 
                        href="/essim"
                        className="block group relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-100 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 pointer-events-none"></div>

                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5 w-full md:w-auto">
                                <div className="w-16 h-16 flex-shrink-0 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <Wifi></Wifi>
                                </div>
                        
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
                                        Beli eSIM
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
                                        Internet roaming murah. Langsung aktif, tanpa antri, tanpa ganti kartu fisik.
                                    </p>
                                </div>
                            </div>

                            <div className="w-full md:w-auto flex justify-end md:block">
                                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-500 text-white font-semibold rounded-xl shadow-lg group-hover:bg-pink-700 transition-all">
                                    Pesan Sekarang
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>

               
                <div id="games">
                    
                     <div className="flex items-center gap-2 mb-6 border-t pt-8">
                        <h2 className="text-xl font-bold text-gray-700">Semua Layanan</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {all_games.map(game => (
                             <Link
                                key={game.id}
                                href={`/order/${game.slug}`}
                                className="bg-white rounded-xl p-2 hover:bg-pink-100 hover:shadow border border-gray-100 transition-all hover:border-pink-500 "
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={`/storage/${game.image}`}
                                        alt={game.name}
                                        className="w-10 h-10 rounded-lg object-cover"
                                    />
                                    <h3 className="font-bold text-md text-gray-700 line-clamp-2">{game.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </UserLayout>
    );
}