import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default function UserLayout({ children, auth }) {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className=" bg-white/70 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/" className="text-2xl font-bold text-pink-600">
                                TopUpGame
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {auth.user ? (
                                <>
                                    <span className="text-gray-700">{auth.user.name}</span>
                                    {auth.user.role === 'admin' && (
                                        <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
                                            Admin Panel
                                        </Link>
                                    )}
                                    <Link href="/logout" method="post" as="button" className="text-red-600 hover:text-red-800">
                                        Logout
                                    </Link>
                                </>
                            ) : (
                                <>

                                <Link href="/essim" className="text-gray-700 hover:text-pink-500">
                                        eSIM
                                    </Link>
                                
                                    <Link href="/cek-transaksi" className="text-gray-700 hover:text-pink-500">
                                        Cek Transaksi
                                    </Link>

                                    
                                    
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

  
            <main>
                {children}
            </main>

 
            <footer className="bg-gray-900 border-t text-white pt-12 pb-8 mt-auto">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center mb-8">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                        Metode Pembayaran
                      </h3>
                      
                      
                    </div>
            
                 
                    <div className="border-t border-gray-800 my-8 w-1/2 mx-auto"></div>
            
                 
                    <div className="flex flex-col items-center gap-6">
                      
                      
                      <div className="flex gap-4">
                        <Link href="#" className=" p-2 rounded-lg hover:scale-110 transition">
                          <Instagram className="w-5 h-5 text-white" />
                        </Link>
                        <Link href="#" className=" p-2 rounded-lg hover:scale-110 transition">
                          <Facebook className="w-5 h-5 text-white" />
                        </Link>
                        <Link href="#" className=" p-2 rounded-lg hover:scale-110 transition">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                        </Link>
                        <Link href="#" className=" p-2 rounded-lg hover:scale-110 transition">
                           <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path></svg>
                        </Link>
                        <Link href="#" className=" p-2 rounded-lg hover:scale-110 transition">
                           <Youtube className="w-5 h-5 text-white"/>
                        </Link>
                      </div>
            
                     
                      <p className="text-gray-500 text-sm">
                        &copy; 2025 JokiTugas Topup. All rights reserved.
                      </p>
                    </div>
            
                  </div>
                </footer>
        </div>
    );
}