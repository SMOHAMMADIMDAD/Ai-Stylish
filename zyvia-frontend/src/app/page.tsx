'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import {
  LayoutGrid,
  Loader2,
  Moon,
  Shirt,
  Sparkles,
  Sun,
  Wand2,
  LogIn,
  Frown,
  X,
  Heart,
} from 'lucide-react'
import * as auth from '@/lib/auth'

// --- Interfaces ---
interface ClothingItem {
  id: number;
  name: string;
  image: string;
  clothing_type: string;
  style: string;
  color_palette?: string[];
  primary_color?: string;
}

interface Outfit {
  base?: ClothingItem;
  top?: ClothingItem;
  bottom?: ClothingItem;
  shoes?: ClothingItem;
  outerwear?: ClothingItem;
  score?: number;
  visual_similarity?: number;
  explanation: string;
  tags: string[];
}

// --- WardrobeGrid ---
function WardrobeGrid({
  items,
  isLoading,
  error,
  onSelectItem,
  selectedItemId
}: {
  items: ClothingItem[],
  isLoading: boolean,
  error: string | null,
  onSelectItem: (id: number) => void,
  selectedItemId: number | null
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-semibold">Loading your wardrobe...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <Frown className="w-12 h-12 mb-4" />
        <p className="font-semibold">Could not load wardrobe</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Shirt className="w-12 h-12 mb-4" />
        <p className="font-semibold">Your wardrobe is empty</p>
        <p className="text-sm text-center">Click the '+' button to add your first item!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
        <h3 className="text-xl font-bold text-center mb-4 text-zinc-800 dark:text-zinc-200">Your Wardrobe</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto pr-2 -mr-2">
          {items.map((item) => (
            <motion.div
              key={item.id}
              className="relative aspect-square rounded-2xl overflow-hidden shadow-md cursor-pointer group"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelectItem(item.id)}
              animate={{
                scale: selectedItemId === item.id ? 1.05 : 1,
                boxShadow: selectedItemId === item.id
                  ? '0 0 0 4px #EC4899'
                  : '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-sm font-bold truncate">{item.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
    </div>
  )
}

// --- OutfitGenerator ---
function OutfitGenerator({
  baseItem,
  occasion, setOccasion,
  outfits, loading, error, onSubmit, onClearBaseItem
}: {
  baseItem: ClothingItem | null;
  occasion: string;
  setOccasion: (o: string) => void;
  outfits: Outfit[];
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onClearBaseItem: () => void;
}) {
  const getFullImageUrl = (url: string) =>
    url.startsWith('http') ? url : `http://localhost:8000${url}`;

  const renderItem = (item?: ClothingItem) => {
    if (!item) return null;
    return (
      <div key={item.id} className="text-center">
        <img src={getFullImageUrl(item.image)} alt={item.name} className="w-full h-32 object-contain rounded-lg bg-zinc-100 dark:bg-zinc-800"/>
        <div className="mt-2 text-sm font-semibold truncate text-zinc-700 dark:text-zinc-300">{item.name}</div>
        <div className="text-xs text-zinc-500 capitalize">{item.clothing_type}</div>
      </div>
    );
  };

  if (!baseItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500">
        <Shirt className="w-12 h-12 mb-4" />
        <p className="font-semibold">Select a Base Item</p>
        <p className="text-sm">Go to your 'Wardrobe' to pick an item to build an outfit around.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full text-left">
      <form onSubmit={onSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">Base Item</label>
          <div className="flex items-center gap-4 p-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800">
             <img src={getFullImageUrl(baseItem.image)} alt={baseItem.name} className="w-16 h-16 rounded-lg object-cover"/>
             <div className="flex-grow">
               <p className="font-bold text-zinc-800 dark:text-zinc-200">{baseItem.name}</p>
               <p className="text-xs text-zinc-500 capitalize">{baseItem.style} {baseItem.clothing_type}</p>
             </div>
             <button type="button" onClick={onClearBaseItem} className="p-1.5 rounded-full text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
               <X className="w-4 h-4" />
             </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Occasion</label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-2 w-full bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
          >
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="party">Party</option>
            <option value="work">Work</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Generate Outfit'}
        </button>
      </form>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="animate-pulse h-56 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
            ))}
          </div>
        ) : outfits.length > 0 ? (
          <div className="space-y-4">
            {outfits.map((outfit, i) => (
              <div key={i} className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 shadow-sm bg-white/50 dark:bg-zinc-800/50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                  {renderItem(outfit.base)}
                  {renderItem(outfit.top)}
                  {renderItem(outfit.bottom)}
                  {renderItem(outfit.shoes)}
                </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{outfit.explanation}</p>
                  <div className="flex flex-wrap gap-2">
                    {outfit.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
              </div>
            ))}
          </div>
        ) : (
          !error && <p className="text-center text-zinc-500 mt-8">Generated outfits will appear here.</p>
        )}
      </div>
    </div>
  );
}

// --- RecommendedOutfitDisplay ---
function RecommendedOutfitDisplay({ outfit, isLoading, error }: {
  outfit: Outfit | null,
  isLoading: boolean,
  error: string | null
}) {
  const getFullImageUrl = (url: string) =>
    url.startsWith('http') ? url : `http://localhost:8000${url}`;

  const renderItem = (item?: ClothingItem, label?: string) => {
    if (!item) return null;
    return (
      <div className="text-center">
        <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm group">
            <img src={getFullImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
        </div>
        <div className="mt-2 text-sm font-semibold truncate text-zinc-800 dark:text-zinc-200">{item.name}</div>
        <div className="text-xs text-zinc-500 capitalize">{label || item.clothing_type}</div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-semibold">Finding your Outfit of the Day...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-500">
        <Frown className="w-12 h-12 mb-4" />
        <p className="font-semibold">Could not get your outfit</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }
  
  if (!outfit) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500">
        <Sparkles className="w-12 h-12 mb-4" />
        <p className="font-semibold">No outfit available</p>
        <p className="text-sm">Add items to your wardrobe to get an Outfit of the Day!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
        <h3 className="text-xl font-bold text-center mb-4 text-zinc-800 dark:text-zinc-200">Outfit of the Day</h3>
        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 shadow-lg bg-white/30 dark:bg-zinc-900/30">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {renderItem(outfit.top, 'Top')}
                    {renderItem(outfit.bottom, 'Bottom')}
                    {renderItem(outfit.shoes, 'Shoes')}
                    {renderItem(outfit.outerwear, 'Outerwear')}
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">{outfit.explanation}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {outfit.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                    ))}
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white font-semibold bg-pink-500 hover:bg-pink-600 transition-colors">
                    <Heart className="w-4 h-4" />
                    Save Outfit
                </button>
            </div>
        </div>
    </div>
  )
}


// --- MAIN UI COMPONENT ---
const tabs = [
  { name: 'Wardrobe', icon: Shirt },
  { name: 'Recommended', icon: Sparkles },
  { name: 'Generate Outfit', icon: Wand2 },
]

export default function ZyviaProUI() {
  const [activeTab, setActiveTab] = useState(tabs[0].name)
  const [darkMode, setDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [isWardrobeLoading, setIsWardrobeLoading] = useState(false);
  const [wardrobeError, setWardrobeError] = useState<string | null>(null);

  const [baseItemId, setBaseItemId] = useState<number | null>(null);
  const [occasion, setOccasion] = useState('casual');
  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const [recommendedOutfit, setRecommendedOutfit] = useState<Outfit | null>(null);
  const [isRecsLoading, setIsRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState<string | null>(null);

  const fetchWardrobe = useCallback(async () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;
    setIsWardrobeLoading(true);
    setWardrobeError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/clothing/', {
        headers: { 'Authorization': `Bearer ${currentUser.accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch wardrobe items.');
      const data: ClothingItem[] = await res.json();
      setWardrobeItems(data);
    } catch (err) {
      setWardrobeError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsWardrobeLoading(false);
    }
  }, []);
  
  const fetchOutfitOfTheDay = useCallback(async () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;

    setIsRecsLoading(true);
    setRecsError(null);
    try {
        const res = await fetch('http://127.0.0.1:8000/api/clothing/outfit-of-the-day/', {
            headers: { 'Authorization': `Bearer ${currentUser.accessToken}` },
        });
        
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Failed to fetch the outfit.');
        }
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            setRecommendedOutfit(data as Outfit);
        } else {
            setRecommendedOutfit(null);
            setRecsError("Received an unexpected response from the server.");
        }

    } catch (err) {
        setRecsError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setRecommendedOutfit(null); 
    } finally {
        setIsRecsLoading(false);
    }
  }, []);

  const handleGenerateOutfit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = auth.getCurrentUser();
    if (!currentUser || !baseItemId) {
      setGenerationError(!currentUser ? "Please log in." : "A base item must be selected.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedOutfits([]);

    try {
      const response = await fetch('http://localhost:8000/api/clothing/generate_outfit/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ base_item_id: baseItemId, occasion }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate outfits.');
      }
      const data: Outfit[] = await response.json();
      setGeneratedOutfits(data);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  }, [baseItemId, occasion]);

  const handleSelectItem = (id: number) => {
    setBaseItemId(id);
    setGeneratedOutfits([]);
    setGenerationError(null);
    // Switch to the Generate Outfit tab after selection
    setActiveTab('Generate Outfit');
  };

  const getBaseItemObject = () => {
    if (!baseItemId) return null;
    return wardrobeItems.find(item => item.id === baseItemId) || null;
  }

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
      setUsername(currentUser.username)
    }
    setIsLoading(false)
  }, []);
  
  useEffect(() => {
    if (username) {
      if (activeTab === 'Wardrobe' && wardrobeItems.length === 0) {
        fetchWardrobe();
      } else if (activeTab === 'Recommended' && !recommendedOutfit) {
        fetchOutfitOfTheDay();
      }
    }
  }, [activeTab, username, fetchWardrobe, fetchOutfitOfTheDay, wardrobeItems.length, recommendedOutfit]);

  const handleLogout = () => {
    auth.logoutUser();
    setUsername(null);
    setWardrobeItems([]);
    setDropdownOpen(false);
    router.push('/login');
  };

  const renderContent = () => {
    if (!username && ['Wardrobe', 'Recommended', 'Generate Outfit'].includes(activeTab)) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LogIn className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Please Login</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Log in to view your wardrobe and generate outfits.</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-6 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition"
            >
              Go to Login
            </button>
          </div>
        )
    }

    switch (activeTab) {
      case 'Wardrobe':
        return <WardrobeGrid
                  items={wardrobeItems}
                  isLoading={isWardrobeLoading}
                  error={wardrobeError}
                  onSelectItem={handleSelectItem}
                  selectedItemId={baseItemId}
                />;
      case 'Generate Outfit':
        return <OutfitGenerator
          baseItem={getBaseItemObject()}
          onClearBaseItem={() => setBaseItemId(null)}
          occasion={occasion}
          setOccasion={setOccasion}
          outfits={generatedOutfits}
          loading={isGenerating}
          error={generationError}
          onSubmit={handleGenerateOutfit}
        />
        
      case 'Recommended':
        return <RecommendedOutfitDisplay 
                  outfit={recommendedOutfit}
                  isLoading={isRecsLoading}
                  error={recsError}
                />

      default:
        return null;
    }
  }

  const handleTabClick = (name: string) => {
    setActiveTab(name)
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = tabs.findIndex(t => t.name === activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      handleTabClick(tabs[nextIndex].name);
    },
    onSwipedRight: () => {
      const currentIndex = tabs.findIndex(t => t.name === activeTab);
      const nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      handleTabClick(tabs[nextIndex].name);
    },
    trackMouse: true,
  });

  const renderAuthStatus = () => {
    if (isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    if (username) {
      return (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 flex items-center justify-center bg-zinc-800 text-white dark:bg-white dark:text-black rounded-full text-sm font-bold"
          >
            {username.charAt(0).toUpperCase()}
          </button>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white dark:bg-zinc-800 z-10"
              >
                <ul className="py-1 text-sm text-gray-700 dark:text-gray-100">
                  <li
                    onClick={() => {
                      router.push('/profile')
                      setDropdownOpen(false)
                    }}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    Profile
                  </li>
                  <li
                    onClick={handleLogout}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 text-red-500 cursor-pointer"
                  >
                    Logout
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
    return (
       <button
        onClick={() => router.push('/login')}
        className="text-sm bg-zinc-800 text-white px-4 py-1.5 rounded-full hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
      >
        Login
       </button>
    );
  }

  return (
    <div className={`min-h-screen font-sans antialiased max-w-md md:max-w-lg mx-auto px-4 py-6 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-500 ${darkMode ? 'dark' : ''}`}>
      <header className="flex justify-between items-center mb-6 relative">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
          Zyvia ✨
        </h1>

        <div className="flex items-center space-x-4" ref={dropdownRef}>
          <button onClick={() => setDarkMode(prev => !prev)} aria-label="Toggle theme" className="text-zinc-500 dark:text-zinc-400">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {renderAuthStatus()}
        </div>
      </header>

      {globalError && (
        <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-6 text-sm text-center">
          {globalError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6 p-1 bg-zinc-200/70 dark:bg-zinc-900/70 rounded-full">
        {tabs.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => handleTabClick(name)}
            className={`relative flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-colors duration-300 ${
              activeTab === name
                ? 'text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {activeTab === name && (
                <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-fuchsia-600"
                    style={{ borderRadius: 9999 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
            <Icon className="w-4 h-4 relative" />
            <span className="relative">{name}</span>
          </button>
        ))}
      </div>

      <main
        {...swipeHandlers}
        className="min-h-[550px] rounded-3xl p-4 md:p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/upload')}
        className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white dark:bg-white dark:text-black w-16 h-16 flex items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
        aria-label="Upload"
      >
        <span className="text-3xl font-bold -mt-1">+</span>
      </motion.button>
    </div>
  )
}
