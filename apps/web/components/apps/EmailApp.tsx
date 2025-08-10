"use client";

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Inbox, 
  Send, 
  File, 
  Trash, 
  AlertCircle, 
  Edit, 
  X, 
  RefreshCw,
  Star,
  StarOff,
  Reply,
  Mail
} from 'lucide-react';

// Base API URL – can be overridden at build/runtime with NEXT_PUBLIC_API_BASE
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

// Types for our email app
interface EmailFolder {
  id: string;
  name: string;
  system: boolean;
  unread_count: number;
}

interface EmailLabel {
  id: string;
  name: string;
  color: string;
}

interface EmailAttachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
}

interface Email {
  id: string;
  folder: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body_text: string;
  body_html: string | null;
  is_read: boolean;
  is_draft: boolean;
  is_starred: boolean;
  date: string;
  sent_at: string | null;
  received_at: string | null;
  attachments: EmailAttachment[];
  labels: EmailLabel[];
}

interface EmailListResponse {
  emails: Email[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface ComposeEmailData {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  save_as_draft: boolean;
}

// Email App Component
export default function EmailApp() {
  // State
  const [folders, setFolders] = useState<EmailFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>("Inbox");
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [composeOpen, setComposeOpen] = useState<boolean>(false);
  const [composeData, setComposeData] = useState<ComposeEmailData>({
    to: '',
    subject: '',
    body: '',
    save_as_draft: true
  });
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch folders on mount
  useEffect(() => {
    fetchFolders();
  }, []);

  // Fetch emails when folder changes
  useEffect(() => {
    fetchEmails();
  }, [currentFolder, page]);

  // Fetch folders
  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/email/folders`);
      if (!response.ok) throw new Error('Failed to fetch folders');
      
      const data = await response.json();
      setFolders(data.folders);
      setLoading(false);
    } catch (err) {
      setError('Error loading folders');
      setLoading(false);
      console.error(err);
    }
  };

  // Fetch emails for current folder
  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/email/messages?folder=${currentFolder}&page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch emails');
      
      const data: EmailListResponse = await response.json();
      setEmails(data.emails);
      setTotalPages(data.total_pages);
      setLoading(false);
    } catch (err) {
      setError('Error loading emails');
      setLoading(false);
      console.error(err);
    }
  };

  // Fetch a single email
  const fetchEmail = async (id: string) => {
    try {
      setEmailLoading(true);
      const response = await fetch(`${API_BASE}/api/email/${id}`);
      if (!response.ok) throw new Error('Failed to fetch email');
      
      const data: Email = await response.json();
      setSelectedEmail(data);
      setEmailLoading(false);
    } catch (err) {
      setError('Error loading email');
      setEmailLoading(false);
      console.error(err);
    }
  };

  // Handle folder click
  const handleFolderClick = (folderName: string) => {
    setCurrentFolder(folderName);
    setPage(1);
    setSelectedEmail(null);
  };

  // Handle email selection
  const handleEmailClick = (email: Email) => {
    if (email.id === selectedEmail?.id) {
      setSelectedEmail(null);
    } else {
      fetchEmail(email.id);
    }
  };

  // Handle compose form changes
  const handleComposeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setComposeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle compose form submission
  const handleComposeSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/email/compose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(composeData)
      });
      
      if (!response.ok) throw new Error('Failed to send email');
      
      // Close compose and refresh emails if we're in Drafts folder
      setComposeOpen(false);
      setComposeData({
        to: '',
        subject: '',
        body: '',
        save_as_draft: true
      });
      
      if (currentFolder === 'Drafts') {
        fetchEmails();
      }
    } catch (err) {
      setError('Error sending email');
      console.error(err);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEmails();
    setRefreshing(false);
  };

  // Render folder icon based on name
  const renderFolderIcon = (name: string) => {
    switch (name) {
      case 'Inbox':
        return <Inbox className="w-4 h-4 mr-2" />;
      case 'Sent':
        return <Send className="w-4 h-4 mr-2" />;
      case 'Drafts':
        return <File className="w-4 h-4 mr-2" />;
      case 'Trash':
        return <Trash className="w-4 h-4 mr-2" />;
      case 'Spam':
        return <AlertCircle className="w-4 h-4 mr-2" />;
      default:
        return <Mail className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-md rounded-lg overflow-hidden">
      {/* App Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/20">
        <h2 className="text-lg font-semibold text-white">Wind Mail</h2>
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
            <Edit className="w-4 h-4 mr-1" /> Compose
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-white/20 overflow-y-auto">
          <div className="p-2">
            <h3 className="text-xs uppercase text-white/70 font-semibold px-2 py-1">Folders</h3>
            <ul>
              {folders.map(folder => (
                <li key={folder.id}>
                  <button
                    onClick={() => handleFolderClick(folder.name)}
                    className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md text-sm ${
                      currentFolder === folder.name 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center">
                      {renderFolderIcon(folder.name)}
                      {folder.name}
                    </div>
                    {folder.unread_count > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {folder.unread_count}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Email List */}
        <div className={`${selectedEmail ? 'w-1/3' : 'flex-1'} border-r border-white/20 overflow-y-auto`}>
          <div className="p-2">
            <h3 className="text-sm font-semibold text-white/90 px-2 py-1 border-b border-white/10 mb-2">
              {currentFolder} {loading && <span className="text-xs text-white/50">(Loading...)</span>}
            </h3>
            
            {error && (
              <div className="m-2 p-2 bg-red-500/20 text-red-200 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {!loading && emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-white/50">
                <Mail className="w-8 h-8 mb-2" />
                <p>No emails in this folder</p>
              </div>
            ) : (
              <ul>
                {emails.map(email => (
                  <li key={email.id}>
                    <button
                      onClick={() => handleEmailClick(email)}
                      className={`flex flex-col w-full px-3 py-2 border-b border-white/10 text-left ${
                        selectedEmail?.id === email.id 
                          ? 'bg-white/20' 
                          : email.is_read ? 'text-white/70' : 'text-white font-medium'
                      } hover:bg-white/10`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm truncate max-w-[70%]">
                          {currentFolder === 'Sent' ? `To: ${email.to.join(', ')}` : email.from}
                        </span>
                        <span className="text-xs text-white/50">{email.date}</span>
                      </div>
                      <div className="text-sm font-medium truncate mt-1">{email.subject}</div>
                      <div className="text-xs text-white/60 truncate mt-1">{email.body_text.substring(0, 100)}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-2 mt-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-2 py-1 text-xs rounded ${
                    page === 1 ? 'text-white/30' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  Previous
                </button>
                <span className="text-xs text-white/70">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-2 py-1 text-xs rounded ${
                    page === totalPages ? 'text-white/30' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Email Preview */}
        {selectedEmail && (
          <div className="flex-1 overflow-y-auto">
            {emailLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-white">{selectedEmail.subject}</h2>
                  <button 
                    onClick={() => setSelectedEmail(null)}
                    className="p-1 rounded-full hover:bg-white/10"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="text-sm text-white/80">
                        <span className="font-semibold">From: </span>
                        {selectedEmail.from}
                      </div>
                      <div className="text-sm text-white/80">
                        <span className="font-semibold">To: </span>
                        {selectedEmail.to.join(', ')}
                      </div>
                      {selectedEmail.cc.length > 0 && (
                        <div className="text-sm text-white/80">
                          <span className="font-semibold">Cc: </span>
                          {selectedEmail.cc.join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-white/60">
                      {selectedEmail.sent_at ? new Date(selectedEmail.sent_at).toLocaleString() : selectedEmail.date}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-2">
                    <button className="flex items-center px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs">
                      <Reply className="w-3 h-3 mr-1" /> Reply
                    </button>
                    <button className="flex items-center px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs">
                      {selectedEmail.is_starred ? (
                        <><StarOff className="w-3 h-3 mr-1" /> Unstar</>
                      ) : (
                        <><Star className="w-3 h-3 mr-1" /> Star</>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="text-white/90 whitespace-pre-wrap">
                  {selectedEmail.body_html ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} />
                  ) : (
                    selectedEmail.body_text
                  )}
                </div>
                
                {selectedEmail.attachments.length > 0 && (
                  <div className="mt-4 border-t border-white/10 pt-3">
                    <h3 className="text-sm font-semibold text-white/80 mb-2">Attachments</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmail.attachments.map(attachment => (
                        <div 
                          key={attachment.id} 
                          className="flex items-center bg-white/10 rounded p-2 text-sm text-white/80"
                        >
                          <File className="w-4 h-4 mr-2" />
                          {attachment.filename}
                          <span className="text-xs text-white/50 ml-2">
                            ({Math.round(attachment.size / 1024)}KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Compose Email Modal */}
      {composeOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-lg w-full max-w-2xl rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">Compose Email</h3>
              <button 
                onClick={() => setComposeOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleComposeSend} className="p-4">
              <div className="mb-4">
                <label className="block text-white/80 text-sm font-medium mb-1">To</label>
                <input
                  type="text"
                  name="to"
                  value={composeData.to}
                  onChange={handleComposeChange}
                  className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder-white/40"
                  placeholder="recipient@example.com"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-white/80 text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={composeData.subject}
                  onChange={handleComposeChange}
                  className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder-white/40"
                  placeholder="Email subject"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-white/80 text-sm font-medium mb-1">Message</label>
                <textarea
                  name="body"
                  value={composeData.body}
                  onChange={handleComposeChange}
                  rows={8}
                  className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder-white/40"
                  placeholder="Write your message here..."
                  required
                />
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
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  Save as Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
