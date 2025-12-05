import { useState, useEffect, useCallback } from 'react';
import * as auth from '@/lib/auth';

// Custom hook to manage the user's wardrobe
export function useWardrobe(isTabActive, username) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWardrobe = useCallback(async () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/clothing/', {
        headers: { 'Authorization': `Bearer ${currentUser.accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch wardrobe items.');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if the tab is active, the user is logged in, AND we don't have items yet.
    if (isTabActive && username && items.length === 0) {
      fetchWardrobe();
    }
  }, [isTabActive, username, items.length, fetchWardrobe]);

  return { items, isLoading, error, fetchWardrobe };
}

// Custom hook to manage recommendations
export function useRecommendations(isTabActive, username) {
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    // This logic is now self-contained!
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/clothing/recommendations/', {
        headers: { 'Authorization': `Bearer ${currentUser.accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to fetch recommendations.');
      }
      if (Array.isArray(data)) {
        setOutfits(data);
      } else {
        setError(data.detail || "Received an invalid response.");
        setOutfits([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // This ensures we don't re-fetch every time the tab is clicked.
    if (isTabActive && username && outfits.length === 0) {
      fetchRecommendations();
    }
  }, [isTabActive, username, outfits.length, fetchRecommendations]);

  return { outfits, isLoading, error, fetchRecommendations };
}