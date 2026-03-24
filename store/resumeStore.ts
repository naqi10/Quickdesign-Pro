'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ClientFormData, ResumeData, RawExperience, RawEducation } from '@/lib/types'

// ─── Default form state ───────────────────────────────────────────────────────

const defaultForm: ClientFormData = {
  name: '',
  phone: '',
  email: '',
  linkedin: '',
  portfolio: '',
  jobTitle: '',
  jobDescription: '',
  rawSummary: '',
  experiences: [
    { id: '1', company: '', role: '', duration: '', rawDuties: '' },
  ],
  rawSkills: '',
  education: [
    { id: '1', degree: '', institution: '', year: '' },
  ],
  certifications: '',
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface ResumeStore {
  // Form state
  formData: ClientFormData
  setFormData: (data: Partial<ClientFormData>) => void
  replaceFormData: (data: ClientFormData) => void
  setExperience: (id: string, data: Partial<RawExperience>) => void
  addExperience: () => void
  removeExperience: (id: string) => void
  setEducation: (id: string, data: Partial<RawEducation>) => void
  addEducation: () => void
  removeEducation: (id: string) => void

  // Template
  selectedTemplate: string
  setTemplate: (id: string) => void

  // AI result
  resumeData: ResumeData | null
  setResumeData: (data: ResumeData) => void
  updateResumeField: (path: string, value: string) => void

  // UI state
  isRewriting: boolean
  setIsRewriting: (v: boolean) => void
  rewriteStatus: string
  setRewriteStatus: (s: string) => void

  // Reset
  reset: () => void

  // Hydration flag — false until Zustand finishes reading localStorage
  _hasHydrated: boolean
  _setHasHydrated: (v: boolean) => void
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      formData: defaultForm,
      selectedTemplate: 'classic',
      resumeData: null,
      isRewriting: false,
      rewriteStatus: '',
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      setFormData: (data) =>
        set(state => ({ formData: { ...state.formData, ...data } })),

      replaceFormData: (data) => set({ formData: data }),

      setExperience: (id, data) =>
        set(state => ({
          formData: {
            ...state.formData,
            experiences: state.formData.experiences.map(e =>
              e.id === id ? { ...e, ...data } : e
            ),
          },
        })),

      addExperience: () =>
        set(state => ({
          formData: {
            ...state.formData,
            experiences: [
              ...state.formData.experiences,
              { id: Date.now().toString(), company: '', role: '', duration: '', rawDuties: '' },
            ],
          },
        })),

      removeExperience: (id) =>
        set(state => ({
          formData: {
            ...state.formData,
            experiences: state.formData.experiences.filter(e => e.id !== id),
          },
        })),

      setEducation: (id, data) =>
        set(state => ({
          formData: {
            ...state.formData,
            education: state.formData.education.map(e =>
              e.id === id ? { ...e, ...data } : e
            ),
          },
        })),

      addEducation: () =>
        set(state => ({
          formData: {
            ...state.formData,
            education: [
              ...state.formData.education,
              { id: Date.now().toString(), degree: '', institution: '', year: '' },
            ],
          },
        })),

      removeEducation: (id) =>
        set(state => ({
          formData: {
            ...state.formData,
            education: state.formData.education.filter(e => e.id !== id),
          },
        })),

      setTemplate: (id) => set({ selectedTemplate: id }),

      setResumeData: (data) => set({ resumeData: data }),

      updateResumeField: (path, value) => {
        // Path uses ~~ separator to safely handle keys with spaces
        // e.g. "summary" | "experience~~0~~bullets~~0" | "skills~~Technical Skills~~0"
        const keys = path.split('~~')
        set(state => {
          if (!state.resumeData) return {}
          const updated = JSON.parse(JSON.stringify(state.resumeData))
          let ref: Record<string, unknown> = updated
          for (let i = 0; i < keys.length - 1; i++) {
            ref = ref[keys[i]] as Record<string, unknown>
          }
          ref[keys[keys.length - 1]] = value
          return { resumeData: updated }
        })
      },

      setIsRewriting: (v) => set({ isRewriting: v }),
      setRewriteStatus: (s) => set({ rewriteStatus: s }),

      reset: () => set({ formData: defaultForm, resumeData: null, selectedTemplate: 'classic' }),
    }),
    {
      name: 'resume-generator-state',
      // Called once localStorage has been read and merged into the store.
      // Until this fires, _hasHydrated stays false and the UI shows a loader.
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true)
      },
      // Only persist user data — never persist UI/loading state
      partialize: (state) => ({
        formData: state.formData,
        selectedTemplate: state.selectedTemplate,
        resumeData: state.resumeData,
      }),
    }
  )
)
