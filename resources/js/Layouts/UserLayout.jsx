import { Link } from '@inertiajs/react';
import {Heart, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const paymentLogos = [
        { name: 'QRIS (All E-Wallet)', src: '/storage/images/qris.jpg'},
        { name: 'BCA Virtual Account', src: '/storage/images/bca.jpg' },
        { name: 'BNI Virtual Account', src: '/storage/images/bni.jpg' },
        { name: 'BRI Virtual Account', src: '/storage/images/bri.jpg' },
        { name: 'Alfamart',src: '/storage/images/alfa.jpg' },
        { name: 'Indomaret',src: '/storage/images/indo.jpg' },
    ];

export default function UserLayout({ children, auth }) {

  const socialClass = "w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-pink-500/30";

    return (
        <div className="min-h-screen bg-white">
          
            <nav className=" bg-white/70 backdrop-blur-md  sticky top-0 z-50 border-b border-gray-200">
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

 
           <footer className="bg-gradient-to-t from-black to-gray-900 border-t border-gray-800 text-white pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
      
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-pink-500">
              TopUpGame
            </h3>
            <p className="text-gray-500 text-sm font-medium">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="#" className={socialClass}>
              <Instagram className="w-5 h-5" />
            </Link>
            
            <Link href="#" className={socialClass}>
              <Facebook className="w-5 h-5" />
            </Link>
            
            <Link href="#" className={socialClass}>
         
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            </Link>
            
            <Link href="#" className={socialClass}>
 
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path></svg>
            </Link>
            
            <Link href="#" className={socialClass}>
              <Youtube className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 flex justify-center items-center text-xs text-gray-600 gap-1">
          <span>Made with</span>
          <Heart className="w-3 h-3 text-red-600 fill-red-600 animate-pulse" />
          <span>in Indonesia</span>
        </div>

      </div>
    </footer>
        </div>
    );
    }
