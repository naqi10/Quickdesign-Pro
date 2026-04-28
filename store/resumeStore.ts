'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ClientFormData, ResumeData, RawExperience, RawEducation, RawProject } from '@/lib/types'

const defaultForm: ClientFormData = {
  name: '',
  phone: '',
  email: '',
  linkedin: '',
  portfolio: '',
  jobTitle: '',
  jobDescription: '',
  rawSummary: '',
  experiences: [{ id: '1', company: '', role: '', duration: '', rawDuties: '' }],
  projects: [{ id: '1', name: '', description: '', techStack: '', link: '' }],
  rawSkills: '',
  education: [{ id: '1', degree: '', institution: '', year: '' }],
  certifications: '',
}

interface ResumeStore {
  formData: ClientFormData
  setFormData: (data: Partial<ClientFormData>) => void
  replaceFormData: (data: ClientFormData) => void

  setExperience: (id: string, data: Partial<RawExperience>) => void
  addExperience: () => void
  removeExperience: (id: string) => void

  setProject: (id: string, data: Partial<RawProject>) => void
  addProject: () => void
  removeProject: (id: string) => void

  setEducation: (id: string, data: Partial<RawEducation>) => void
  addEducation: () => void
  removeEducation: (id: string) => void

  selectedTemplate: string
  setTemplate: (id: string) => void

  resumeData: ResumeData | null
  setResumeData: (data: ResumeData) => void
  updateResumeField: (path: string, value: string) => void
  updateSummary: (summary: string) => void
  updateSkills: (skills: Record<string, string[]>) => void
  updateExperienceBullets: (index: number, bullets: string[]) => void
  updateProjectBullets: (index: number, bullets: string[]) => void

  isRewriting: boolean
  setIsRewriting: (v: boolean) => void
  rewriteStatus: string
  setRewriteStatus: (s: string) => void

  reset: () => void
  _hasHydrated: boolean
  _setHasHydrated: (v: boolean) => void
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      formData: defaultForm,
      selectedTemplate: 'classic',
      resumeData: null,
      isRewriting: false,
      rewriteStatus: '',
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      setFormData: (data) => set(s => ({ formData: { ...s.formData, ...data } })),
      replaceFormData: (data) => set({ formData: data }),

      setExperience: (id, data) =>
        set(s => ({ formData: { ...s.formData, experiences: s.formData.experiences.map(e => e.id === id ? { ...e, ...data } : e) } })),
      addExperience: () =>
        set(s => ({ formData: { ...s.formData, experiences: [...s.formData.experiences, { id: Date.now().toString(), company: '', role: '', duration: '', rawDuties: '' }] } })),
      removeExperience: (id) =>
        set(s => ({ formData: { ...s.formData, experiences: s.formData.experiences.filter(e => e.id !== id) } })),

      setProject: (id, data) =>
        set(s => ({ formData: { ...s.formData, projects: (s.formData.projects ?? []).map(p => p.id === id ? { ...p, ...data } : p) } })),
      addProject: () =>
        set(s => ({ formData: { ...s.formData, projects: [...(s.formData.projects ?? []), { id: Date.now().toString(), name: '', description: '', techStack: '', link: '' }] } })),
      removeProject: (id) =>
        set(s => ({ formData: { ...s.formData, projects: (s.formData.projects ?? []).filter(p => p.id !== id) } })),

      setEducation: (id, data) =>
        set(s => ({ formData: { ...s.formData, education: s.formData.education.map(e => e.id === id ? { ...e, ...data } : e) } })),
      addEducation: () =>
        set(s => ({ formData: { ...s.formData, education: [...s.formData.education, { id: Date.now().toString(), degree: '', institution: '', year: '' }] } })),
      removeEducation: (id) =>
        set(s => ({ formData: { ...s.formData, education: s.formData.education.filter(e => e.id !== id) } })),

      setTemplate: (id) => set({ selectedTemplate: id }),
      setResumeData: (data) => set({ resumeData: data }),

      updateResumeField: (path, value) => {
        const keys = path.split('~~')
        set(s => {
          if (!s.resumeData) return {}
          const updated = JSON.parse(JSON.stringify(s.resumeData))
          let ref: Record<string, unknown> = updated
          for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]] as Record<string, unknown>
          ref[keys[keys.length - 1]] = value
          return { resumeData: updated }
        })
      },

      updateSummary: (summary) => set(s =>
        s.resumeData ? { resumeData: { ...s.resumeData, summary } } : {}
      ),

      updateSkills: (skills) => set(s =>
        s.resumeData ? { resumeData: { ...s.resumeData, skills } } : {}
      ),

      updateExperienceBullets: (index, bullets) => set(s => {
        if (!s.resumeData) return {}
        const exp = s.resumeData.experience.map((e, i) => i === index ? { ...e, bullets } : e)
        return { resumeData: { ...s.resumeData, experience: exp } }
      }),

      updateProjectBullets: (index, bullets) => set(s => {
        if (!s.resumeData) return {}
        const projects = s.resumeData.projects.map((p, i) => i === index ? { ...p, bullets } : p)
        return { resumeData: { ...s.resumeData, projects } }
      }),

      setIsRewriting: (v) => set({ isRewriting: v }),
      setRewriteStatus: (s) => set({ rewriteStatus: s }),
      reset: () => set({ formData: defaultForm, resumeData: null, selectedTemplate: 'classic' }),
    }),
    {
      name: 'resume-generator-state',
      onRehydrateStorage: () => (state) => { state?._setHasHydrated(true) },
      partialize: (s) => ({ formData: s.formData, selectedTemplate: s.selectedTemplate, resumeData: s.resumeData }),
    }
  )
)
