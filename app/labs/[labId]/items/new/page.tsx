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

const CubeIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
)

const TagIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
)

const BuildingStorefrontIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
  </svg>
)

const HashtagIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
  </svg>
)

const BeakerIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 15.5m14.8-.2l.024.024a4.5 4.5 0 01-1.032 5.053A11.944 11.944 0 0112 22.5a11.944 11.944 0 01-6.792-2.123A4.5 4.5 0 014.176 15.32l.024-.024" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
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

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

export default function NewItemPage() {
  const params = useParams()
  const router = useRouter()
  const labId = params.labId as string

  const [locations, setLocations] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    vendor: '',
    catalogNumber: '',
    lotNumber: '',
    quantity: '',
    unit: '',
    minQuantity: '',
    locationId: '',
    remarks: '',
    expirationDate: '',
    openedDate: '',
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
      const res = await fetch(`/api/labs/${labId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to create item')
      }

      const item = await res.json()
      router.push(`/labs/${labId}/items/${item.id}`)
    } catch (error) {
      console.error('Error creating item:', error)
      setError('Failed to create item. Please try again.')
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
                <CubeIcon />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Add New Item</h1>
                <p className="text-sm text-slate-500">Add an item to your inventory</p>
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
                <TagIcon />
                Basic Information
              </h2>

              <div className="space-y-5">
                <div className="input-group">
                  <label className="label label-required">Item Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., SYBR Green Master Mix"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label className="label">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Reagent, Antibody, Buffer"
                    />
                    <p className="input-hint">Helps organize your inventory</p>
                  </div>

                  <div className="input-group">
                    <label className="label">Vendor</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <BuildingStorefrontIcon />
                      </div>
                      <input
                        type="text"
                        value={formData.vendor}
                        onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                        className="input-field pl-11"
                        placeholder="e.g., Thermo Fisher"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Identification */}
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <HashtagIcon />
                Identification
              </h2>

              <div className="form-row">
                <div className="input-group">
                  <label className="label">Catalog Number</label>
                  <input
                    type="text"
                    value={formData.catalogNumber}
                    onChange={(e) => setFormData({ ...formData, catalogNumber: e.target.value })}
                    className="input-field"
                    placeholder="e.g., A25741"
                  />
                </div>

                <div className="input-group">
                  <label className="label">Lot Number</label>
                  <input
                    type="text"
                    value={formData.lotNumber}
                    onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 2024-01-001"
                  />
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <BeakerIcon />
                Quantity & Location
              </h2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 input-group">
                    <label className="label label-required">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="input-field"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="label">Unit</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="input-field"
                      placeholder="mL, mg, etc."
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="label">Minimum Quantity (Low Stock Alert)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    className="input-field"
                    placeholder="Optional threshold for low stock alerts"
                  />
                  <p className="input-hint">You'll be alerted when quantity falls below this level</p>
                </div>

                <div className="input-group">
                  <label className="label label-required">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPinIcon />
                    </div>
                    <select
                      value={formData.locationId}
                      onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                      className="select-field pl-11"
                      required
                    >
                      <option value="">Select a location</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {getLocationLabel(location)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {locations.length === 0 && (
                    <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon />
                        <div>
                          <p className="text-sm font-medium text-amber-800">No locations found</p>
                          <p className="text-sm text-amber-700 mt-1">
                            Please{' '}
                            <Link href={`/labs/${labId}/locations/new`} className="font-semibold underline">
                              create a location
                            </Link>{' '}
                            first.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expiration Tracking */}
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <CalendarIcon />
                Expiration Tracking
              </h2>

              <div className="space-y-5">
                <div className="form-row">
                  <div className="input-group">
                    <label className="label">Expiration Date</label>
                    <input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      className="input-field"
                    />
                    <p className="input-hint">We'll alert you before items expire</p>
                  </div>

                  <div className="input-group">
                    <label className="label">Opened Date</label>
                    <input
                      type="date"
                      value={formData.openedDate}
                      onChange={(e) => setFormData({ ...formData, openedDate: e.target.value })}
                      className="input-field"
                    />
                    <p className="input-hint">Track when item was first opened</p>
                  </div>
                </div>

                {formData.expirationDate && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <CalendarIcon />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Smart Expiration Alerts</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Your team will be notified 30 days and 7 days before expiration. Items can be reserved by team members to coordinate usage.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <DocumentTextIcon />
                Additional Notes
              </h2>

              <div className="input-group">
                <label className="label">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="textarea-field"
                  rows={4}
                  placeholder="Storage conditions, handling instructions, or any other notes..."
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
                disabled={loading || locations.length === 0}
                className="btn-primary w-full sm:w-auto sm:flex-1"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Item...
                  </>
                ) : (
                  <>
                    <CheckIcon />
                    Create Item
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
