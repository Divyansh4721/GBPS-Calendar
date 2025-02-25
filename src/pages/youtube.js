import React, { useState, useEffect, useRef } from 'react';
import InputJSON from './youtube.json';
import Header from '../components/header';
import { Search, Play, FrownIcon } from 'lucide-react';
const YouTubeGallery = () => {
    const [allVideos, setAllVideos] = useState([]);
    const [displayedVideos, setDisplayedVideos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef(null);
    const VIDEOS_PER_PAGE = 16;
    useEffect(() => {
        setAllVideos(InputJSON);
    }, []);
    useEffect(() => {
        setDisplayedVideos([]);
        setPage(1);
        setHasMore(true);
    }, [searchTerm]);
    useEffect(() => {
        const filteredVideos = allVideos.filter(video =>
            video.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const startIndex = 0;
        const endIndex = page * VIDEOS_PER_PAGE;
        const paginatedVideos = filteredVideos.slice(startIndex, endIndex);
        setDisplayedVideos(paginatedVideos);
        setHasMore(endIndex < filteredVideos.length);
    }, [searchTerm, allVideos, page]);
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMoreVideos();
                }
            },
            { threshold: 0.5, rootMargin: '100px' }
        );
        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }
        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, displayedVideos.length]);
    const loadMoreVideos = () => {
        if (loading) return;
        setLoading(true);
        console.log("Loading more videos, page:", page + 1);
        setTimeout(() => {
            setPage(prevPage => prevPage + 1);
            setLoading(false);
        }, 200);
    };
    const handleVideoClick = (videoId) => {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    };
    const totalFilteredCount = allVideos.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).length;
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            <Header />
            <div className="container mx-auto px-4 py-4">
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search videos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-5 pr-12 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
                        />
                        <div className="absolute right-0 top-0 h-full flex items-center pr-4">
                            <Search className="h-5 w-5 text-gray-500" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center mb-6">
                    {searchTerm && <div className="text-gray-600 font-medium text-sm sm:text-base">Found {totalFilteredCount} results for "{searchTerm}"</div>}
                </div>
            </div>
            <div className="container mx-auto px-4 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {displayedVideos.map((video) => (
                        <div
                            key={video.videoId}
                            className="cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                            onClick={() => handleVideoClick(video.videoId)}
                        >
                            <div className="relative">
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-auto object-cover"
                                    style={{ aspectRatio: '16/9' }}
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                        <Play className="w-6 h-6 text-white" fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 sm:p-4">
                                <h3 className="text-sm sm:text-lg font-semibold line-clamp-2 text-gray-800">{video.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
                {displayedVideos.length === 0 && !loading && (
                    <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-md">
                        <FrownIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                        <h3 className="mt-4 text-lg sm:text-xl font-medium text-gray-800">No videos found</h3>
                        <p className="mt-2 text-sm sm:text-base text-gray-500">Try adjusting your search terms.</p>
                    </div>
                )}
                <div ref={observerTarget} className="flex justify-center items-center py-6 sm:py-8 mt-4">
                    {loading && (
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    )}
                    {!hasMore && displayedVideos.length > 0 && (
                        <div className="text-sm text-gray-500">No more videos to load</div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default YouTubeGallery;