import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  BrainCircuit,
  ChevronDown,
  Code2,
  Database,
  Github,
  Layers3,
  Mail,
  Menu,
  Network,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'

const projects = [
  {
    id: 'rag',
    title: 'AI RAG Chatbot',
    eyebrow: 'GENAI / RETRIEVAL',
    description:
      'Multi-document conversational RAG with hybrid retrieval, CrossEncoder reranking, source-grounded answers and persistent chat history.',
    repo: 'https://github.com/o-m-s-h/ai-rag-chatbot',
    stack: ['FastAPI', 'LangChain', 'ChromaDB', 'Redis', 'MongoDB', 'React'],
    metrics: ['~93% retrieval accuracy', '~35% lift vs vector-only', '100+ evaluation queries'],
    architecture: ['Query', 'Vector + BM25', 'Reranker', 'LLM'],
    category: 'AI',
    icon: BrainCircuit,
    accent: 'cyan',
    details: [
      'Semantic chunking and MiniLM embeddings for document representation.',
      'Hybrid semantic + BM25 retrieval with Redis-backed keyword cache.',
      'CrossEncoder reranking before context construction and LLM generation.',
      'Conversation-scoped retrieval, citations and persistent message history.',
    ],
  },
  {
    id: 'chat',
    title: 'Real-time Chat App',
    eyebrow: 'FULL-STACK / REAL-TIME',
    description:
      'WhatsApp-style web chat with authenticated messaging, live presence, message persistence and read receipts.',
    repo: 'https://github.com/o-m-s-h/chat-app',
    stack: ['React', 'Node.js', 'Express', 'Socket.IO', 'MongoDB', 'Redis'],
    metrics: ['50+ concurrent connections tested', 'Live presence', 'Rate-limited APIs'],
    architecture: ['React', 'Socket.IO', 'Node API', 'Redis + Mongo'],
    category: 'Systems',
    icon: Zap,
    accent: 'violet',
    details: [
      'Socket.IO events for real-time messages and online/offline presence.',
      'JWT authentication with Redis-backed session checks and rate limiting.',
      'Encrypted message utility, search and email-based user discovery.',
      'Frontend deployed independently from the backend for production-style separation.',
    ],
  },
  {
    id: 'ppe',
    title: 'PPEGuard',
    eyebrow: 'COMPUTER VISION',
    description:
      'YOLOv8 safety-compliance detector for construction images and videos with annotated media and structured violation reports.',
    repo: 'https://github.com/o-m-s-h/PPEGuard',
    stack: ['Python', 'YOLOv8', 'PyTorch', 'OpenCV', 'FastAPI', 'Streamlit'],
    metrics: ['Image + video inference', 'JSON + CSV reports', '100 MiB upload guard'],
    architecture: ['Upload', 'YOLO', 'Rules', 'Annotated + Reports'],
    category: 'AI',
    icon: ShieldCheck,
    accent: 'amber',
    details: [
      'Single model load at FastAPI startup with shared inference services.',
      'Image and video detection with browser-compatible annotated outputs.',
      'Severity rules and structured JSON/CSV reporting for violations.',
      'Streamlit operator UI plus CLI and REST API paths for different workflows.',
    ],
  },
  {
    id: 'scheduler',
    title: 'Distributed Task Scheduler',
    eyebrow: 'DISTRIBUTED SYSTEMS',
    description:
      'Redis-backed task scheduler with delayed execution, multi-worker processing, atomic claims and worker-failure recovery.',
    repo: 'https://github.com/o-m-s-h/distributed-task-scheduler',
    stack: ['Node.js', 'Redis', 'React', 'Distributed Systems'],
    metrics: ['5–10 sec failover', 'Idempotent claims', 'Horizontal workers'],
    architecture: ['Scheduler', 'Redis Queue', 'Workers', 'Recovery'],
    category: 'Systems',
    icon: Network,
    accent: 'green',
    details: [
      'Supports immediate and delayed tasks across multiple worker processes.',
      'Atomic claiming prevents duplicate execution under concurrent workers.',
      'Visibility timeout enables task recovery when a worker crashes mid-job.',
      'Designed around idempotency, recovery and horizontal scalability concepts.',
    ],
  },
  {
    id: 'analyst',
    title: 'Autonomous Data Analyst',
    eyebrow: 'AGENTIC AI / ANALYTICS',
    description:
      'Natural-language data analysis agent that turns questions into SQL, investigates hypotheses and explains evidence from datasets.',
    repo: 'https://github.com/o-m-s-h/autonomous-data-analyst',
    stack: ['FastAPI', 'LangGraph', 'DuckDB', 'React', 'OpenRouter'],
    metrics: ['100+ analysis queries', '~95% answer accuracy', 'Multi-step investigation'],
    architecture: ['Question', 'Agent', 'DuckDB Tools', 'Evidence'],
    category: 'AI',
    icon: Layers3,
    accent: 'rose',
    details: [
      'Agent state tracks datasets, executed queries, results and hypotheses.',
      'Tool-calling flow inspects schemas and executes SQL against DuckDB.',
      'Autonomous investigation can generate and test multiple hypotheses.',
      'Analysis covers numerical correlations and categorical group comparisons.',
    ],
  },
]

const skills = [
  { group: 'Languages', icon: Code2, items: ['Python', 'Java', 'JavaScript', 'SQL'] },
  { group: 'GenAI & ML', icon: BrainCircuit, items: ['RAG', 'LLMs', 'LangGraph', 'LangChain', 'PyTorch', 'YOLO'] },
  { group: 'Backend', icon: ServerCog, items: ['FastAPI', 'Node.js', 'Express', 'REST', 'WebSockets', 'Redis'] },
  { group: 'Data', icon: Database, items: ['PostgreSQL', 'MySQL', 'MongoDB', 'ChromaDB', 'DuckDB'] },
]

const navItems = ['about', 'projects', 'skills', 'education', 'contact']

function App() {
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('about')
  const cursorRef = useRef(null)

  const filteredProjects = useMemo(() => {
    if (filter === 'All') return projects
    return projects.filter((project) => project.category === filter)
  }, [filter])

  useEffect(() => {
    const onMove = (event) => {
      if (!cursorRef.current) return
      cursorRef.current.style.transform = `translate(${event.clientX - 240}px, ${event.clientY - 240}px)`
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(() => {
    const targets = [...document.querySelectorAll('[data-reveal]')]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.12 },
    )
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [filter])

  useEffect(() => {
    const sections = navItems.map((id) => document.getElementById(id)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0.01, 0.2, 0.5] },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((value) => !value)
      }
      if (event.key === 'Escape') {
        setCommandOpen(false)
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
    setCommandOpen(false)
  }

  return (
    <div className="site-shell">
      <div className="cursor-glow" ref={cursorRef} />
      <div className="noise" />

      <header className="topbar">
        <a className="brand" href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about') }}>
          <span className="brand-mark">OS</span>
          <span className="brand-name">Omkar Shewalkar</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item}
              className={activeSection === item ? 'nav-link active' : 'nav-link'}
              onClick={() => scrollTo(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="command-trigger" onClick={() => setCommandOpen(true)} aria-label="Open quick navigation">
            <Search size={15} />
            <span>Quick nav</span>
            <kbd>⌘K</kbd>
          </button>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <button key={item} onClick={() => scrollTo(item)}>{item}</button>
          ))}
        </div>
      )}

      <main>
        <section className="hero section" id="about">
          <div className="hero-copy" data-reveal>
            <div className="availability-pill">
              <span className="status-dot" />
              Building AI + backend systems
            </div>
            <p className="hero-kicker">CSE (AI & ML) · Hyderabad · 2023–2027</p>
            <h1>
              I build <span>AI systems</span><br />
              that actually ship.
            </h1>
            <p className="hero-lede">
              Computer Science undergraduate focused on AI/ML, GenAI and backend engineering—building retrieval systems,
              autonomous agents, real-time applications and distributed infrastructure end to end.
            </p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={() => scrollTo('projects')}>
                Explore projects <ArrowUpRight size={17} />
              </button>
              <a className="secondary-btn" href="mailto:omkar.shewalkar936@gmail.com">
                <Mail size={17} /> Contact me
              </a>
            </div>
            <div className="hero-proof">
              <div><strong>5</strong><span>deep-build projects</span></div>
              <div><strong>AI + Systems</strong><span>not tutorial clones</span></div>
              <div><strong>End-to-end</strong><span>backend → UI → deploy</span></div>
            </div>
          </div>

          <div className="hero-visual" data-reveal>
            <div className="orbit-card">
              <div className="profile-topline">
                <span className="mono">~/omkar/portfolio</span>
                <span className="live-badge">LIVE</span>
              </div>
              <div className="profile-core">
                <img src="https://avatars.githubusercontent.com/u/249721141?v=4" alt="Omkar Shewalkar GitHub avatar" />
                <div>
                  <p className="mono muted">builder.profile</p>
                  <h2>Omkar<br />Shewalkar</h2>
                </div>
              </div>
              <div className="terminal-lines">
                <p><span>$</span> focus --now</p>
                <p className="terminal-output">RAG · Agents · Backend · ML</p>
                <p><span>$</span> status</p>
                <p className="terminal-output">shipping_projects ██████████ 100%</p>
              </div>
              <div className="orbit-tags">
                <span>FastAPI</span><span>Redis</span><span>LangGraph</span><span>React</span>
              </div>
            </div>

            <div className="floating-chip chip-a"><Sparkles size={14} /> RAG pipelines</div>
            <div className="floating-chip chip-b"><Network size={14} /> Distributed workers</div>
            <div className="floating-chip chip-c"><ShieldCheck size={14} /> Computer vision</div>
          </div>
        </section>

        <section className="marquee-wrap" aria-label="Technology highlights">
          <div className="marquee-track">
            {[...skills.flatMap((group) => group.items), ...skills.flatMap((group) => group.items)].map((item, index) => (
              <span key={`${item}-${index}`}><i />{item}</span>
            ))}
          </div>
        </section>

        <section className="section projects-section" id="projects">
          <div className="section-heading" data-reveal>
            <div>
              <p className="section-index">01 / SELECTED WORK</p>
              <h2>Projects with real architecture.</h2>
            </div>
            <p>
              Five projects across retrieval, real-time communication, computer vision, distributed systems and autonomous analysis.
            </p>
          </div>

          <div className="filter-row" data-reveal>
            {['All', 'AI', 'Systems'].map((item) => (
              <button key={item} className={filter === item ? 'filter-btn active' : 'filter-btn'} onClick={() => setFilter(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {filteredProjects.map((project, index) => {
              const Icon = project.icon
              const open = expanded === project.id
              return (
                <article className={`project-card accent-${project.accent}`} key={project.id} data-reveal>
                  <div className="project-number">0{index + 1}</div>
                  <div className="project-head">
                    <div className="project-icon"><Icon /></div>
                    <div>
                      <p className="project-eyebrow">{project.eyebrow}</p>
                      <h3>{project.title}</h3>
                    </div>
                  </div>

                  <p className="project-description">{project.description}</p>

                  <div className="architecture-strip">
                    {project.architecture.map((node, nodeIndex) => (
                      <div className="architecture-node-wrap" key={node}>
                        <span className="architecture-node">{node}</span>
                        {nodeIndex !== project.architecture.length - 1 && <span className="architecture-arrow">→</span>}
                      </div>
                    ))}
                  </div>

                  <div className="metric-row">
                    {project.metrics.map((metric) => <span key={metric}>{metric}</span>)}
                  </div>

                  <div className="tag-row">
                    {project.stack.map((tech) => <span key={tech}>{tech}</span>)}
                  </div>

                  <div className={open ? 'project-details open' : 'project-details'}>
                    <ul>
                      {project.details.map((detail) => <li key={detail}>{detail}</li>)}
                    </ul>
                  </div>

                  <div className="project-footer">
                    <button className="details-btn" onClick={() => setExpanded(open ? null : project.id)}>
                      {open ? 'Hide details' : 'View case study'} <ChevronDown className={open ? 'rotated' : ''} size={16} />
                    </button>
                    <a href={project.repo} target="_blank" rel="noreferrer" className="repo-link">
                      <Github size={17} /> GitHub <ArrowUpRight size={14} />
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="section skills-section" id="skills">
          <div className="section-heading" data-reveal>
            <div>
              <p className="section-index">02 / TOOLBOX</p>
              <h2>Built around useful depth.</h2>
            </div>
            <p>
              Strongest at the point where ML/GenAI meets backend systems: retrieval, APIs, data, orchestration and production-style integration.
            </p>
          </div>

          <div className="skills-layout">
            <div className="skills-panel" data-reveal>
              {skills.map((skill) => {
                const Icon = skill.icon
                return (
                  <div className="skill-group" key={skill.group}>
                    <div className="skill-group-title"><Icon size={18} /><span>{skill.group}</span></div>
                    <div className="skill-pills">
                      {skill.items.map((item) => <span key={item}>{item}</span>)}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="constellation" data-reveal>
              <div className="constellation-grid" />
              <div className="constellation-center">
                <BrainCircuit />
                <strong>BUILD</strong>
                <span>AI × Systems</span>
              </div>
              <div className="orbit-node orbit-1">RAG</div>
              <div className="orbit-node orbit-2">APIs</div>
              <div className="orbit-node orbit-3">Agents</div>
              <div className="orbit-node orbit-4">Redis</div>
              <div className="orbit-node orbit-5">CV</div>
              <div className="orbit-node orbit-6">Data</div>
            </div>
          </div>
        </section>

        <section className="section education-section" id="education">
          <div className="section-heading" data-reveal>
            <div>
              <p className="section-index">03 / EDUCATION</p>
              <h2>Foundation + continuous building.</h2>
            </div>
          </div>

          <div className="timeline" data-reveal>
            <div className="timeline-line" />
            <div className="timeline-item current">
              <div className="timeline-dot" />
              <div className="timeline-year">2023 — 2027</div>
              <div className="timeline-card">
                <div>
                  <h3>B.E. Computer Science Engineering</h3>
                  <p>Artificial Intelligence & Machine Learning</p>
                </div>
                <div className="timeline-meta">
                  <span>Keshav Memorial Engineering College</span>
                  <span>Hyderabad</span>
                  <span>CGPA · 8.18</span>
                </div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-year">NOW</div>
              <div className="timeline-card compact-card">
                <div>
                  <h3>Focus areas</h3>
                  <p>AI/ML engineering · Backend systems · Product-oriented SWE</p>
                </div>
                <div className="timeline-meta">
                  <span>RAG</span><span>Agentic AI</span><span>Distributed systems</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="contact-card" data-reveal>
            <div className="contact-copy">
              <p className="section-index">04 / CONTACT</p>
              <h2>Have an interesting system to build?</h2>
              <p>
                I’m interested in software engineering, AI/ML and backend roles where I can work on real products, data and infrastructure—not just isolated models.
              </p>
              <div className="contact-actions">
                <a className="primary-btn" href="mailto:omkar.shewalkar936@gmail.com">
                  <Mail size={17} /> Send an email
                </a>
                <a className="secondary-btn" href="https://github.com/o-m-s-h" target="_blank" rel="noreferrer">
                  <Github size={17} /> GitHub
                </a>
              </div>
            </div>
            <div className="contact-code">
              <p><span>const</span> omkar = {'{'}</p>
              <p>  role: <em>'AI/ML + Backend'</em>,</p>
              <p>  location: <em>'Hyderabad'</em>,</p>
              <p>  status: <em>'building'</em>,</p>
              <p>  caffeine: <em>true</em></p>
              <p>{'}'}</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span>© 2026 Omkar Shewalkar</span>
        <span className="mono">Designed to show the systems, not just list them.</span>
      </footer>

      {commandOpen && (
        <div className="command-backdrop" onMouseDown={() => setCommandOpen(false)}>
          <div className="command-palette" onMouseDown={(e) => e.stopPropagation()}>
            <div className="command-input"><Search size={17} /><span>Jump to…</span><kbd>ESC</kbd></div>
            <div className="command-list">
              {navItems.map((item, index) => (
                <button key={item} onClick={() => scrollTo(item)}>
                  <span className="command-number">0{index + 1}</span>
                  <span>{item}</span>
                  <ArrowUpRight size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
