'use client'
import { useResumeStore } from '@/store/resumeStore'
import SmartPaste from '@/components/SmartPaste'
import { ClientFormData } from '@/lib/types'

export default function ClientForm() {
  const {
    formData, setFormData, replaceFormData,
    setExperience, addExperience, removeExperience,
    setProject, addProject, removeProject,
    setEducation, addEducation, removeEducation,
  } = useResumeStore()

  function handleSmartParsed(data: ClientFormData) {
    replaceFormData(data)
  }

  return (
    <div className="space-y-5">
      <SmartPaste onParsed={handleSmartParsed} />

      {/* ── Personal Info ── */}
      <Section title="Personal Information" icon="👤">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name *">
            <input value={formData.name} onChange={e => setFormData({ name: e.target.value })}
              placeholder="Ahmed Khan" className={input} />
          </Field>
          <Field label="Target Job Title *">
            <input value={formData.jobTitle} onChange={e => setFormData({ jobTitle: e.target.value })}
              placeholder="Software Developer" className={input} />
          </Field>
          <Field label="Phone">
            <input value={formData.phone} onChange={e => setFormData({ phone: e.target.value })}
              placeholder="+92 300 0000000" className={input} />
          </Field>
          <Field label="Email">
            <input value={formData.email} onChange={e => setFormData({ email: e.target.value })}
              placeholder="ahmed@email.com" className={input} />
          </Field>
          <Field label="LinkedIn">
            <input value={formData.linkedin} onChange={e => setFormData({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/ahmed" className={input} />
          </Field>
          <Field label="Portfolio / GitHub">
            <input value={formData.portfolio} onChange={e => setFormData({ portfolio: e.target.value })}
              placeholder="github.com/ahmed" className={input} />
          </Field>
        </div>
      </Section>

      {/* ── Summary ── */}
      <Section title="Professional Summary" icon="✍️">
        <p className="text-xs text-slate-400 mb-2">Write anything — AI rewrites it professionally.</p>
        <textarea value={formData.rawSummary} onChange={e => setFormData({ rawSummary: e.target.value })}
          placeholder="e.g. I have 3 years in software development, work with React and Node.js…"
          rows={3} className={textarea} />
      </Section>

      {/* ── Work Experience ── */}
      <Section title="Work Experience" icon="💼">
        <p className="text-xs text-slate-400 mb-3">Describe duties informally — AI converts to bullets.</p>
        {formData.experiences.map((exp, idx) => (
          <div key={exp.id} className="border border-slate-200 rounded-xl p-3 mb-3 bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Experience #{idx + 1}</span>
              {formData.experiences.length > 1 && (
                <button onClick={() => removeExperience(exp.id)}
                  className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">Remove</button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Field label="Company">
                <input value={exp.company} onChange={e => setExperience(exp.id, { company: e.target.value })}
                  placeholder="Google Pakistan" className={input} />
              </Field>
              <Field label="Job Title / Role">
                <input value={exp.role} onChange={e => setExperience(exp.id, { role: e.target.value })}
                  placeholder="Junior Developer" className={input} />
              </Field>
            </div>
            <Field label="Duration">
              <input value={exp.duration} onChange={e => setExperience(exp.id, { duration: e.target.value })}
                placeholder="Jan 2022 – Dec 2023" className={`${input} mb-2`} />
            </Field>
            <Field label="Raw Duties (informal is fine)">
              <textarea value={exp.rawDuties} onChange={e => setExperience(exp.id, { rawDuties: e.target.value })}
                placeholder="I made websites, fixed bugs, worked in team of 5, attended standups…"
                rows={3} className={textarea} />
            </Field>
          </div>
        ))}
        <button onClick={addExperience}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-colors">
          + Add Experience
        </button>
      </Section>

      {/* ── Projects ── */}
      <Section title="Projects" icon="🚀" badge="IT / Software">
        <p className="text-xs text-slate-400 mb-3">
          Add your key projects — AI rewrites bullets and highlights tech stack.
          Auto-detected from Smart Paste if present in your CV text.
        </p>
        {(formData.projects ?? []).map((proj, idx) => (
          <div key={proj.id} className="border border-blue-100 rounded-xl p-3 mb-3 bg-blue-50/40">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Project #{idx + 1}</span>
              {(formData.projects ?? []).length > 1 && (
                <button onClick={() => removeProject(proj.id)}
                  className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">Remove</button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Field label="Project Name">
                <input value={proj.name} onChange={e => setProject(proj.id, { name: e.target.value })}
                  placeholder="E-Commerce App" className={input} />
              </Field>
              <Field label="Live / GitHub Link (optional)">
                <input value={proj.link} onChange={e => setProject(proj.id, { link: e.target.value })}
                  placeholder="github.com/you/project" className={input} />
              </Field>
            </div>
            <Field label="Tech Stack (comma-separated)">
              <input value={proj.techStack} onChange={e => setProject(proj.id, { techStack: e.target.value })}
                placeholder="React, Node.js, MongoDB, Stripe" className={`${input} mb-2`} />
            </Field>
            <Field label="Description (informal — AI rewrites)">
              <textarea value={proj.description} onChange={e => setProject(proj.id, { description: e.target.value })}
                placeholder="I built a shopping app with user auth, cart, and Stripe payments. Used React frontend with Node backend and MongoDB database…"
                rows={3} className={textarea} />
            </Field>
          </div>
        ))}
        <button onClick={addProject}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-colors">
          + Add Project
        </button>
      </Section>

      {/* ── Skills ── */}
      <Section title="Skills" icon="⚡">
        <p className="text-xs text-slate-400 mb-2">Comma-separated. AI groups and adds missing key skills.</p>
        <textarea value={formData.rawSkills} onChange={e => setFormData({ rawSkills: e.target.value })}
          placeholder="React, Node.js, Python, MySQL, Git, communication, problem solving"
          rows={2} className={textarea} />
      </Section>

      {/* ── Education ── */}
      <Section title="Education" icon="🎓">
        {formData.education.map((edu, idx) => (
          <div key={edu.id} className="border border-slate-200 rounded-xl p-3 mb-3 bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Education #{idx + 1}</span>
              {formData.education.length > 1 && (
                <button onClick={() => removeEducation(edu.id)}
                  className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">Remove</button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Degree / Certificate">
                <input value={edu.degree} onChange={e => setEducation(edu.id, { degree: e.target.value })}
                  placeholder="BS Computer Science" className={input} />
              </Field>
              <Field label="Institution">
                <input value={edu.institution} onChange={e => setEducation(edu.id, { institution: e.target.value })}
                  placeholder="FAST University" className={input} />
              </Field>
              <Field label="Year">
                <input value={edu.year} onChange={e => setEducation(edu.id, { year: e.target.value })}
                  placeholder="2021" className={input} />
              </Field>
            </div>
          </div>
        ))}
        <button onClick={addEducation}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-colors">
          + Add Education
        </button>
      </Section>

      {/* ── Certifications ── */}
      <Section title="Certifications" icon="🏅">
        <p className="text-xs text-slate-400 mb-2">One per line.</p>
        <textarea value={formData.certifications} onChange={e => setFormData({ certifications: e.target.value })}
          placeholder={"AWS Cloud Practitioner — 2023\nGoogle Analytics Certified — 2022"}
          rows={2} className={textarea} />
      </Section>

      {/* ── Job Description ── */}
      <Section title="Job Description" icon="🎯">
        <p className="text-xs text-slate-400 mb-2">Paste the job posting — AI extracts keywords and injects them.</p>
        <textarea value={formData.jobDescription} onChange={e => setFormData({ jobDescription: e.target.value })}
          placeholder="Paste full job description here…"
          rows={4} className={textarea} />
      </Section>
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const input = 'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
const textarea = 'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none'

function Section({ title, icon, badge, children }: {
  title: string; icon: string; badge?: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {badge && (
          <span className="ml-auto text-[10px] font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
