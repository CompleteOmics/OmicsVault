'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
)

const BuildingOfficeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
)

const FolderIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
)

const DocumentTextIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const ExclamationTriangleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

// Location type icons with colors
const locationTypes = [
  { value: 'Room', label: 'Room', icon: '🏠', color: 'bg-primary-50 text-primary-600 border-primary-200' },
  { value: 'Freezer', label: 'Freezer', icon: '❄️', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'Refrigerator', label: 'Refrigerator', icon: '🧊', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { value: 'Cabinet', label: 'Cabinet', icon: '🗄️', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'Shelf', label: 'Shelf', icon: '📚', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { value: 'Rack', label: 'Rack', icon: '🗃️', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { value: 'Box', label: 'Box', icon: '📦', color: 'bg-pink-50 text-pink-600 border-pink-200' },
  { value: 'Drawer', label: 'Drawer', icon: '🗂️', color: 'bg-slate-100 text-slate-600 border-slate-200' },
]

export default function NewLocationPage() {
  const params = useParams()
  const router = useRouter()
  const labId = params.labId as string

  const [locations, setLocations] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    type: 'Room',
    description: '',
    parentId: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    const res = await fetch(`/api/labs/${labId}/locations`)
    const data = await res.json()
    setLocations(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/labs/${labId}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to create location')
      }

      router.push(`/labs/${labId}`)
    } catch (error) {
      console.error('Error creating location:', error)
      setError('Failed to create location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getLocationLabel = (location: any): string => {
    const parts = []
    let current = location
    while (current) {
      parts.unshift(current.name)
      const parent = locations.find((l) => l.id === current.parentId)
      current = parent
    }
    return parts.join(' > ')
  }

  return (
    <div className="min-h-screen page-container">
      {/* Navigation */}
      <nav className="nav-header">
        <div className="content-container py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/labs/${labId}`}
              className="btn-ghost btn-icon text-slate-500 hover:text-slate-700 -ml-2"
            >
              <ArrowLeftIcon />
            </Link>
            <div className="flex items-center gap-3">
              <div className="icon-container-primary">
                <MapPinIcon />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Add New Location</h1>
                <p className="text-sm text-slate-500">Create a storage location</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="content-container py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
            {/* Error Alert */}
            {error && (
              <div className="alert alert-error flex items-center gap-3 animate-fade-in-down">
                <ExclamationTriangleIcon />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Basic Information */}
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <BuildingOfficeIcon />
                Location Details
              </h2>

              <div className="space-y-5">
                <div className="input-group">
                  <label className="label label-required">Location Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Lab A, Freezer 1, Shelf 2"
                    required
                    autoFocus
                  />
                </div>

                <div className="input-group">
                  <label className="label label-required">Location Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {locationTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.type === type.value
                            ? `${type.color} border-current shadow-sm`
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hierarchy */}
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <FolderIcon />
                Hierarchy
              </h2>

              <div className="input-group">
                <label className="label">Parent Location</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="select-field"
                >
                  <option value="">None (Top Level)</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {getLocationLabel(location)} ({location.type})
                    </option>
                  ))}
                </select>
                <p className="input-hint">
                  Create hierarchies like Room &rarr; Freezer &rarr; Shelf &rarr; Box
                </p>
              </div>

              {formData.parentId && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Path preview:</span>{' '}
                    {getLocationLabel(locations.find((l) => l.id === formData.parentId))}
                    {' > '}
                    <span className="text-primary-600 font-medium">
                      {formData.name || 'New Location'}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <DocumentTextIcon />
                Additional Details
              </h2>

              <div className="input-group">
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="textarea-field"
                  rows={4}
                  placeholder="Temperature settings, access notes, or any other details about this location..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Link href={`/labs/${labId}`} className="btn-secondary w-full sm:w-auto">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto sm:flex-1"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Location...
                  </>
                ) : (
                  <>
                    <CheckIcon />
                    Create Location
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
