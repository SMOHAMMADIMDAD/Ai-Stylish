'use client';

import React, { useState, useCallback } from 'react';

interface ClothingItem {
  id: number;
  name: string;
  image: string;
  clothing_type: string;
  style: string;
  color_palette: string[];
  primary_color: string;
}

interface Outfit {
  base: ClothingItem;
  top?: ClothingItem;
  bottom?: ClothingItem;
  shoes?: ClothingItem;
  outerwear?: ClothingItem;
  score: number;
  visual_similarity: number;
  explanation: string;
  tags: string[];
}

export default function OutfitPage() {
  const [baseItemId, setBaseItemId] = useState<number | null>(null);
  const [occasion, setOccasion] = useState('casual');
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper to turn a relative path into a full URL
  const getFullImageUrl = (url: string) =>
    url.startsWith('http') ? url : `http://localhost:8000${url}`;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!baseItemId || baseItemId <= 0) {
        setError('Please enter a valid base item ID.');
        return;
      }

      setLoading(true);
      setError(null);
      setOutfits([]);

      try {
        const response = await fetch(
          'http://localhost:8000/api/clothing/generate_outfit/',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base_item_id: baseItemId, occasion }),
          }
        );
        if (!response.ok) throw new Error('Failed to fetch outfit');
        const data: Outfit[] = await response.json();
        setOutfits(data);
      } catch (err) {
        console.error(err);
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [baseItemId, occasion]
  );

  const renderItem = (item?: ClothingItem) => {
    if (!item) return null;
    const src = getFullImageUrl(item.image);
    return (
      <div key={item.id} className="text-center">
        <img
          src={src}
          alt={item.name}
          className="w-full h-48 object-contain rounded-md bg-white"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://via.placeholder.com/200?text=Image+Unavailable';
          }}
        />
        <div className="mt-2 text-sm font-semibold">{item.name}</div>
        <div className="text-xs text-gray-500 capitalize">{item.clothing_type}</div>
      </div>
    );
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">👗 Outfit Generator</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 mb-8 max-w-md mx-auto"
      >
        <div>
          <label className="block text-sm font-semibold mb-1">
            Base Item ID
          </label>
          <input
            type="number"
            value={baseItemId ?? ''}
            onChange={(e) => setBaseItemId(Number(e.target.value))}
            placeholder="Enter item ID"
            className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Occasion</label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring focus:border-black"
          >
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="party">Party</option>
          </select>
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded text-white font-medium ${
            loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
          }`}
          disabled={loading}
        >
          {loading ? 'Generating Outfit...' : 'Generate Outfit'}
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse h-64 bg-gray-200 rounded"
            ></div>
          ))}
        </div>
      ) : outfits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {outfits.map((outfit, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 shadow bg-white"
            >
              <h2 className="text-lg font-semibold mb-2 text-center">
                Outfit #{i + 1}
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-3">
                {renderItem(outfit.base)}
                {renderItem(outfit.top)}
                {renderItem(outfit.bottom)}
                {renderItem(outfit.shoes)}
                {renderItem(outfit.outerwear)}
              </div>

              <div className="text-sm text-gray-700 mb-1">
                <strong>Score:</strong> {outfit.score} |{' '}
                <strong>Visual:</strong> {outfit.visual_similarity}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {outfit.explanation}
              </div>
              <div className="flex flex-wrap gap-2">
                {outfit.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !error && (
          <p className="text-center text-gray-500">
            No outfits generated yet.
          </p>
        )
      )}
    </main>
  );
}
