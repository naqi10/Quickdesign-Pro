import { TemplateMeta } from '@/lib/types'
import ClassicTemplate from './classic'
import ModernTemplate from './modern'
import MinimalTemplate from './minimal'
import AtsPro from './ats-pro'
import SidebarCreative from './sidebar'
import TechClean from './tech-clean'

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Navy header, teal accents — finance, law, academia',
    accentColor: '#1a365d',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column dark sidebar — tech, marketing',
    accentColor: '#1e3a5f',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean & minimal — works for any industry',
    accentColor: '#333333',
  },
  {
    id: 'ats-pro',
    name: 'ATS Pro',
    description: 'Max ATS score — pipe header, no color blocks',
    accentColor: '#111111',
  },
  {
    id: 'sidebar',
    name: 'Sidebar Creative',
    description: 'Dark sidebar with orange accents — stands out',
    accentColor: '#e57c23',
  },
  {
    id: 'tech-clean',
    name: 'Tech Clean',
    description: 'Blue accents, skill chips — dev & tech roles',
    accentColor: '#0070f3',
  },
]

export interface TemplateProps {
  data: import('@/lib/types').ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

export const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<TemplateProps>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  'ats-pro': AtsPro,
  sidebar: SidebarCreative,
  'tech-clean': TechClean,
}
