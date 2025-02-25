import React, { useState } from 'react';
import { loginUser } from './firebase';
const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        if (username && password) {
            if (await loginUser(username, password)) {
                window.location.href = '/GBPS-Calendar/upload'
            } else {
                setError('Invalid username or password');
            }
        } else {
            setError('Please enter both username and password');
        }
        setIsLoading(false);
    };
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-4 text-white">
                        <h2 className="text-xl font-bold text-center">Login</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter your password"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full rounded-lg py-3 px-4 text-white font-medium transition-all duration-300
                  ${isLoading
                                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-md hover:from-purple-700 hover:to-pink-600'
                                    }
                `}
                            >
                                <div className="flex items-center justify-center">
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            Logging in...
                                        </>
                                    ) : (
                                        'Login'
                                    )}
                                </div>
                            </button>
                        </form>
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LoginPage;