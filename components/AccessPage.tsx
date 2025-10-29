import React, { useState } from 'react';
import { CubeTransparentIcon } from './Icons';

interface AccessPageProps {
    onSuccess: () => void;
}

const AccessPage: React.FC<AccessPageProps> = ({ onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const correctPassword = '4933394';

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Simulate a small delay for better UX
        setTimeout(() => {
            if (password === correctPassword) {
                onSuccess();
            } else {
                setError('Incorrect password. Please try again.');
                setPassword('');
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0d061c] p-4">
            <div className="w-full max-w-md bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl shadow-cyan-500/10 p-8 text-center">
                <div className="flex justify-center items-center gap-3 mb-4">
                    <CubeTransparentIcon className="w-10 h-10 text-cyan-400" />
                    <h1 className="text-2xl font-bold text-white">SAID Designs Studio</h1>
                </div>
                <h2 className="text-lg text-gray-300 mb-6">Access Required</h2>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="password-input" className="sr-only">Password</label>
                        <input
                            id="password-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter access code"
                            autoFocus
                            className="w-full bg-black/20 border border-[var(--border-color)] rounded-lg p-3 text-white text-center text-lg tracking-widest focus:ring-2 focus:ring-cyan-400"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm animate-shake">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        className={`w-full py-3 px-4 text-lg font-bold rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] glow-on-hover ${
                            isLoading || !password
                            ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-500/20'
                        }`}
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-t-white border-white/30 rounded-full animate-spin"></div>
                        ) : (
                            'Enter Studio'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AccessPage;
