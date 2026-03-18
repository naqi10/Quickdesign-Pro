import { TemplateMeta } from '@/lib/types'
import ClassicTemplate from './classic'
import ModernTemplate from './modern'
import MinimalTemplate from './minimal'

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional serif design — ideal for finance, law, academia',
    accentColor: '#1a365d',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column with dark sidebar — great for tech, marketing',
    accentColor: '#1e3a5f',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and minimal — works for any industry',
    accentColor: '#333333',
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
}
