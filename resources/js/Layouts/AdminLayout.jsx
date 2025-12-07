import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, X, User } from 'lucide-react';

export default function AdminLayout({ children, auth }) {

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        
                   
                        <div className="flex">
                       
                            <div className="shrink-0 flex items-center">
                                <Link href="/admin/dashboard" className="flex items-center gap-2 text-xl font-bold text-gray-800">
                                  
                                    <span className="hidden md:block">Admin Panel</span>
                                </Link>
                            </div>

                   
                            <div className="hidden sm:-my-px sm:ml-10 sm:flex sm:space-x-8">
                                <NavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>
                                    Dashboard
                                </NavLink>
                                <NavLink href={route('admin.games.index')} active={route().current('admin.games.*')}>
                                    Games
                                </NavLink>
                                <NavLink href={route('admin.items.index')} active={route().current('admin.items.*')}>
                                    Items
                                </NavLink>
                            </div>
                        </div>

    
                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600">{auth.user.name}</span>
                                <Link 
                                    href={route('logout')} 
                                    method="post" 
                                    as="button" 
                                    className="bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-100 transition"
                                >
                                    Logout
                                </Link>
                            </div>
                        </div>

                  
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition duration-150 ease-in-out"
                            >
                                {showingNavigationDropdown ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

   
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden bg-white border-t border-gray-100'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.games.index')} active={route().current('admin.games.*')}>
                            Manage Games
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.items.index')} active={route().current('admin.items.*')}>
                            Manage Items
                        </ResponsiveNavLink>
                    </div>

                    
                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="px-4 flex items-center gap-3 mb-3">
                         
                            <div>
                                <div className="font-medium text-base text-gray-800">{auth.user.name}</div>
                                <div className="font-medium text-sm text-gray-500">{auth.user.email}</div>
                            </div>
                        </div>
                        <div className="px-4 flex items-center gap-3 mb-3">
                            
                            <ResponsiveNavLink method="post" href={route('logout')} as="button" className="text-white bg-red-600 hover:bg-red-800 hover:focus:bg-red-800 text-sm p-1 rounded-2xl pl-3 pr-3">
                                Log Out
                            </ResponsiveNavLink>
                            
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}


function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${
                active
                    ? 'border-blue-500 text-gray-900 focus:outline-none focus:border-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300'
            }`}
        >
            {children}
        </Link>
    );
}

function ResponsiveNavLink({ href, active, children, ...props }) {
    return (
        <Link
            href={href}
            className={`w-full flex items-start pl-3 pr-4 py-2 border-l-4 text-base font-medium transition duration-150 ease-in-out ${
                active
                    ? 'border-blue-400 text-blue-700 bg-blue-50 focus:outline-none focus:text-blue-800 focus:bg-blue-100 focus:border-blue-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300'
            }`}
            {...props}
        >
            {children}
        </Link>
    );
}