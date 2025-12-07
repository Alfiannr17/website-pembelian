import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-white pt-6 pr-4 pl-4 sm:justify-center sm:pt-0">
            
            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-sm sm:max-w-md border border-gray-200 rounded-2xl">
                {children}
            </div>
        </div>
    );
}
