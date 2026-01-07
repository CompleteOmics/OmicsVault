'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
)

const QrCodeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
  </svg>
)

const ArrowsRightLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
)

const PhotoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
)

const XMarkIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ExclamationTriangleIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const DocumentTextIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

const CloudArrowUpIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
)

// Skeleton components
const ItemDetailSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="card">
      <div className="flex justify-between mb-6">
        <div className="space-y-3">
          <div className="h-8 bg-slate-200 rounded-lg w-64" />
          <div className="flex gap-2">
            <div className="h-6 bg-slate-200 rounded-full w-20" />
            <div className="h-6 bg-slate-200 rounded-full w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-slate-200 rounded-xl w-24" />
          <div className="h-10 bg-slate-200 rounded-xl w-20" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-5 bg-slate-200 rounded w-32" />
          </div>
        ))}
      </div>
    </div>
    <div className="card">
      <div className="h-6 bg-slate-200 rounded w-24 mb-4" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square bg-slate-200 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
)

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const labId = params.labId as string
  const itemId = params.itemId as string

  const [item, setItem] = useState<any>(null)
  const [locations, setLocations] = useState<any[]>([])
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [moveToLocationId, setMoveToLocationId] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [moving, setMoving] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemRes, locationsRes] = await Promise.all([
        fetch(`/api/labs/${labId}/items/${itemId}`),
        fetch(`/api/labs/${labId}/locations`),
      ])

      setItem(await itemRes.json())
      setLocations(await locationsRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMove = async () => {
    setMoving(true)
    try {
      const res = await fetch(`/api/labs/${labId}/items/${itemId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toLocationId: moveToLocationId }),
      })

      if (res.ok) {
        setShowMoveModal(false)
        setMoveToLocationId('')
        fetchData()
      }
    } catch (error) {
      console.error('Error moving item:', error)
    } finally {
      setMoving(false)
    }
  }

  const handlePhotoUpload = async () => {
    if (!selectedFile) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await fetch(`/api/labs/${labId}/items/${itemId}/photos`, {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setShowPhotoUpload(false)
        setSelectedFile(null)
        fetchData()
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
    } finally {
      setUploading(false)
    }
  }

  const generateQR = async () => {
    try {
      const res = await fetch(`/api/labs/${labId}/items/${itemId}/qr`)
      const data = await res.json()
      setQrCode(data.qrCode)
      setShowQR(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const getLocationBreadcrumb = (location: any): string => {
    const parts = []
    let current = location
    while (current) {
      parts.unshift(current.name)
      current = current.parent
    }
    return parts.join(' > ')
  }

  const isLowStock = item?.minQuantity !== null && item?.quantity <= item?.minQuantity

  // Calculate expiration status
  const getExpirationStatus = () => {
    if (!item?.expirationDate) return null
    const now = new Date()
    const expDate = new Date(item.expirationDate)
    const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return { status: 'expired', days: Math.abs(daysUntilExpiry), color: 'red' }
    if (daysUntilExpiry <= 7) return { status: 'critical', days: daysUntilExpiry, color: 'red' }
    if (daysUntilExpiry <= 30) return { status: 'warning', days: daysUntilExpiry, color: 'amber' }
    return { status: 'ok', days: daysUntilExpiry, color: 'green' }
  }

  const expirationStatus = getExpirationStatus()

  if (loading) {
    return (
      <div className="min-h-screen page-container">
        <nav className="nav-header">
          <div className="content-container py-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-5 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse" />
            </div>
          </div>
        </nav>
        <div className="content-container py-8">
          <ItemDetailSkeleton />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen page-container flex items-center justify-center">
        <div className="card text-center py-16 max-w-md">
          <div className="icon-container w-16 h-16 mx-auto mb-4">
            <DocumentTextIcon />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Item not found</h3>
          <p className="text-sm text-slate-500 mb-6">
            This item may have been deleted or you don't have access to it.
          </p>
          <Link href={`/labs/${labId}`} className="btn-primary">
            <ArrowLeftIcon />
            Back to Lab
          </Link>
        </div>
      </div>
    )
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
            <h1 className="text-xl font-bold text-slate-900 truncate">{item.name}</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="content-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expiration Alert Banner */}
            {expirationStatus && expirationStatus.status !== 'ok' && (
              <div className={`animate-fade-in-down p-4 rounded-xl border-2 ${
                expirationStatus.status === 'expired'
                  ? 'bg-red-50 border-red-200'
                  : expirationStatus.status === 'critical'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    expirationStatus.status === 'expired' || expirationStatus.status === 'critical'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    <CalendarIcon />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${
                      expirationStatus.status === 'expired' || expirationStatus.status === 'critical'
                        ? 'text-red-900'
                        : 'text-amber-900'
                    }`}>
                      {expirationStatus.status === 'expired'
                        ? `Expired ${expirationStatus.days} days ago`
                        : expirationStatus.status === 'critical'
                        ? `Expires in ${expirationStatus.days} days`
                        : `Expires in ${expirationStatus.days} days`}
                    </p>
                    <p className={`text-sm mt-1 ${
                      expirationStatus.status === 'expired' || expirationStatus.status === 'critical'
                        ? 'text-red-700'
                        : 'text-amber-700'
                    }`}>
                      {expirationStatus.status === 'expired'
                        ? 'This item has expired and should not be used. Please dispose of it properly.'
                        : expirationStatus.status === 'critical'
                        ? 'This item is expiring very soon. Consider using it immediately or coordinating with your team.'
                        : 'This item will expire soon. Plan to use it or coordinate with your team to prevent waste.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Item Details Card */}
            <div className="card animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{item.name}</h2>
                  <div className="flex flex-wrap gap-2">
                    {item.category && (
                      <span className="badge badge-info">{item.category}</span>
                    )}
                    {isLowStock && (
                      <span className="badge badge-warning flex items-center gap-1">
                        <ExclamationTriangleIcon />
                        Low Stock
                      </span>
                    )}
                    {expirationStatus && expirationStatus.status === 'expired' && (
                      <span className="badge bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
                        <CalendarIcon />
                        Expired
                      </span>
                    )}
                    {expirationStatus && expirationStatus.status === 'critical' && (
                      <span className="badge bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
                        <CalendarIcon />
                        Expires in {expirationStatus.days}d
                      </span>
                    )}
                    {expirationStatus && expirationStatus.status === 'warning' && (
                      <span className="badge badge-warning flex items-center gap-1">
                        <CalendarIcon />
                        Expires in {expirationStatus.days}d
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={generateQR}
                    className="btn-secondary btn-sm"
                  >
                    <QrCodeIcon />
                    <span className="hidden sm:inline">QR Code</span>
                  </button>
                  <button
                    onClick={() => setShowMoveModal(true)}
                    className="btn-secondary btn-sm"
                  >
                    <ArrowsRightLeftIcon />
                    <span className="hidden sm:inline">Move</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Vendor</p>
                  <p className="font-medium text-slate-900">{item.vendor || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Catalog Number</p>
                  <p className="font-medium text-slate-900">{item.catalogNumber || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Lot Number</p>
                  <p className="font-medium text-slate-900">{item.lotNumber || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Quantity</p>
                  <p className={`font-medium ${isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>
                    {item.quantity} {item.unit || 'units'}
                  </p>
                </div>
                {item.minQuantity !== null && (
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">Minimum Quantity</p>
                    <p className="font-medium text-slate-900">
                      {item.minQuantity} {item.unit || 'units'}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium text-slate-900 flex items-center gap-1">
                    <MapPinIcon />
                    {getLocationBreadcrumb(item.location)}
                  </p>
                </div>
                {item.expirationDate && (
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">Expiration Date</p>
                    <p className={`font-medium flex items-center gap-1 ${
                      expirationStatus?.status === 'expired' || expirationStatus?.status === 'critical'
                        ? 'text-red-600'
                        : expirationStatus?.status === 'warning'
                        ? 'text-amber-600'
                        : 'text-slate-900'
                    }`}>
                      <CalendarIcon />
                      {new Date(item.expirationDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {item.openedDate && (
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">Opened Date</p>
                    <p className="font-medium text-slate-900 flex items-center gap-1">
                      <CalendarIcon />
                      {new Date(item.openedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {item.remarks && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-2">Remarks</p>
                  <p className="text-slate-700">{item.remarks}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>Created by {item.createdBy.name}</span>
                <span>Last updated by {item.lastUpdatedBy?.name || 'Unknown'}</span>
                <span>{new Date(item.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Photos Card */}
            <div className="card animate-fade-in-up animation-delay-150">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <PhotoIcon />
                  Photos
                </h3>
                <button
                  onClick={() => setShowPhotoUpload(true)}
                  className="btn-primary btn-sm"
                >
                  <PlusIcon />
                  Upload
                </button>
              </div>

              {item.photos.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <PhotoIcon />
                  <p className="text-sm text-slate-500 mt-2">No photos yet</p>
                  <button
                    onClick={() => setShowPhotoUpload(true)}
                    className="btn-ghost btn-sm mt-3"
                  >
                    <PlusIcon />
                    Add photo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {item.photos.map((photo: any) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square cursor-pointer group"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.caption || item.name}
                        fill
                        className="object-cover rounded-xl ring-1 ring-slate-200 group-hover:ring-primary-500 transition-all"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Movement History Card */}
            <div className="card animate-fade-in-up animation-delay-300">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
                <ClockIcon />
                Movement History
              </h3>

              {item.movements.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <ArrowsRightLeftIcon />
                  <p className="text-sm text-slate-500 mt-2">No movements recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {item.movements.map((movement: any, index: number) => (
                    <div
                      key={movement.id}
                      className="flex items-start gap-4 relative"
                    >
                      {index < item.movements.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-200" />
                      )}
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 z-10">
                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm text-slate-700">
                          Moved from <span className="font-medium">{movement.fromLocation.name}</span> to{' '}
                          <span className="font-medium">{movement.toLocation.name}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          By {movement.movedBy.name} on{' '}
                          {new Date(movement.movedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code Card */}
            {qrCode && showQR && (
              <div className="card animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">QR Code</h3>
                  <button
                    onClick={() => setShowQR(false)}
                    className="btn-ghost btn-icon btn-sm"
                  >
                    <XMarkIcon />
                  </button>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <img src={qrCode} alt="QR Code" className="w-full" />
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">
                  Scan to quickly access this item
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Move Modal */}
      {showMoveModal && (
        <div className="modal-overlay" onClick={() => setShowMoveModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Move Item</h3>
              <button
                onClick={() => setShowMoveModal(false)}
                className="btn-ghost btn-icon -mr-2"
              >
                <XMarkIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="label">New Location</label>
                <select
                  value={moveToLocationId}
                  onChange={(e) => setMoveToLocationId(e.target.value)}
                  className="select-field"
                >
                  <option value="">Select a location</option>
                  {locations
                    .filter((loc) => loc.id !== item.locationId)
                    .map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name} ({location.type})
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowMoveModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleMove}
                className="btn-primary"
                disabled={!moveToLocationId || moving}
              >
                {moving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Moving...
                  </>
                ) : (
                  <>
                    <ArrowsRightLeftIcon />
                    Move Item
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <div className="modal-overlay" onClick={() => setShowPhotoUpload(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Upload Photo</h3>
              <button
                onClick={() => setShowPhotoUpload(false)}
                className="btn-ghost btn-icon -mr-2"
              >
                <XMarkIcon />
              </button>
            </div>
            <div className="modal-body">
              <label className={`file-dropzone ${selectedFile ? 'file-dropzone-active' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="sr-only"
                />
                <div className="flex flex-col items-center">
                  <CloudArrowUpIcon />
                  {selectedFile ? (
                    <p className="mt-2 text-sm font-medium text-primary-600">{selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="mt-2 text-sm font-medium text-slate-700">Click to upload</p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </label>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowPhotoUpload(false)
                  setSelectedFile(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handlePhotoUpload}
                className="btn-primary"
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    Upload Photo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <XMarkIcon />
          </button>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || item.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
