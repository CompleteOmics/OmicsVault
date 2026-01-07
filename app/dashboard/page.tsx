'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
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

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

const BeakerIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 15.5m14.8-.2l.024.024a4.5 4.5 0 01-1.032 5.053A11.944 11.944 0 0112 22.5a11.944 11.944 0 01-6.792-2.123A4.5 4.5 0 014.176 15.32l.024-.024" />
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

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
)

const ArrowRightOnRectangleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
)

const XMarkIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface Lab {
  id: string
  name: string
  description?: string
  _count: {
    items: number
    locations: number
  }
}

// Skeleton loaders
const LabCardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-200" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-slate-200 rounded-lg w-2/3" />
        <div className="h-4 bg-slate-200 rounded-lg w-full" />
      </div>
    </div>
    <div className="flex gap-4 mt-5 pt-4 border-t border-slate-100">
      <div className="h-4 bg-slate-200 rounded w-20" />
      <div className="h-4 bg-slate-200 rounded w-20" />
    </div>
  </div>
)

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newLab, setNewLab] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchLabs()
    }
  }, [status, router])

  const fetchLabs = async () => {
    try {
      const res = await fetch('/api/labs')
      const data = await res.json()
      setLabs(data)
    } catch (error) {
      console.error('Error fetching labs:', error)
    } finally {
      setLoading(false)
    }
  }

  const createLab = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLab),
      })
      const lab = await res.json()
      setLabs([...labs, lab])
      setShowCreateForm(false)
      setNewLab({ name: '', description: '' })
      router.push(`/labs/${lab.id}`)
    } catch (error) {
      console.error('Error creating lab:', error)
    } finally {
      setCreating(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen page-container">
        <nav className="nav-header">
          <div className="content-container py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <VaultIcon />
                <span className="text-xl font-bold text-slate-900">OmicsVault</span>
              </div>
              <div className="w-32 h-5 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </nav>
        <div className="content-container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LabCardSkeleton key={i} />
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
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <VaultIcon />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">OmicsVault</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{session?.user?.name}</p>
                  <p className="text-xs text-slate-500">{session?.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="btn-ghost btn-icon text-slate-500 hover:text-slate-700"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="content-container py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="page-title">Your Labs</h1>
            <p className="page-description">Manage and organize your laboratory inventory</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            <PlusIcon />
            Create Lab
          </button>
        </div>

        {/* Create Lab Modal */}
        {showCreateForm && (
          <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
            <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Create New Lab</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn-ghost btn-icon -mr-2"
                >
                  <XMarkIcon />
                </button>
              </div>
              <form onSubmit={createLab}>
                <div className="modal-body space-y-4">
                  <div className="input-group">
                    <label className="label">Lab Name</label>
                    <input
                      type="text"
                      value={newLab.name}
                      onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Genomics Lab, Cell Culture Room"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="input-group">
                    <label className="label">Description (optional)</label>
                    <textarea
                      value={newLab.description}
                      onChange={(e) => setNewLab({ ...newLab, description: e.target.value })}
                      className="textarea-field"
                      rows={3}
                      placeholder="Brief description of this lab..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={creating}>
                    {creating ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <PlusIcon />
                        Create Lab
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LabCardSkeleton key={i} />
            ))}
          </div>
        ) : labs.length === 0 ? (
          /* Empty State */
          <div className="card empty-state py-20">
            <div className="icon-container-primary w-20 h-20 rounded-2xl mx-auto mb-6">
              <SparklesIcon />
            </div>
            <h3 className="empty-state-title">Welcome to OmicsVault</h3>
            <p className="empty-state-description">
              Create your first lab to start organizing and tracking your inventory
              with powerful features designed for biotech researchers.
            </p>
            <button onClick={() => setShowCreateForm(true)} className="btn-primary btn-lg">
              <PlusIcon />
              Create Your First Lab
            </button>
          </div>
        ) : (
          /* Lab Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.map((lab, index) => (
              <div
                key={lab.id}
                onClick={() => router.push(`/labs/${lab.id}`)}
                className="card-interactive group animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="icon-container-primary flex-shrink-0">
                    <BeakerIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                      {lab.name}
                    </h3>
                    {lab.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {lab.description}
                      </p>
                    )}
                  </div>
                  <ChevronRightIcon />
                </div>

                <div className="flex items-center gap-6 mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CubeIcon />
                    <span>{lab._count.items} items</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPinIcon />
                    <span>{lab._count.locations} locations</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
