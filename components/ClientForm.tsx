'use client'
import { useResumeStore } from '@/store/resumeStore'
import SmartPaste from '@/components/SmartPaste'
import { ClientFormData } from '@/lib/types'

export default function ClientForm() {
  const { formData, setFormData, replaceFormData, setExperience, addExperience, removeExperience,
    setEducation, addEducation, removeEducation } = useResumeStore()

  function handleSmartParsed(data: ClientFormData) {
    replaceFormData(data)
  }

  return (
    <div className="space-y-6">
      {/* Smart Paste */}
      <SmartPaste onParsed={handleSmartParsed} />

      {/* Personal Info */}
      <Section title="Personal Information">
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
          <Field label="LinkedIn (optional)">
            <input value={formData.linkedin} onChange={e => setFormData({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/ahmed" className={input} />
          </Field>
          <Field label="Portfolio (optional)">
            <input value={formData.portfolio} onChange={e => setFormData({ portfolio: e.target.value })}
              placeholder="github.com/ahmed" className={input} />
          </Field>
        </div>
      </Section>

      {/* Summary */}
      <Section title="Professional Summary">
        <p className="text-xs text-gray-400 mb-2">Write anything — AI will rewrite it professionally.</p>
        <textarea
          value={formData.rawSummary}
          onChange={e => setFormData({ rawSummary: e.target.value })}
          placeholder="e.g. I have 3 years experience in software development. I work with React and Node.js. I like solving problems."
          rows={3}
          className={textarea}
        />
      </Section>

      {/* Experience */}
      <Section title="Work Experience">
        <p className="text-xs text-gray-400 mb-3">Describe duties in plain language — AI converts to bullet points.</p>
        {formData.experiences.map((exp, idx) => (
          <div key={exp.id} className="border border-gray-700 rounded-lg p-3 mb-3 bg-gray-800/40">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-400">Experience #{idx + 1}</span>
              {formData.experiences.length > 1 && (
                <button onClick={() => removeExperience(exp.id)} className="text-red-400 hover:text-red-300 text-xs">
                  Remove
                </button>
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
            <Field label="Raw Duties (describe informally)">
              <textarea value={exp.rawDuties} onChange={e => setExperience(exp.id, { rawDuties: e.target.value })}
                placeholder="I made websites for clients, fixed bugs, worked in a team of 5 developers, attended daily standups..."
                rows={3} className={textarea} />
            </Field>
          </div>
        ))}
        <button onClick={addExperience} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
          + Add Another Experience
        </button>
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <p className="text-xs text-gray-400 mb-2">Comma-separated. AI will clean, group, and add missing key skills.</p>
        <textarea
          value={formData.rawSkills}
          onChange={e => setFormData({ rawSkills: e.target.value })}
          placeholder="React, Node.js, Python, teamwork, problem solving, MySQL, communication, Git"
          rows={2}
          className={textarea}
        />
      </Section>

      {/* Education */}
      <Section title="Education">
        {formData.education.map((edu, idx) => (
          <div key={edu.id} className="border border-gray-700 rounded-lg p-3 mb-3 bg-gray-800/40">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-400">Education #{idx + 1}</span>
              {formData.education.length > 1 && (
                <button onClick={() => removeEducation(edu.id)} className="text-red-400 hover:text-red-300 text-xs">
                  Remove
                </button>
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
        <button onClick={addEducation} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
          + Add Education
        </button>
      </Section>

      {/* Certifications */}
      <Section title="Certifications (optional)">
        <p className="text-xs text-gray-400 mb-2">One per line.</p>
        <textarea
          value={formData.certifications}
          onChange={e => setFormData({ certifications: e.target.value })}
          placeholder="AWS Cloud Practitioner — 2023&#10;Google Analytics Certified — 2022"
          rows={2}
          className={textarea}
        />
      </Section>

      {/* Job Description */}
      <Section title="Job Description (optional — for keyword matching)">
        <p className="text-xs text-gray-400 mb-2">Paste the job posting. AI extracts keywords and injects them into the resume.</p>
        <textarea
          value={formData.jobDescription}
          onChange={e => setFormData({ jobDescription: e.target.value })}
          placeholder="Paste full job description here..."
          rows={4}
          className={textarea}
        />
      </Section>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const input = 'w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors'
const textarea = 'w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
        <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
