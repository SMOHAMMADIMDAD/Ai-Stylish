"use client"

import { useState, useCallback } from "react"
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react"
import { getCurrentUser } from '@/lib/auth'; // Using your provided auth helper

export default function UploadClothing() {
  const [name, setName] = useState("")
  const [clothingType, setClothingType] = useState("Top")
  const [style, setStyle] = useState("casual")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleImageChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setStatus("idle")
      setMessage("")
    } else {
      setImage(null)
      setPreview(null)
    }
  }
  
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  }, []);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }

  const resetForm = () => {
    setName("")
    setClothingType("Top")
    setStyle("casual")
    setImage(null)
    setPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image) {
      setStatus("error")
      setMessage("Please select an image to upload.")
      return
    }

    // --- FIX STARTS HERE ---
    // 1. Get the current user session using your auth helper.
    const currentUser = getCurrentUser();

    // 2. Check if the user is logged in and has an access token.
    if (!currentUser || !currentUser.accessToken) {
      setStatus("error")
      setMessage("You must be logged in to upload clothing.")
      return
    }
    // --- FIX ENDS HERE ---

    setStatus("uploading")
    setMessage("Uploading your item...")

    const formData = new FormData()
    formData.append("name", name || image.name.split('.')[0])
    formData.append("clothing_type", clothingType)
    formData.append("style", style)
    formData.append("image", image)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/clothing/", {
        method: "POST",
        headers: {
          // 3. Use the correct accessToken from the user session.
          'Authorization': `Bearer ${currentUser.accessToken}`
        },
        body: formData,
      })

      if (res.ok) {
        setStatus("success")
        setMessage("✅ Uploaded successfully! Add another item.")
        resetForm()
      } else {
        const errorData = await res.json()
// REPLACE IT WITH THIS:
        const errorMessage = JSON.stringify(errorData);
        setStatus("error")
        setMessage(`❌ ${errorMessage}`)
      }
    } catch (error) {
      setStatus("error")
      setMessage("❌ A network error occurred. Could not connect to the server.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 space-y-6 border border-gray-200">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Add to Wardrobe</h1>
          <p className="text-gray-500 mt-2">Upload a new piece of clothing to get outfit recommendations.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload & Preview */}
          <div 
            className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all"
            onClick={() => document.getElementById('file-upload')?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
              className="hidden"
            />
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-xl p-2" />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <UploadCloud size={48} className="mb-2" />
                <span className="font-semibold">Click to upload or drag & drop</span>
                <span className="text-sm">PNG, JPG or GIF</span>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., White Hoodie"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={clothingType}
                onChange={(e) => setClothingType(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-black focus:border-black"
              >
                <option value="Top">Top</option>
                <option value="Bottom">Bottom</option>
                <option value="Shoes">Shoes</option>
                <option value="Outerwear">Outerwear</option>
                <option value="Accessory">Accessory</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-black focus:border-black"
              >
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="sport">Sport</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "uploading"}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-all text-base shadow-lg"
          >
            {status === "uploading" ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud size={20} />
                <span>Add Item to Wardrobe</span>
              </>
            )}
          </button>

          {/* Message Area */}
          {message && (
            <div className={`p-3 rounded-lg flex items-center gap-3 text-sm font-medium ${
              status === 'success' ? 'bg-green-100 text-green-800' :
              status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {status === 'success' && <CheckCircle size={20} />}
              {status === 'error' && <AlertCircle size={20} />}
              <span>{message}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
