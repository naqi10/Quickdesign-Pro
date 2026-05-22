import { ClientFormData } from './types'

// Realistic example used by the "Try with sample data" button. Deliberately
// written in rough, informal language so the AI rewrite has something to
// visibly polish — showing new users the value in one click.
export const SAMPLE_FORM_DATA: ClientFormData = {
  name: 'Alex Carter',
  phone: '+1 415 555 0142',
  email: 'alex.carter@email.com',
  linkedin: 'linkedin.com/in/alexcarter',
  portfolio: 'alexcarter.dev',
  jobTitle: 'Full Stack Developer',
  jobDescription: '',
  rawSummary:
    'full stack dev with about 5 years experience building web apps with react and node. led a small team and shipped a saas product used by 10k+ users. good at turning rough ideas into working products fast.',
  experiences: [
    {
      id: '1',
      company: 'TechFlow Inc',
      role: 'Senior Full Stack Developer',
      duration: 'Jan 2022 - Present',
      rawDuties:
        'built and maintained the main saas dashboard with react and node, led a team of 3 devs, improved page load speed a lot, set up ci/cd pipelines, worked with postgres and redis, did code reviews',
    },
    {
      id: '2',
      company: 'StartupLabs',
      role: 'Frontend Developer',
      duration: 'Jun 2019 - Dec 2021',
      rawDuties:
        'made responsive uis with react, integrated rest apis, fixed lots of bugs, worked closely with designers, improved test coverage and added unit tests',
    },
  ],
  projects: [
    {
      id: '1',
      name: 'TaskFlow',
      description:
        'a project management tool with real time collaboration, built with next.js and websockets, used by around 500 teams',
      techStack: 'Next.js, TypeScript, PostgreSQL, WebSockets',
      link: 'github.com/alexcarter/taskflow',
    },
  ],
  rawSkills:
    'javascript, typescript, react, next.js, node.js, express, postgresql, mongodb, redis, docker, aws, git',
  education: [
    { id: '1', degree: 'BSc Computer Science', institution: 'University of California, Berkeley', year: '2019' },
  ],
  certifications: 'AWS Certified Developer – Associate\nMeta Front-End Developer Professional Certificate',
}
