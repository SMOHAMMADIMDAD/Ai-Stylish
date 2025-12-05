'use client'

import React, { useEffect, useState } from 'react'

type ClothingItem = {
  id: number
  name: string
  image: string
  clothing_type?: string
  style?: string
}

const ClothingList = () => {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/clothing/')
        const data = await response.json()

        // Handle wrapped object or array
        const clothingArray = Array.isArray(data)
          ? data
          : Array.isArray(data.clothing)
          ? data.clothing
          : []

        setItems(clothingArray)
      } catch (err) {
        console.error('Failed to fetch clothing items:', err)
        setError('Failed to load items. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Uploaded Clothing Items</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : items.length === 0 ? (
        <p>No items uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border shadow rounded overflow-hidden"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  {item.clothing_type || 'Unknown Type'} | {item.style || 'Style N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClothingList
