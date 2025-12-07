import UserLayout from '@/Layouts/UserLayout';
import { Head, useForm } from '@inertiajs/react';

export default function EsimOrder({ auth, packageCode, package: pkg }) {
    const { data, setData, post, errors, processing } = useForm({
        package_code: packageCode,
        email: auth.user?.email || '',
        quantity: 1,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/essim/order/process');
    };

    const totalPrice = pkg ? (pkg.price * data.quantity) : 0;

    return (
        <UserLayout auth={auth}>
            <Head title="Order eSIM" />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold mb-8">Order eSIM Package</h1>

                {pkg && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="font-bold text-lg mb-2">{pkg.packageName}</h3>
                        <p className="text-gray-600">{pkg.area}</p>
                        <div className="mt-4 flex justify-between">
                            <span className="text-gray-600">Data:</span>
                            <span className="font-bold">{pkg.flow} GB / {pkg.day} days</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-gray-600">Price per item:</span>
                            <span className="font-bold text-pink-600">${pkg.price}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full border rounded-lg px-4 py-3"
                            required
                        />
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Quantity *</label>
                        <input
                            type="number"
                            value={data.quantity}
                            onChange={e => setData('quantity', e.target.value)}
                            min="1"
                            max="5"
                            className="w-full border rounded-lg px-4 py-3"
                            required
                        />
                        {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
                    </div>

                    {totalPrice > 0 && (
                        <div className="bg-pink-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Total:</span>
                                <span className="text-2xl font-bold text-pink-600">${totalPrice}</span>
                            </div>
                        </div>
                    )}

                    {errors.error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{errors.error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-lg font-bold hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
                    >
                        {processing ? 'Processing...' : 'Continue to Payment'}
                    </button>
                </form>
            </div>
        </UserLayout>
    );
}