import React, { useState } from 'react';
// FIX: The GroundingResult type is defined in `types.ts` and should be imported from there.
import { searchWithGrounding } from '../services/geminiService';
import { GroundingResult } from '../types';
import { MagnifyingGlassIcon } from './Icons';

const SearchGrounding: React.FC = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<GroundingResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!query) {
            setError('Please enter a query.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const searchResult = await searchWithGrounding(query);
            setResult(searchResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Simple markdown-like text renderer
    const renderText = (text: string) => {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = text.split(boldRegex);

        return parts.map((part, index) => {
            if (index % 2 === 1) {
                return <strong key={index}>{part}</strong>;
            }
            return part.split('\n').map((line, lineIndex) => (
                <React.Fragment key={`${index}-${lineIndex}`}>
                    {line}
                    {lineIndex < part.split('\n').length -1 && <br />}
                </React.Fragment>
            ));
        });
    };

    return (
        <div className="h-full max-w-4xl mx-auto flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3"><MagnifyingGlassIcon className="w-8 h-8 text-cyan-400" /> AI Search</h2>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
                    placeholder="Ask anything..."
                    className="flex-grow bg-black/20 border border-[var(--border-color)] rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-400"
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading || !query}
                    className="py-3 px-6 text-md font-bold rounded-lg transition-all duration-300 flex items-center justify-center glow-on-hover bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-500/20 disabled:bg-gray-700/50 disabled:from-gray-700 disabled:to-gray-700/80 disabled:cursor-not-allowed disabled:text-gray-400 disabled:shadow-none"
                >
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-white border-white/30 rounded-full animate-spin"></div> : 'Search'}
                </button>
            </div>
            
            <div className="flex-grow bg-black/20 border border-[var(--border-color)] rounded-xl p-6 overflow-y-auto">
                 {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                         <div className="w-10 h-10 border-4 border-t-cyan-500 border-white/30 rounded-full animate-spin"></div>
                         <p className="mt-4">Searching the web...</p>
                    </div>
                )}
                {error && !isLoading && <div className="text-center text-red-400 p-4">{error}</div>}
                {!result && !isLoading && !error && (
                    <div className="text-center text-gray-500 h-full flex flex-col justify-center items-center">
                        <MagnifyingGlassIcon className="w-24 h-24 mx-auto text-gray-700" />
                        <p className="mt-2 text-lg">Get up-to-date answers from the web.</p>
                    </div>
                )}
                {result && !isLoading && (
                    <div className="prose prose-invert max-w-none text-gray-200">
                        <div className="whitespace-pre-wrap">{renderText(result.text)}</div>
                        {result.sources && result.sources.length > 0 && (
                            <div className="mt-8">
                                <h4 className="font-semibold text-gray-300 border-t border-gray-600 pt-4">Sources</h4>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    {result.sources.map((source, index) => (
                                        <li key={index}>
                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm break-all">
                                                {source.title || source.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchGrounding;