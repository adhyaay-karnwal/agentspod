'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useWorkspaceStore } from '@/app/home/stores/workspaceStore';
import { trackPageView, trackButtonClick } from '@/lib/analytics';

// Workspace type definition
interface Workspace {
  id: string;
  name: string;
  lastAccessed: Date;
  previewImage?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  // Framer-motion easing tuples (typed as readonly to satisfy variants)
  const easeStandard = [0.25, 0.1, 0.25, 1] as const;
  const easeBounce   = [0.34, 1.56, 0.64, 1] as const;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeStandard
      }
    },
    hover: {
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3,
        ease: easeBounce
      }
    }
  };

  // Wind logo component
  const WindLogo = () => (
    <svg 
      width="128" 
      height="63" 
      viewBox="0 0 128 63" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-5"
    >
      <path d="M0 6.78516C6.20895 -0.764753 25.5426 -2.38267 32.5967 6.78516C39.6467 15.9478 65.508 55.274 65.5391 55.3213C52.2588 65.0286 39.8403 65.388 31.2168 53.3438C22.6091 41.3215 0.0836674 6.91297 0 6.78516Z" fill="currentColor"/>
      <path d="M45.2217 6.78516C51.4306 -0.764754 70.7643 -2.38267 77.8184 6.78516C84.8644 15.9426 110.702 55.2313 110.761 55.3213C97.4805 65.0286 85.063 65.388 76.4395 53.3438C67.8292 41.318 45.291 6.89112 45.2217 6.78516Z" fill="currentColor"/>
      <path d="M113.154 0.500977C121.276 0.501108 128 7.08523 128 15.207C128 23.3288 121.276 29.913 113.154 29.9131C105.032 29.9131 98.3086 23.3289 98.3086 15.207C98.3086 7.08515 105.032 0.500977 113.154 0.500977Z" fill="currentColor"/>
    </svg>
  );

  // Fetch workspaces on component mount
  useEffect(() => {
    trackPageView('dashboard_page');
    
    // Simulate fetching workspaces
    const fetchWorkspaces = async () => {
      try {
        // In a real implementation, you would fetch from an API
        // For now, we'll use mock data
        const mockWorkspaces: Workspace[] = [
          {
            id: '1',
            name: 'Development',
            lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000),
            previewImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop'
          },
          {
            id: '2',
            name: 'Design Project',
            lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            previewImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=450&fit=crop'
          },
          {
            id: '3',
            name: 'Client Work',
            lastAccessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        ];
        
        setWorkspaces(mockWorkspaces);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        setIsLoading(false);
      }
    };
    
    fetchWorkspaces();
  }, []);

  // Format date to relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Handle creating a new workspace
  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    setIsCreatingWorkspace(true);
    trackButtonClick('create_workspace', 'dashboard');
    
    try {
      // In a real implementation, you would call an API
      // For now, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new workspace object
      const newWorkspace: Workspace = {
        id: `new-${Date.now()}`,
        name: newWorkspaceName,
        lastAccessed: new Date(),
      };
      
      // Add to the list
      setWorkspaces([newWorkspace, ...workspaces]);
      
      // Close dialog and reset
      setShowCreateDialog(false);
      setNewWorkspaceName('');
      
      // Navigate to the new workspace
      router.push(`/home?workspace=${newWorkspace.id}`);
    } catch (error) {
      console.error('Error creating workspace:', error);
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  // Handle launching a workspace
  const handleLaunchWorkspace = (workspaceId: string) => {
    trackButtonClick('launch_workspace', 'dashboard');
    router.push(`/home?workspace=${workspaceId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#030303] text-black dark:text-white">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#050505] backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WindLogo />
            <span className="font-medium text-lg">Wind</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-12 layout-spacious">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Your Workspaces</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Launch an existing workspace or create a new one
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Create new workspace card */}
            <motion.div
              className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden h-64 flex flex-col items-center justify-center cursor-pointer"
              variants={itemVariants}
              whileHover="hover"
              onClick={() => setShowCreateDialog(true)}
            >
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Plus className="w-10 h-10 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Create New Workspace</h3>
            </motion.div>
            
            {/* Workspace cards */}
            {workspaces.map(workspace => (
              <motion.div
                key={workspace.id}
                className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden h-64 flex flex-col cursor-pointer"
                variants={itemVariants}
                whileHover="hover"
                onClick={() => handleLaunchWorkspace(workspace.id)}
              >
                <div className="h-40 bg-gray-100 dark:bg-gray-800 relative">
                  {workspace.previewImage ? (
                    <img 
                      src={workspace.previewImage} 
                      alt={workspace.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <WindLogo />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h3 className="text-lg font-medium">{workspace.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last accessed {formatRelativeTime(workspace.lastAccessed)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
      
      {/* Create workspace dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreatingWorkspace}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWorkspace}
              disabled={!newWorkspaceName.trim() || isCreatingWorkspace}
              className="ml-2"
            >
              {isCreatingWorkspace ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create & Launch'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
