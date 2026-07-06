import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';
import { BACKEND_URL } from '../config/api';

const ForumList = () => {
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const API_URL = BACKEND_URL;

    const [newPost, setNewPost] = useState({ content: '', tags: '' });

    useEffect(() => {
        fetchForums();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const fetchForums = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;

            const response = await axios.get(`${API_URL}/api/forums`, { params });
            setForums(response.data.forums || []);
        } catch (error) {
            console.error('Error fetching forums:', error);
            toast.error('Failed to load forums');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        
        if (!token) {
            toast.error('Please login to create a post');
            return;
        }

        try {
            const tagsArray = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            
            const response = await axios.post(
                `${API_URL}/api/forums`,
                {
                    content: newPost.content,
                    tags: tagsArray
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Forum post created successfully!');
                setShowCreateModal(false);
                setNewPost({ content: '', tags: '' });
                fetchForums();
            }
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error(error.response?.data?.message || 'Failed to create post');
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const postDate = new Date(date);
        const diffMs = now - postDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return postDate.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#1A1815]">
            <div className="flex min-h-screen">
                <main className="flex-1">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-[#F4F1EA]/80 dark:bg-[#1A1815]/80 backdrop-blur-md border-b border-[#E6E0D4] dark:border-[#3a362f]">
                        <div className="px-4 py-4 md:px-6 md:py-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl sm:text-3xl font-bold text-[#3D3929] dark:text-[#F4F1EA]">
                                    Forum
                                </h1>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold transition-colors duration-200"
                                >
                                    Post
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="mt-3 max-w-md">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#a89d89]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Forums List - Enhanced Cards */}
                    <div className="px-4 py-4 md:px-6 md:py-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loading />
                            </div>
                        ) : forums.length === 0 ? (
                            <div className="text-center py-20 px-4">
                                <div className="max-w-sm mx-auto">
                                    <svg className="w-16 h-16 mx-auto text-[#a89d89] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <h3 className="text-xl font-bold text-[#3D3929] dark:text-[#F4F1EA] mb-2">
                                        No posts yet
                                    </h3>
                                    <p className="text-[#83786a] dark:text-[#c2b8a3] mb-6">
                                        {searchQuery
                                            ? 'Try adjusting your search'
                                            : 'Be the first to start a discussion'}
                                    </p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full px-6 py-2.5 font-semibold transition-colors"
                                    >
                                        Create Post
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                                {forums.map((forum) => (
                                    <div
                                        key={forum._id}
                                        role="link"
                                        tabIndex={0}
                                        onClick={() => navigate(`/forums/${forum._id}`)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                navigate(`/forums/${forum._id}`);
                                            }
                                        }}
                                        className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl hover:border-[#2563EB] dark:hover:border-[#2563EB] transition-all duration-200 cursor-pointer"
                                    >
                                        <div className="px-4 py-3 sm:p-5">
                                            {/* Twitter-style Post Layout */}
                                            <div className="flex gap-3">
                                                {/* Avatar */}
                                                <Link
                                                    to={user?._id === forum.author._id ? '/profile' : `/user/${forum.author._id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                                >
                                                    {forum.author.profileImage ? (
                                                        <img
                                                            src={forum.author.profileImage}
                                                            alt={forum.author.name}
                                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-full flex items-center justify-center text-white text-base font-bold">
                                                            {forum.author.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Author Info & Time */}
                                                    <div className="flex items-center gap-1 mb-0.5">
                                                        <Link
                                                            to={user?._id === forum.author._id ? '/profile' : `/user/${forum.author._id}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="font-bold text-sm sm:text-base text-[#3D3929] dark:text-[#F4F1EA] hover:underline truncate"
                                                        >
                                                            {forum.author.name}
                                                        </Link>
                                                        <span className="text-[#83786a] dark:text-[#c2b8a3] text-sm">·</span>
                                                        <span className="text-[#83786a] dark:text-[#c2b8a3] text-sm">
                                                            {formatTime(forum.createdAt)}
                                                        </span>
                                                        {forum.isPinned && (
                                                            <span className="ml-auto">📌</span>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <p className="text-sm sm:text-base text-[#3D3929] dark:text-[#F4F1EA] mb-2 line-clamp-4 leading-relaxed break-words whitespace-pre-wrap">
                                                        {forum.content}
                                                    </p>

                                                    {/* Tags */}
                                                    {forum.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                                            {forum.tags.slice(0, 3).map((tag, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="text-xs text-[#2563EB] dark:text-[#93C5FD] hover:underline"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Engagement Stats - Twitter Style */}
                                                    <div className="flex items-center gap-6 text-[#83786a] dark:text-[#c2b8a3] text-sm">
                                                        <div className="flex items-center gap-2 hover:text-[#2563EB] transition-colors group">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                            </svg>
                                                            <span className="font-medium">{forum.replies.length}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 hover:text-red-600 transition-colors group">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                            <span className="font-medium">{forum.likes.length}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            <span className="font-medium">{forum.views}</span>
                                                        </div>
                                                        {forum.isSolved && (
                                                            <div className="ml-auto">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Solved
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Twitter-style Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 pt-12">
                    <div className="bg-white dark:bg-[#262421] rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Simple Header */}
                        <div className="sticky top-0 bg-white dark:bg-[#262421] px-4 py-3 border-b border-[#E6E0D4] dark:border-[#3a362f] flex items-center justify-between">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-[#3D3929] dark:text-[#c2b8a3] hover:bg-[#F4F1EA] dark:hover:bg-[#1A1815] p-2 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <button
                                type="submit"
                                form="create-post-form"
                                className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#93C5FD] text-white rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
                                disabled={!newPost.content}
                            >
                                Post
                            </button>
                        </div>

                        <form id="create-post-form" onSubmit={handleCreatePost} className="p-4">
                            {/* Content Areas - Minimal Styling */}
                            <div className="space-y-3">
                                <textarea
                                    required
                                    rows={8}
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    className="w-full border-0 text-lg text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] focus:outline-none resize-none bg-transparent"
                                    placeholder="What's on your mind?"
                                    maxLength={5000}
                                />

                                {/* Tags Row */}
                                <div className="flex gap-2 pt-3 border-t border-[#E6E0D4] dark:border-[#3a362f]">
                                    <input
                                        type="text"
                                        value={newPost.tags}
                                        onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                                        className="flex-1 border border-[#E6E0D4] dark:border-[#3a362f] rounded-full px-4 py-2 text-sm text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-transparent"
                                        placeholder="Tags (comma-separated)"
                                    />
                                </div>

                                {/* Character Count */}
                                <div className="text-xs text-[#83786a] dark:text-[#c2b8a3] pt-2 text-right">
                                    <span>{newPost.content.length}/5000</span>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForumList;