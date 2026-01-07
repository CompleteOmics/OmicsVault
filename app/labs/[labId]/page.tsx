'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// Icons
const VaultIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="32" height="28" rx="4" className="fill-primary-600" />
    <rect x="8" y="12" width="24" height="20" rx="2" className="fill-primary-400" />
    <circle cx="20" cy="22" r="6" className="fill-primary-600" />
    <circle cx="20" cy="22" r="3" className="fill-primary-300" />
    <rect x="14" y="4" width="12" height="6" rx="2" className="fill-primary-700" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

const CubeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CogIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const MagnifyingGlassIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
)

const ExclamationTriangleIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
)

const FolderIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
)

const InboxIcon = () => (
  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

// Skeleton Components
const ItemCardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex gap-4">
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-slate-200 rounded-lg w-2/3" />
        <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
        <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
      </div>
      <div className="w-16 h-16 bg-slate-200 rounded-xl" />
    </div>
  </div>
)

const LocationCardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-200 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-slate-200 rounded-lg w-1/2" />
        <div className="h-4 bg-slate-200 rounded-lg w-1/4" />
      </div>
    </div>
  </div>
)

export default function LabPage() {
  const params = useParams()
  const router = useRouter()
  const { status } = useSession()
  const labId = params.labId as string

  const [activeTab, setActiveTab] = useState<'items' | 'locations' | 'activity'>('items')
  const [items, setItems] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [expiringItems, setExpiringItems] = useState<any[]>([])
  const [expiredItems, setExpiredItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, labId, search, lowStockOnly])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (lowStockOnly) params.append('lowStock', 'true')

      const [itemsRes, locationsRes, activitiesRes, expiringRes] = await Promise.all([
        fetch(`/api/labs/${labId}/items?${params}`),
        fetch(`/api/labs/${labId}/locations`),
        fetch(`/api/labs/${labId}/activities?limit=20`),
        fetch(`/api/labs/${labId}/expiring?days=30`),
      ])

      setItems(await itemsRes.json())
      setLocations(await locationsRes.json())
      setActivities(await activitiesRes.json())

      const expiringData = await expiringRes.json()
      setExpiringItems(expiringData.expiring || [])
      setExpiredItems(expiringData.expired || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const isLowStock = (item: any) => {
    return item.minQuantity !== null && item.quantity <= item.minQuantity
  }

  const getExpirationStatus = (item: any) => {
    if (!item.expirationDate) return null
    const now = new Date()
    const expDate = new Date(item.expirationDate)
    const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return { status: 'expired', days: Math.abs(daysUntilExpiry) }
    if (daysUntilExpiry <= 7) return { status: 'critical', days: daysUntilExpiry }
    if (daysUntilExpiry <= 30) return { status: 'warning', days: daysUntilExpiry }
    return null
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

  const tabs = [
    { id: 'items', label: 'Items', icon: CubeIcon, count: items.length },
    { id: 'locations', label: 'Locations', icon: MapPinIcon, count: locations.length },
    { id: 'activity', label: 'Activity', icon: ClockIcon },
  ] as const

  if (loading) {
    return (
      <div className="min-h-screen page-container">
        <nav className="nav-header">
          <div className="content-container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-5 bg-slate-200 rounded-lg animate-pulse" />
                <VaultIcon />
              </div>
              <div className="flex gap-2">
                <div className="w-24 h-10 bg-slate-200 rounded-xl animate-pulse" />
                <div className="w-24 h-10 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </nav>
        <div className="content-container py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen page-container">
      {/* Navigation */}
      <nav className="nav-header">
        <div className="content-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="btn-ghost btn-icon text-slate-500 hover:text-slate-700 -ml-2"
              >
                <ArrowLeftIcon />
              </Link>
              <div className="flex items-center gap-3">
                <VaultIcon />
                <span className="text-xl font-bold text-slate-900 tracking-tight">OmicsVault</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/labs/${labId}/items/new`)}
                className="btn-primary"
              >
                <PlusIcon />
                <span className="hidden sm:inline">Add Item</span>
              </button>
              <button
                onClick={() => router.push(`/labs/${labId}/settings`)}
                className="btn-secondary btn-icon"
                title="Settings"
              >
                <CogIcon />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="content-container py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="tabs-container w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab flex items-center gap-2 ${
                    activeTab === tab.id ? 'tab-active' : ''
                  }`}
                >
                  <Icon />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MagnifyingGlassIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search items by name, vendor, or catalog number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-11"
                />
              </div>
              <label className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  Low stock only
                </span>
              </label>
            </div>

            {/* Expiring Items Widget */}
            {(expiringItems.length > 0 || expiredItems.length > 0) && !search && !lowStockOnly && (
              <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <CalendarIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">Expiration Alerts</h3>

                    {expiredItems.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-red-900 mb-2">
                          ⚠️ {expiredItems.length} expired item{expiredItems.length > 1 ? 's' : ''}
                        </p>
                        <div className="space-y-2">
                          {expiredItems.slice(0, 3).map((item: any) => (
                            <div
                              key={item.id}
                              onClick={() => router.push(`/labs/${labId}/items/${item.id}`)}
                              className="cursor-pointer p-3 bg-white/80 hover:bg-white rounded-lg border border-red-200 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                                  <p className="text-xs text-slate-500">
                                    {item.location?.name} • Expired{' '}
                                    {new Date(item.expirationDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </p>
                                </div>
                                <span className="badge bg-red-100 text-red-700 border-red-200 text-xs">
                                  Expired
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {expiringItems.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-amber-900 mb-2">
                          📅 {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring in the next 30 days
                        </p>
                        <div className="space-y-2">
                          {expiringItems.slice(0, 3).map((item: any) => {
                            const expirationStatus = getExpirationStatus(item)
                            return (
                              <div
                                key={item.id}
                                onClick={() => router.push(`/labs/${labId}/items/${item.id}`)}
                                className="cursor-pointer p-3 bg-white/80 hover:bg-white rounded-lg border border-amber-200 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                                    <p className="text-xs text-slate-500">
                                      {item.location?.name} • Expires{' '}
                                      {new Date(item.expirationDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                  <span className={`badge text-xs ${
                                    expirationStatus?.status === 'critical'
                                      ? 'bg-red-100 text-red-700 border-red-200'
                                      : 'badge-warning'
                                  }`}>
                                    {expirationStatus?.days}d
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {(expiringItems.length > 3 || expiredItems.length > 3) && (
                      <p className="text-xs text-amber-700 mt-3">
                        Showing top {Math.min(3, expiringItems.length + expiredItems.length)} items
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Items List */}
            {items.length === 0 ? (
              <div className="card empty-state py-16">
                <div className="icon-container w-20 h-20 rounded-2xl mx-auto mb-6">
                  <InboxIcon />
                </div>
                <h3 className="empty-state-title">
                  {search || lowStockOnly ? 'No items found' : 'No items yet'}
                </h3>
                <p className="empty-state-description">
                  {search || lowStockOnly
                    ? 'Try adjusting your search or filters'
                    : 'Add your first item to start tracking your lab inventory'}
                </p>
                {!search && !lowStockOnly && (
                  <button
                    onClick={() => router.push(`/labs/${labId}/items/new`)}
                    className="btn-primary"
                  >
                    <PlusIcon />
                    Add Your First Item
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/labs/${labId}/items/${item.id}`)}
                    className="card-interactive group animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                            {item.name}
                          </h3>
                          {isLowStock(item) && (
                            <span className="badge badge-warning flex items-center gap-1">
                              <ExclamationTriangleIcon />
                              Low Stock
                            </span>
                          )}
                          {(() => {
                            const expirationStatus = getExpirationStatus(item)
                            if (!expirationStatus) return null
                            if (expirationStatus.status === 'expired') {
                              return (
                                <span className="badge bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
                                  <CalendarIcon />
                                  Expired
                                </span>
                              )
                            }
                            if (expirationStatus.status === 'critical') {
                              return (
                                <span className="badge bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
                                  <CalendarIcon />
                                  {expirationStatus.days}d
                                </span>
                              )
                            }
                            if (expirationStatus.status === 'warning') {
                              return (
                                <span className="badge badge-warning flex items-center gap-1">
                                  <CalendarIcon />
                                  {expirationStatus.days}d
                                </span>
                              )
                            }
                            return null
                          })()}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {item.category && (
                            <span className="badge badge-info">{item.category}</span>
                          )}
                          <span className="badge badge-neutral">
                            {item.quantity} {item.unit || 'units'}
                          </span>
                        </div>

                        <div className="text-sm text-slate-500 space-y-1">
                          {item.vendor && (
                            <p><span className="text-slate-400">Vendor:</span> {item.vendor}</p>
                          )}
                          {item.catalogNumber && (
                            <p><span className="text-slate-400">Catalog #:</span> {item.catalogNumber}</p>
                          )}
                          <p className="flex items-center gap-1">
                            <MapPinIcon />
                            {getLocationBreadcrumb(item.location)}
                          </p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                          Last updated by {item.lastUpdatedBy?.name || 'Unknown'} on{' '}
                          {new Date(item.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>

                      {item.photos?.[0] && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.photos[0].url}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-xl ring-1 ring-slate-200"
                          />
                        </div>
                      )}

                      <div className="flex items-center text-slate-400 group-hover:text-primary-500 transition-colors">
                        <ChevronRightIcon />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-end">
              <button
                onClick={() => router.push(`/labs/${labId}/locations/new`)}
                className="btn-primary"
              >
                <PlusIcon />
                Add Location
              </button>
            </div>

            {locations.filter((loc) => !loc.parentId).length === 0 ? (
              <div className="card empty-state py-16">
                <div className="icon-container w-20 h-20 rounded-2xl mx-auto mb-6">
                  <MapPinIcon />
                </div>
                <h3 className="empty-state-title">No locations yet</h3>
                <p className="empty-state-description">
                  Create locations to organize where your items are stored
                </p>
                <button
                  onClick={() => router.push(`/labs/${labId}/locations/new`)}
                  className="btn-primary"
                >
                  <PlusIcon />
                  Add Your First Location
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {locations
                  .filter((loc) => !loc.parentId)
                  .map((location, index) => (
                    <LocationTree
                      key={location.id}
                      location={location}
                      locations={locations}
                      labId={labId}
                      depth={0}
                      index={index}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4 animate-fade-in">
            {activities.length === 0 ? (
              <div className="card empty-state py-16">
                <div className="icon-container w-20 h-20 rounded-2xl mx-auto mb-6">
                  <ClockIcon />
                </div>
                <h3 className="empty-state-title">No activity yet</h3>
                <p className="empty-state-description">
                  Activity will appear here as items are added, moved, or updated
                </p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="card animate-fade-in-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="avatar flex-shrink-0">
                      {activity.user.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(activity.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function LocationTree({ location, locations, labId, depth, index }: any) {
  const router = useRouter()
  const children = locations.filter((loc: any) => loc.parentId === location.id)
  const [expanded, setExpanded] = useState(true)

  const locationTypeIcons: Record<string, string> = {
    Room: 'bg-primary-50 text-primary-600',
    Freezer: 'bg-blue-50 text-blue-600',
    Refrigerator: 'bg-cyan-50 text-cyan-600',
    Cabinet: 'bg-amber-50 text-amber-600',
    Shelf: 'bg-emerald-50 text-emerald-600',
    Rack: 'bg-purple-50 text-purple-600',
    Box: 'bg-pink-50 text-pink-600',
    Drawer: 'bg-slate-100 text-slate-600',
  }

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms`, marginLeft: depth > 0 ? '1.5rem' : 0 }}
    >
      <div className={`card-hover group ${depth > 0 ? 'relative before:absolute before:left-[-1rem] before:top-6 before:w-4 before:h-[2px] before:bg-slate-200' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {children.length > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="btn-ghost btn-icon btn-sm -ml-2"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <div className={`icon-container ${locationTypeIcons[location.type] || 'bg-slate-100 text-slate-600'}`}>
              <FolderIcon />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{location.name}</h3>
              <p className="text-sm text-slate-500">{location.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{location._count.items} items</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/labs/${labId}/locations/${location.id}`)
              }}
              className="btn-secondary btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              View
            </button>
          </div>
        </div>
      </div>

      {expanded && children.length > 0 && (
        <div className="mt-2 space-y-2 border-l-2 border-slate-200 ml-5">
          {children.map((child: any, childIndex: number) => (
            <LocationTree
              key={child.id}
              location={child}
              locations={locations}
              labId={labId}
              depth={depth + 1}
              index={childIndex}
            />
          ))}
        </div>
      )}
    </div>
  )
}
