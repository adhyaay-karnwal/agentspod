"use client";

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Calendar, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram,
  RefreshCw,
  Clock,
  Share,
  ThumbsUp,
  MessageSquare,
  Repeat
} from 'lucide-react';

// Base API URL – can be overridden at build/runtime with NEXT_PUBLIC_API_BASE
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

// Types for our social app
interface SocialPost {
  id: string;
  platform: string;
  content: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
}

interface SocialPostsResponse {
  posts: SocialPost[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Social App Component
export default function SocialApp() {
  // State
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [composeOpen, setComposeOpen] = useState<boolean>(false);
  const [composeData, setComposeData] = useState({
    platform: 'twitter',
    content: '',
    schedule: false,
    scheduled_at: ''
  });
  
  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use a placeholder response
      // In a real implementation, we would fetch from API_BASE/api/social/posts
      // or use the agent chat endpoint with social.list tool
      
      setTimeout(() => {
        const mockPosts: SocialPost[] = [
          {
            id: '1',
            platform: 'twitter',
            content: 'Just launched our new AI-powered Wind OS! Check it out at wind.ai #AI #ProductLaunch',
            status: 'published',
            scheduled_at: null,
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            platform: 'linkedin',
            content: 'Excited to announce that Wind OS is now available for enterprise customers. Our AI-first operating system is designed to be your cloud employee that can interact with real applications.',
            status: 'published',
            scheduled_at: null,
            published_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            platform: 'twitter',
            content: 'Join our webinar next week to see how Wind OS can transform your workflow!',
            status: 'scheduled',
            scheduled_at: new Date(Date.now() + 172800000).toISOString(), // Two days from now
            published_at: null,
            created_at: new Date().toISOString()
          }
        ];
        
        setPosts(mockPosts);
        setLoading(false);
      }, 1000); // Simulate network delay
      
    } catch (err) {
      setError('Error loading posts');
      setLoading(false);
      console.error(err);
    }
  };

  // Handle compose form changes
  const handleComposeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setComposeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setComposeData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Handle compose form submission
  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // In a real implementation, we would post to API_BASE/api/social/post
      // or use the agent chat endpoint with social.post or social.schedule tool
      
      console.log('Submitting post:', composeData);
      
      // Simulate API call
      setTimeout(() => {
        // Add the new post to the list
        const newPost: SocialPost = {
          id: Date.now().toString(),
          platform: composeData.platform,
          content: composeData.content,
          status: composeData.schedule ? 'scheduled' : 'published',
          scheduled_at: composeData.schedule ? composeData.scheduled_at : null,
          published_at: composeData.schedule ? null : new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        setPosts(prev => [newPost, ...prev]);
        setComposeOpen(false);
        setComposeData({
          platform: 'twitter',
          content: '',
          schedule: false,
          scheduled_at: ''
        });
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('Error posting content');
      setLoading(false);
      console.error(err);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      default:
        return <Share className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-md rounded-lg overflow-hidden">
      {/* App Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/20">
        <h2 className="text-lg font-semibold text-white">Wind Social</h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            className="p-1 rounded-full hover:bg-white/10"
            disabled={refreshing}
          >
            <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setComposeOpen(true)}
            className="flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-full text-white text-sm"
          >
            <Send className="w-4 h-4 mr-1" /> Compose
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Error message */}
        {error && (
          <div className="m-3 p-2 bg-red-500/20 text-red-200 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {/* Loading state */}
        {loading && !posts.length && (
          <div className="flex flex-col items-center justify-center h-40 text-white/50">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            <p className="mt-2">Loading posts...</p>
          </div>
        )}
        
        {/* Empty state */}
        {!loading && !posts.length && (
          <div className="flex flex-col items-center justify-center h-40 text-white/50">
            <Share className="w-8 h-8 mb-2" />
            <p>No posts yet</p>
            <button 
              onClick={() => setComposeOpen(true)}
              className="mt-3 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm"
            >
              Create your first post
            </button>
          </div>
        )}
        
        {/* Posts list */}
        <div className="p-3 space-y-3">
          {posts.map(post => (
            <div 
              key={post.id} 
              className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white mr-2">
                    {getPlatformIcon(post.platform)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                    </div>
                    <div className="text-xs text-white/60 flex items-center">
                      {post.status === 'published' ? (
                        <>
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                          Published {formatDate(post.published_at)}
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Scheduled for {formatDate(post.scheduled_at)}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-white/90 mb-3 whitespace-pre-wrap">
                {post.content}
              </div>
              
              <div className="flex space-x-3 text-white/60 text-xs">
                <button className="flex items-center hover:text-white">
                  <ThumbsUp className="w-3 h-3 mr-1" /> Like
                </button>
                <button className="flex items-center hover:text-white">
                  <MessageSquare className="w-3 h-3 mr-1" /> Comment
                </button>
                <button className="flex items-center hover:text-white">
                  <Repeat className="w-3 h-3 mr-1" /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Compose Modal */}
      {composeOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-lg w-full max-w-xl rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">Compose Post</h3>
              <button 
                onClick={() => setComposeOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleComposeSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-white/80 text-sm font-medium mb-1">Platform</label>
                <select
                  name="platform"
                  value={composeData.platform}
                  onChange={handleComposeChange}
                  className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
                >
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-white/80 text-sm font-medium mb-1">Content</label>
                <textarea
                  name="content"
                  value={composeData.content}
                  onChange={handleComposeChange}
                  rows={5}
                  className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder-white/40"
                  placeholder="What's on your mind?"
                  required
                />
                <div className="text-right text-xs text-white/50 mt-1">
                  {composeData.content.length} characters
                  {composeData.platform === 'twitter' && (
                    <span> / 280</span>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center text-white/80 text-sm">
                  <input
                    type="checkbox"
                    name="schedule"
                    checked={composeData.schedule}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  Schedule for later
                </label>
                
                {composeData.schedule && (
                  <div className="mt-2">
                    <input
                      type="datetime-local"
                      name="scheduled_at"
                      value={composeData.scheduled_at}
                      onChange={handleComposeChange}
                      className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
                      required={composeData.schedule}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setComposeOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  {composeData.schedule ? (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
