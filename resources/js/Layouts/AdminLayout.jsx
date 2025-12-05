import { Link } from '@inertiajs/react';

export default function AdminLayout({ children, auth }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link href="/admin/dashboard" className="flex items-center px-2 text-xl font-bold">
                                Admin Panel
                            </Link>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link href="/admin/dashboard" className="inline-flex items-center px-1 pt-1 text-gray-900">
                                    Dashboard
                                </Link>
                                <Link href="/admin/games" className="inline-flex items-center px-1 pt-1 text-gray-900">
                                    Games
                                </Link>
                                <Link href="/admin/items" className="inline-flex items-center px-1 pt-1 text-gray-900">
                                    Items
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4">{auth.user.name}</span>
                            <Link href="/logout" method="post" as="button" className="text-red-600">
                                Logout
                            </Link>
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