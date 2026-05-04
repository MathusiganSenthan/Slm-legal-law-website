import Head from 'next/head';
import type { NextPage } from 'next';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type ToastState = {
  visible: boolean;
  message: string;
};

type ContactFormState = {
  fname: string;
  lname: string;
  email: string;
  subject: string;
  message: string;
};

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState<string>('literature');
  const [activeMilestone, setActiveMilestone] = useState<string>('proposal');
  const [activeSection, setActiveSection] = useState<string>('home');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' });
  const toastTimeoutRef = useRef<number | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [contact, setContact] = useState<ContactFormState>({
    fname: '',
    lname: '',
    email: '',
    subject: '',
    message: '',
  });

  const navItems = useMemo(
    () => [
      { id: 'home', label: 'Home' },
      { id: 'domain', label: 'Domain' },
      { id: 'milestones', label: 'Milestones' },
      { id: 'documents', label: 'Documents' },
      { id: 'slides', label: 'Slides' },
      { id: 'about', label: 'About Us' },
      { id: 'contact', label: 'Contact' },
    ],
    []
  );

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast({ visible: true, message });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast({ visible: false, message: '' });
      toastTimeoutRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection((entry.target as HTMLElement).id);
          }
        }
      },
      { threshold: 0.3 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handlePlaceholder = (
    e: React.MouseEvent,
    message: string
  ) => {
    e.preventDefault();
    showToast(message);
  };

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    img.style.display = 'none';
    const placeholder = img.nextElementSibling as HTMLElement | null;
    if (placeholder) placeholder.style.display = 'flex';
  };

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.fname.trim() || !contact.email.trim()) {
      showToast('⚠ Please fill in required fields');
      return;
    }

    setIsSending(true);
    try {
      const name = `${contact.fname}${contact.lname ? ` ${contact.lname}` : ''}`.trim();
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: contact.email,
          subject: contact.subject || 'Contact Form Message',
          message: contact.message,
        }),
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        showToast(`⚠ ${data.message || 'Failed to send message'}`);
        return;
      }

      showToast('✓ Message sent! We will get back to you soon.');
      setContact({ fname: '', lname: '', email: '', subject: '', message: '' });
    } catch {
      showToast('⚠ An error occurred. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>SLM for Sri Lankan Legal Applications</title>
      </Head>

      {/* ── HEADER ── */}
      <header>
        <nav>
          <a href="#home" className="logo">
            <img
      src="/Assets/full_dark_logo.svg"
      alt="SLM Legal AI Logo"
      className="logo-image"
          />
            {/* <div className="logo-text">
              SLM · Legal AI
              <span>SLIIT Research Project · 2025/26</span>
            </div> */}
          </a>
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={activeSection === item.id ? 'active' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section id="home">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-badge">
            SLIIT · Department of Information Technology · April 2026
          </div>
          <h1 className="hero-title">
            Small Language Models<br />for <span className="gold">Sri Lankan Legal</span>{' '}
            Applications
          </h1>
          <p className="hero-sub">
            AI-Powered Legal Intelligence — Accessible, Accurate &amp; Affordable
          </p>
          <p className="hero-abstract">
            This research presents an AI-driven framework leveraging Small
            Language Models (SLMs) integrated with Retrieval-Augmented Generation
            (RAG) and agentic architectures to democratize legal knowledge in Sri
            Lanka. The system spans four specialized domains: Labour &amp;
            Employment law guidance, Property &amp; Family law advisory, Criminal
            case outcome prediction, and intelligent Deed document verification.
          </p>
          <div className="hero-btns">
            <a href="#domain" className="btn btn-gold">
              Explore Research ↓
            </a>
            <a href="#documents" className="btn btn-outline">
              View Documents
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">4</div>
              <div className="stat-label">Research Components</div>
            </div>
            <div className="stat">
              <div className="stat-num">4</div>
              <div className="stat-label">Team Members</div>
            </div>
            <div className="stat">
              <div className="stat-num">93%</div>
              <div className="stat-label">System Accuracy</div>
            </div>
            <div className="stat">
              <div className="stat-num">SLM</div>
              <div className="stat-label">Technology Core</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOMAIN ── */}
      <section id="domain">
        <div className="section-inner">
          <div className="section-label">Domain</div>
          <h2 className="section-title">
            Research <span className="accent">Domain</span>
          </h2>
          <div className="gold-divider" />
          <p className="section-desc">
            A comprehensive exploration of legal AI systems tailored for the Sri
            Lankan legal context, combining SLMs, RAG frameworks, and agentic
            workflows.
          </p>

          <div className="domain-tabs">
            {[
              { key: 'literature', label: 'Literature Survey' },
              { key: 'gap', label: 'Research Gap' },
              { key: 'problem', label: 'Research Problem' },
              { key: 'objectives', label: 'Objectives' },
              { key: 'methodology', label: 'Methodology' },
              { key: 'technologies', label: 'Technologies' },
              { key: 'components', label: 'Components' },
            ].map((t) => (
              <button
                key={t.key}
                className={`tab-btn${activeTab === t.key ? ' active' : ''}`}
                onClick={() => setActiveTab(t.key)}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Literature */}
          <div
            id="tab-literature"
            className={`tab-content${activeTab === 'literature' ? ' active' : ''}`}
          >
            <div className="info-card">
              <h3>Background &amp; Literature Survey</h3>
              <p>
                The legal system plays a critical role in maintaining justice,
                fairness, and social order. In Sri Lanka, legal knowledge is
                confined to professionals or documented in complex texts,
                creating significant barriers for ordinary citizens. Labour
                disputes, property transfers, family disputes, and criminal
                litigation all require specialized understanding that most
                citizens lack.
              </p>
              <p>
                Recent advancements in AI, particularly Natural Language
                Processing (NLP), offer promising solutions. The digitization of
                court judgments and legal documents has created opportunities for
                computational analysis. Research in Legal NLP has evolved from
                keyword-based systems to sophisticated transformer-based models
                like BERT, LEGAL-BERT, and domain-specific LLMs.
              </p>
              <p>
                However, most existing systems — LawLLM (US), LawGPT (China),
                Swiss-BERT variants — are jurisdiction-specific and
                computationally expensive, limiting their applicability to Sri
                Lanka's unique legal ecosystem, which blends Roman-Dutch law,
                English common law, and customary traditions.
              </p>
            </div>
            <div className="info-card">
              <h3>Key Findings from Literature</h3>
              <p>
                <strong>LLM-based approaches</strong> demonstrate strong
                reasoning but suffer from jurisdictional overfitting, high
                computational cost, and hallucination risks. They are not
                directly transferable to Sri Lanka.
              </p>
              <p>
                <strong>RAG-based systems</strong> improve factual grounding but
                often lack structured output generation, validation mechanisms,
                and user-friendly interfaces essential for non-expert users.
              </p>
              <p>
                <strong>Small Language Models</strong> offer a compelling
                balance — lower computational overhead, efficient fine-tuning via
                LoRA/QLoRA, and strong domain adaptation capabilities when
                trained on curated legal datasets.
              </p>
            </div>
            <div style={{ overflowX: 'auto', marginTop: 16 }}>
              <table className="research-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Quick Check</th>
                    <th>LawRec</th>
                    <th>Legal Query RAG</th>
                    <th>Our System</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Transformer Models</td>
                    <td className="badge-no">No</td>
                    <td className="badge-yes">Yes (BERT)</td>
                    <td className="badge-yes">Yes</td>
                    <td className="badge-yes">Yes</td>
                  </tr>
                  <tr>
                    <td>RAG Integration</td>
                    <td className="badge-no">No</td>
                    <td className="badge-no">No</td>
                    <td className="badge-yes">Yes</td>
                    <td className="badge-yes">Yes</td>
                  </tr>
                  <tr>
                    <td>Sri Lankan Focus</td>
                    <td className="badge-no">No</td>
                    <td className="badge-no">No</td>
                    <td className="badge-no">No</td>
                    <td className="badge-yes">Yes</td>
                  </tr>
                  <tr>
                    <td>Natural Language Queries</td>
                    <td>Partial</td>
                    <td>Partial</td>
                    <td className="badge-yes">Yes</td>
                    <td className="badge-yes">Yes</td>
                  </tr>
                  <tr>
                    <td>Structured Legal Output</td>
                    <td className="badge-no">No</td>
                    <td className="badge-no">No</td>
                    <td>Partial</td>
                    <td className="badge-yes">Yes</td>
                  </tr>
                  <tr>
                    <td>Scalability</td>
                    <td>Medium</td>
                    <td>Medium</td>
                    <td>Medium</td>
                    <td className="badge-yes">High</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Gap */}
          <div
            id="tab-gap"
            className={`tab-content${activeTab === 'gap' ? ' active' : ''}`}
          >
            <div className="info-card">
              <h3>Identified Research Gaps</h3>
              <p>
                Despite significant advances in legal AI globally, critical gaps
                remain for the Sri Lankan context:
              </p>
              <ul
                style={{
                  paddingLeft: 20,
                  marginTop: 12,
                  fontSize: 16,
                  color: '#3d4f6e',
                  lineHeight: 1.9,
                }}
              >
                <li>
                  No fine-tuned transformer models specifically for Sri Lankan
                  Labour, Property, Family, or Criminal Law
                </li>
                <li>Absence of RAG frameworks adapted to Sri Lankan legal datasets</li>
                <li>
                  No structured criminal outcome classification studies for Sri
                  Lanka
                </li>
                <li>
                  Inability of existing systems to process natural language
                  queries with high precision in local context
                </li>
                <li>
                  Lack of structured legal output (Act name, Section, Year, Case
                  references)
                </li>
                <li>
                  No scenario-based or step-by-step legal explanation for
                  non-experts
                </li>
                <li>
                  Absence of deed verification systems tailored to Sri Lankan
                  property documents
                </li>
                <li>
                  Limited accessibility for non-expert users due to complex
                  interfaces
                </li>
              </ul>
            </div>
            <div className="info-card">
              <h3>Jurisdictional Concentration Problem</h3>
              <p>
                Most Legal NLP research concentrates on the United States
                Supreme Court, European Court of Human Rights, Chinese criminal
                courts, and Swiss Federal Supreme Court. These systems benefit
                from well-digitized databases and large labeled datasets. Sri
                Lanka, with its hybrid Roman-Dutch and English common law system,
                represents a significantly underexplored jurisdiction with unique
                challenges: limited digitized data, multilingual content
                (Sinhala, Tamil, English), inconsistent document formats, and no
                standard benchmark datasets.
              </p>
            </div>
          </div>

          {/* Problem */}
          <div
            id="tab-problem"
            className={`tab-content${activeTab === 'problem' ? ' active' : ''}`}
          >
            <div className="info-card">
              <h3>Research Problem Statement</h3>
              <p>
                Despite the increasing need for efficient and accessible legal
                information systems, Sri Lanka currently lacks AI-driven legal
                frameworks that integrate modern NLP, transformer-based models,
                and Retrieval-Augmented Generation — specifically tailored for
                its unique legal domains.
              </p>
              <p>
                This absence creates significant barriers to legal accessibility,
                reduces efficiency in legal research and decision-making, and
                contributes to inequality in access to legal knowledge among
                citizens and professionals. A survey of 40 participants (lawyers,
                law students, general public) revealed:
              </p>
              <ul
                style={{
                  paddingLeft: 20,
                  marginTop: 12,
                  fontSize: 16,
                  color: '#3d4f6e',
                  lineHeight: 1.9,
                }}
              >
                <li>
                  <strong>90%+</strong> identified the need for an intelligent
                  legal decision-support system
                </li>
                <li>Significant delays in accessing relevant legal documents</li>
                <li>Difficulty interpreting fragmented and technical legal language</li>
                <li>
                  Lack of user-friendly systems supporting natural language
                  queries
                </li>
              </ul>
            </div>
          </div>

          {/* Objectives */}
          <div
            id="tab-objectives"
            className={`tab-content${activeTab === 'objectives' ? ' active' : ''}`}
          >
            <div className="info-card">
              <h3>Main Objective</h3>
              <p>
                To develop specialized AI-based legal assistance systems for Sri
                Lankan law domains that provide reliable, context-aware, and
                structured legal guidance — combining fine-tuned Small Language
                Models with retrieval-augmented mechanisms grounded in
                authoritative legal sources.
              </p>
            </div>
            <div className="info-card">
              <h3>Specific Objectives</h3>
              <ul
                style={{
                  paddingLeft: 20,
                  marginTop: 8,
                  fontSize: 16,
                  color: '#3d4f6e',
                  lineHeight: 1.95,
                }}
              >
                <li>
                  Transform unstructured Sri Lankan legal resources into
                  structured, machine-readable training datasets
                </li>
                <li>
                  Fine-tune transformer-based SLMs (Qwen3-8B, LEGAL-BERT-SMALL)
                  on domain-specific datasets
                </li>
                <li>
                  Design consistent structured output formats ensuring legal
                  elements (Act, Section, Year) are always present
                </li>
                <li>
                  Integrate RAG frameworks grounding outputs in verified legal
                  documents via FAISS vector search
                </li>
                <li>
                  Enable practical recommendations for real-world workplace,
                  property, family, and criminal disputes
                </li>
                <li>
                  Develop scalable deployment pipelines ensuring low-latency,
                  production-level accessibility
                </li>
                <li>Build user-friendly web interfaces accessible to non-expert users</li>
              </ul>
            </div>
          </div>

          {/* Methodology */}
          <div
            id="tab-methodology"
            className={`tab-content${activeTab === 'methodology' ? ' active' : ''}`}
          >
            <div className="info-card">
              <h3>System Methodology Overview</h3>
              <p>
                All four research components follow a unified, multi-layered
                methodology that integrates legal data engineering, model
                adaptation, retrieval design, system integration, and rigorous
                evaluation. The Agile development framework enables iterative
                improvement with measurable artifacts at each stage.
              </p>
            </div>
            <div className="timeline">
              <div className="tl-item">
                <div className="tl-dot" />
                <h4>Phase 1 — Data Collection &amp; OCR Processing</h4>
                <p className="tl-meta">Weeks 1–4</p>
                <p>
                  Collection of legal materials from digital repositories, law
                  books, and physical archives. OCR-based digitization of scanned
                  documents with quality scoring. Multilingual handling (Sinhala,
                  Tamil, English).
                </p>
              </div>
              <div className="tl-item">
                <div className="tl-dot" />
                <h4>Phase 2 — Dataset Construction &amp; Governance</h4>
                <p className="tl-meta">Weeks 5–8</p>
                <p>
                  Cleaning, normalization, and JSONL formatting. Schema
                  validation ensuring consistent instruction-context-output
                  structure. Train/validation/test splitting with leakage
                  prevention.
                </p>
              </div>
              <div className="tl-item">
                <div className="tl-dot" />
                <h4>Phase 3 — Model Fine-Tuning</h4>
                <p className="tl-meta">Weeks 9–14</p>
                <p>
                  LoRA/QLoRA-based fine-tuning using Unsloth. Domain adaptation
                  for Qwen3-8B (legal recommendation), LEGAL-BERT-SMALL (criminal
                  prediction). Structured output alignment training.
                </p>
              </div>
              <div className="tl-item">
                <div className="tl-dot" />
                <h4>Phase 4 — RAG &amp; Vector Indexing</h4>
                <p className="tl-meta">Weeks 13–18</p>
                <p>
                  FAISS index construction from legal document embeddings.
                  Document-diverse reranking. Agentic RAG with LangGraph
                  orchestration: classify → retrieve → grade → generate → validate.
                </p>
              </div>
              <div className="tl-item">
                <div className="tl-dot" />
                <h4>Phase 5 — System Integration &amp; Evaluation</h4>
                <p className="tl-meta">Weeks 19–24</p>
                <p>
                  FastAPI backend with modular microservices. React frontend.
                  Multi-layer evaluation (model-level, retrieval-level,
                  system-level). End-to-end testing and iterative refinement.
                </p>
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div
            id="tab-technologies"
            className={`tab-content${activeTab === 'technologies' ? ' active' : ''}`}
          >
            <div className="info-card">
              <h3>Core Technologies</h3>
              <p>
                The research employs a carefully selected technology stack
                balancing capability, efficiency, and deployability.
              </p>
              <div className="tech-tags">
                <span className="tech-tag">Qwen3-8B</span>
                <span className="tech-tag">LEGAL-BERT-SMALL</span>
                <span className="tech-tag">LoRA / QLoRA</span>
                <span className="tech-tag">Unsloth</span>
                <span className="tech-tag">FAISS Vector DB</span>
                <span className="tech-tag">RAG Framework</span>
                <span className="tech-tag">LangGraph</span>
                <span className="tech-tag">FastAPI</span>
                <span className="tech-tag">PostgreSQL</span>
                <span className="tech-tag">React 18</span>
                <span className="tech-tag">Sentence Transformers</span>
                <span className="tech-tag">PyTorch</span>
                <span className="tech-tag">HuggingFace</span>
                <span className="tech-tag">Modal (GPU)</span>
                <span className="tech-tag">Ollama</span>
                <span className="tech-tag">OCR Pipeline</span>
                <span className="tech-tag">Gemini Embeddings</span>
                <span className="tech-tag">AdamW Optimizer</span>
                <span className="tech-tag">TanStack Query</span>
                <span className="tech-tag">Tailwind CSS</span>
                <span className="tech-tag">Pydantic</span>
                <span className="tech-tag">LangChain</span>
              </div>
            </div>
          </div>

          {/* Components */}
          <div
            id="tab-components"
            className={`tab-content${activeTab === 'components' ? ' active' : ''}`}
          >
            <div className="components-grid">
              <div className="comp-card">
                <div className="comp-num">01</div>
                <h4>Labour &amp; Employment Law Recommendation</h4>
                <p>
                  SLM + RAG system accepting natural language queries, outputting
                  structured legal recommendations with applicable Act, Section,
                  Year, and analogous case scenarios.
                </p>
                <span className="member-tag">IT22322326 — E. Niruththika</span>
              </div>
              <div className="comp-card">
                <div className="comp-num">02</div>
                <h4>Criminal Case Outcome Prediction</h4>
                <p>
                  LEGAL-BERT-SMALL fine-tuned on 890 Sri Lankan criminal judgments
                  (2021–2025) for multi-class outcome classification — convicted,
                  acquitted, sentence reduced, etc.
                </p>
                <span className="member-tag">IT22049322 — Abiramy.T</span>
              </div>
              <div className="comp-card">
                <div className="comp-num">03</div>
                <h4>Property &amp; Family Law Guidance</h4>
                <p>
                  Agentic RAG system providing step-by-step legal guidance for
                  Property Law and Family Law — fine-tuned Qwen3-1.7B with 4,700+
                  structured JSONL entries.
                </p>
                <span className="member-tag">IT22177032 — E.S. Mathusigan</span>
              </div>
              <div className="comp-card">
                <div className="comp-num">04</div>
                <h4>Deed Document Verification Agent</h4>
                <p>
                  Multi-agent template matching for 5 deed types (Sale, Gift,
                  Mortgage, Power of Attorney, Testamentary). 99.13%
                  classification accuracy with rule-based legal validation.
                </p>
                <span className="member-tag">IT22030412 — A. Thuvaraga</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MILESTONES ── */}
      <section id="milestones">
        <div className="section-inner">
          <div className="section-label">Milestones</div>
          <h2 className="section-title">
            Project <span className="accent">Milestones</span>
          </h2>
          <div className="gold-divider" />
          <p className="section-desc">
            Track the progression of our research through key assessment
            milestones and deliverables.
          </p>

          <div className="milestone-select-wrap">
            <p className="milestone-select-label">Select Assessment</p>
            <select
              className="milestone-select"
              value={activeMilestone}
              onChange={(e) => setActiveMilestone(e.target.value)}
            >
              <option value="proposal">Project Proposal</option>
              <option value="pp1">Progress Presentation I</option>
              <option value="pp2">Progress Presentation II</option>
              <option value="final">Final Assessment</option>
              <option value="viva">Research Viva</option>
            </select>
          </div>

          <div
            id="ms-proposal"
            className={`milestone-detail${activeMilestone === 'proposal' ? ' active' : ''}`}
          >
            <div className="milestone-card">
              <div className="milestone-header">
                <div className="milestone-title-area">
                  <h3>Project Proposal</h3>
                  <p>
                    Initial research proposal outlining problem statement,
                    objectives, and planned approach
                  </p>
                </div>
                <div className="milestone-meta">
                  <div className="milestone-date">August 2025</div>
                  <div className="milestone-marks">
                    Completed <span>/ Submitted</span>
                  </div>
                </div>
              </div>
              <div className="milestone-body">
                <p>
                  The project proposal established the foundational research
                  framework for all four components. It defined the research
                  problem — the lack of AI-driven legal systems tailored for Sri
                  Lanka — and proposed an integrated approach combining Small
                  Language Models with RAG architectures.
                </p>
                <ul>
                  <li>Defined research objectives and scope for all four sub-projects</li>
                  <li>
                    Conducted preliminary literature review across Legal NLP,
                    SLMs, and RAG systems
                  </li>
                  <li>Proposed system architectures for each domain component</li>
                  <li>
                    Identified data sources: Sri Lankan court databases, law
                    books, regulatory documents
                  </li>
                  <li>
                    Received supervisor approval from Dr. Prasanna Sumathipala
                    and Ms. Karthiga Rajendran
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div
            id="ms-pp1"
            className={`milestone-detail${activeMilestone === 'pp1' ? ' active' : ''}`}
          >
            <div className="milestone-card">
              <div className="milestone-header">
                <div className="milestone-title-area">
                  <h3>Progress Presentation I</h3>
                  <p>
                    First progress evaluation demonstrating initial
                    implementation and data preparation
                  </p>
                </div>
                <div className="milestone-meta">
                  <div className="milestone-date">November 2025</div>
                  <div className="milestone-marks">
                    Completed <span>/ Evaluated</span>
                  </div>
                </div>
              </div>
              <div className="milestone-body">
                <p>
                  The first progress presentation demonstrated the data pipeline,
                  initial model experiments, and early system prototypes for all
                  four research components.
                </p>
                <ul>
                  <li>
                    Labour Law: FAISS vector database with 6,313 embeddings (100
                    documents indexed)
                  </li>
                  <li>
                    Criminal Law: 890-case dataset collected and structured into
                    JSON format
                  </li>
                  <li>
                    Property/Family Law: 4,700 JSONL dataset entries prepared
                    from legal materials
                  </li>
                  <li>
                    Deed Verification: 1,500+ deed samples labeled across 5 deed
                    types
                  </li>
                  <li>Initial fine-tuning experiments completed with baseline evaluations</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            id="ms-pp2"
            className={`milestone-detail${activeMilestone === 'pp2' ? ' active' : ''}`}
          >
            <div className="milestone-card">
              <div className="milestone-header">
                <div className="milestone-title-area">
                  <h3>Progress Presentation II</h3>
                  <p>
                    Second evaluation showing system integration, testing
                    results, and refined models
                  </p>
                </div>
                <div className="milestone-meta">
                  <div className="milestone-date">January 2026</div>
                  <div className="milestone-marks">
                    Completed <span>/ Evaluated</span>
                  </div>
                </div>
              </div>
              <div className="milestone-body">
                <p>
                  Demonstrated functional prototypes with integrated RAG
                  pipelines, agent-based workflows, and initial evaluation
                  metrics across all components.
                </p>
                <ul>
                  <li>
                    Labour Law system: 93.5/100 end-to-end score, 100% schema
                    compliance, 90% retrieval accuracy
                  </li>
                  <li>
                    Criminal system: LEGAL-BERT-SMALL achieving 67% accuracy,
                    0.61 Macro F1 across 11 classes
                  </li>
                  <li>
                    Property/Family Law: RAG system achieving best balance of
                    accuracy and usability
                  </li>
                  <li>
                    Deed Agent: Fine-tuned classifier reaching 99.13% accuracy
                    across 5 deed types
                  </li>
                  <li>FastAPI backends operational with full LangGraph orchestration</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            id="ms-final"
            className={`milestone-detail${activeMilestone === 'final' ? ' active' : ''}`}
          >
            <div className="milestone-card">
              <div className="milestone-header">
                <div className="milestone-title-area">
                  <h3>Final Assessment</h3>
                  <p>
                    Complete system evaluation, final report submission, and
                    comprehensive demonstration
                  </p>
                </div>
                <div className="milestone-meta">
                  <div className="milestone-date">April 2026</div>
                  <div className="milestone-marks">
                    Submitted <span>/ April 2026</span>
                  </div>
                </div>
              </div>
              <div className="milestone-body">
                <p>
                  Final submission of all four research components with complete
                  documentation, evaluation reports, and fully deployed web
                  applications.
                </p>
                <ul>
                  <li>
                    All four final reports submitted: Labour Law, Criminal
                    Prediction, Property/Family Law, Deed Verification
                  </li>
                  <li>
                    Complete system testing: 103 tests executed (93% pass rate —
                    420/450 score, Excellent grade)
                  </li>
                  <li>
                    Deployed web applications for all components with React
                    frontends and FastAPI backends
                  </li>
                  <li>
                    Comprehensive evaluation reports with multi-layer validation
                    methodology
                  </li>
                  <li>Research paper manuscripts prepared for academic submission</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            id="ms-viva"
            className={`milestone-detail${activeMilestone === 'viva' ? ' active' : ''}`}
          >
            <div className="milestone-card">
              <div className="milestone-header">
                <div className="milestone-title-area">
                  <h3>Research Viva</h3>
                  <p>Oral defense and examination of the research work by panel</p>
                </div>
                <div className="milestone-meta">
                  <div className="milestone-date">TBD — 2026</div>
                  <div className="milestone-marks">
                    Upcoming <span>/ Scheduled</span>
                  </div>
                </div>
              </div>
              <div className="milestone-body">
                <p>
                  The research viva will involve a comprehensive oral
                  examination by an academic panel evaluating the depth,
                  validity, and significance of all four research components.
                </p>
                <ul>
                  <li>Presentation of full system capabilities and research contributions</li>
                  <li>Technical defense of methodology, model choices, and evaluation metrics</li>
                  <li>Discussion of limitations, ethical considerations, and future scope</li>
                  <li>Demonstration of live system across all four legal domains</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOCUMENTS ── */}
      <section id="documents">
        <div className="section-inner">
          <div className="section-label">Documents</div>
          <h2 className="section-title">
            Project <span className="accent">Documents</span>
          </h2>
          <div className="gold-divider" />
          <p className="section-desc">
            All research documents produced throughout the project lifecycle.
            Click download to access each document.
          </p>

          <div className="docs-grid">
            <div className="doc-card">
              <div className="doc-icon">📋</div>
              <h4>Project Charter</h4>
              <p>
                Formal project initiation document outlining scope, stakeholders,
                objectives, and governance structure for all four research
                components.
              </p>
              <div className="doc-meta">
                <span className="doc-type">PDF · Charter</span>
                <span className="doc-status status-ready">Available</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a
                  href="#"
                  className="doc-download"
                  onClick={(e) =>
                    handlePlaceholder(
                      e,
                      '📄 Project_Charter_SLM_Legal.pdf — Place your PDF file at this path'
                    )
                  }
                >
                  ⬇ Download
                </a>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-icon">📄</div>
              <h4>Project Proposal Document</h4>
              <p>
                Comprehensive research proposal covering literature review,
                problem statement, research objectives, methodology, and
                feasibility analysis.
              </p>
              <div className="doc-meta">
                <span className="doc-type">PDF · Proposal</span>
                <span className="doc-status status-ready">Available</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a
                  href="#"
                  className="doc-download"
                  onClick={(e) =>
                    handlePlaceholder(
                      e,
                      '📄 Project_Proposal_SLM_Legal.pdf — Place your PDF file at this path'
                    )
                  }
                >
                  ⬇ Download
                </a>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-icon">🧾</div>
              <h4>Proposal Report — Labour Law (IT22322326)</h4>
              <p>
                E. Niruththika's individual project proposal report for the
                Labour &amp; Employment Law recommendation system.
              </p>
              <div className="doc-meta">
                <span className="doc-type">PDF · Proposal</span>
                <span className="doc-status status-ready">Available</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a
                  href="/Assets/Niruththika%20E%20IT22322326%20proposal%20report.pdf"
                  className="doc-download"
                  download
                >
                  ⬇ Download
                </a>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-icon">🧾</div>
              <h4>Proposal Report — Criminal Prediction (IT22049322)</h4>
              <p>
                Abiramy.T's individual project proposal report for the criminal
                case outcome prediction system.
              </p>
              <div className="doc-meta">
                <span className="doc-type">PDF · Proposal</span>
                <span className="doc-status status-ready">Available</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a
                  href="/Assets/IT22049322_Abiramy_project_proposal_final.pdf"
                  className="doc-download"
                  download
                >
                  ⬇ Download
                </a>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-icon">🧾</div>
              <h4>Proposal Report — Property &amp; Family Law (IT22177032)</h4>
              <p>
                E.S. Mathusigan's individual project proposal report for the
                property and family law guidance system.
              </p>
              <div className="doc-meta">
                <span className="doc-type">PDF · Proposal</span>
                <span className="doc-status status-ready">Available</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a
                  href="/Assets/IT22177032%20Mathusigan%20Senthan%20PROPOSAL_FINAL_REPORT%20%20(1).pdf"
                  className="doc-download"
                  download
                >
                  ⬇ Download
                </a>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-icon">🧾</div>
              <h4>Proposal Report — Deed Verification (IT22030412)</h4>
              <p>
                A. Thuvaraga's individual project proposal report for the deed
                document verification agent.
              </p>
              <div className="doc-meta">
                <span className="doc-type">PDF · Proposal</span>
                <span className="doc-status status-ready">Available</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a
                  href="/Assets/IT22030412%20Thuvaraga%20final%20proposal%20updated%20report%20(1).pdf"
                  className="doc-download"
                  download
                >
                  ⬇ Download
                </a>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-icon">📊</div>
              <h4>Final Report — Labour Law (IT22322326)</h4>
              <p>
                E. Niruththika's final research report on the Labour and
                Employment Law Recommendation System using Qwen3-8B + RAG.
              </p>
              <div className="doc-meta">
                <span className="doc-type">PDF · Final Report</span>
                <span className="doc-status status-ready">Available</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a
                  href="/Assets/Niruthika%20IT22322326%20Final%20doc.pdf"
                  className="doc-download"
                  download
                >
                  ⬇ Download
                </a>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-icon">⚖️</div>
              <h4>Final Report — Criminal Prediction (IT22049322)</h4>
              <p>
                Abiramy.T's final research report on criminal judicial outcome
                prediction using LEGAL-BERT-SMALL on Sri Lankan High Court
                judgments.
              </p>
              <div className="doc-meta">
                <span className="doc-type">PDF · Final Report</span>
                <span className="doc-status status-ready">Available</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a
                  href="/Assets/Abiramy%20final%20doc%20IT22049322%20.pdf"
                  className="doc-download"
                  download
                >
                  ⬇ Download
                </a>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-icon">🏠</div>
              <h4>Final Report — Property &amp; Family Law (IT22177032)</h4>
              <p>
                E.S. Mathusigan's report on step-by-step legal guidance for
                Property and Family Law using Agentic RAG with Qwen3-1.7B.
              </p>
              <div className="doc-meta">
                <span className="doc-type">PDF · Final Report</span>
                <span className="doc-status status-ready">Available</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a
                  href="/Assets/IT22177032_%20Mathusigan%20_Final_Report_research%20doc.pdf"
                  className="doc-download"
                  download
                >
                  ⬇ Download
                </a>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-icon">📜</div>
              <h4>Final Report — Deed Verification (IT22030412)</h4>
              <p>
                A. Thuvaraga's report on the multi-agent deed template matching
                system achieving 99.13% classification accuracy.
              </p>
              <div className="doc-meta">
                <span className="doc-type">PDF · Final Report</span>
                <span className="doc-status status-ready">Available</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a
                  href="/Assets/Thuvaraha%20_Final_Report%20doc.pdf"
                  className="doc-download"
                  download
                >
                  ⬇ Download
                </a>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-icon">✅</div>
              <h4>Check List Documents</h4>
              <p>
                Assessment check lists and progress tracking documents for all
                project milestones and deliverables.
              </p>
              <div className="doc-meta">
                <span className="doc-type">PDF · Checklist</span>
                <span className="doc-status status-ready">Available</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a href="/Assets/check%20list.md" className="doc-download" download>
                  ⬇ Download
                </a>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-icon">📈</div>
              <h4>Status Document — Progress Report</h4>
              <p>
                Consolidated progress status document covering all four
                sub-projects with current development milestones and results
                summary.
              </p>
              <div className="doc-meta">
                <span className="doc-type">PDF · Status</span>
                <span className="doc-status status-pending">In Progress</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a
                  href="#"
                  className="doc-download"
                  onClick={(e) =>
                    handlePlaceholder(
                      e,
                      '📄 Status_Document_SLM_Legal.pdf — Place your PDF file at this path'
                    )
                  }
                >
                  ⬇ Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SLIDES ── */}
      <section id="slides">
        <div className="section-inner">
          <div className="section-label">Presentations</div>
          <h2 className="section-title">
            Presentation <span className="accent">Slides</span>
          </h2>
          <div className="gold-divider" />
          <p className="section-desc">
            Slide decks from all research presentations across the project
            lifecycle.
          </p>

          <div className="slides-grid">
            <div className="slide-card">
              <div
                className="slide-preview"
                style={{ background: 'linear-gradient(135deg, #0a1628, #1e3a5f)' }}
              >
                <div className="slide-preview-inner">
                  <div className="slide-logo">⚖</div>
                  <div className="slide-lines">
                    <div className="slide-line" />
                    <div className="slide-line" />
                    <div className="slide-line" />
                  </div>
                </div>
              </div>
              <div className="slide-card-body">
                <h4>Proposal Presentation</h4>
                <p>
                  Initial research proposal presentation — problem, objectives,
                  methodology overview
                </p>
                <div className="slide-actions">
                  <a
                    href="/Assets/proposal%20presentation%20final%20(1).pptx"
                    className="slide-btn primary"
                    target="_blank"
                    rel="noopener"
                  >
                    View
                  </a>
                  <a
                    href="/Assets/proposal%20presentation%20final%20(1).pptx"
                    className="slide-btn"
                    download
                  >
                    ⬇ PPTX
                  </a>
                </div>
              </div>
            </div>

            <div className="slide-card">
              <div
                className="slide-preview"
                style={{ background: 'linear-gradient(135deg, #12243d, #2d5016)' }}
              >
                <div className="slide-preview-inner">
                  <div className="slide-logo" style={{ color: '#6ee7a0' }}>
                    PP1
                  </div>
                  <div className="slide-lines">
                    <div
                      className="slide-line"
                      style={{ background: 'rgba(110,231,160,0.3)' }}
                    />
                    <div
                      className="slide-line"
                      style={{ background: 'rgba(110,231,160,0.3)' }}
                    />
                    <div
                      className="slide-line"
                      style={{ background: 'rgba(110,231,160,0.3)' }}
                    />
                  </div>
                </div>
              </div>
              <div className="slide-card-body">
                <h4>Progress Presentation I</h4>
                <p>
                  First milestone presentation — dataset preparation, initial
                  models, early results
                </p>
                <div className="slide-actions">
                  <a
                    href="/Assets/pp1Final%2025-26J-240%20.pptx"
                    className="slide-btn primary"
                    target="_blank"
                    rel="noopener"
                  >
                    View
                  </a>
                  <a
                    href="/Assets/pp1Final%2025-26J-240%20.pptx"
                    className="slide-btn"
                    download
                  >
                    ⬇ PPTX
                  </a>
                </div>
              </div>
            </div>

            <div className="slide-card">
              <div
                className="slide-preview"
                style={{ background: 'linear-gradient(135deg, #1e3a5f, #5f1e3a)' }}
              >
                <div className="slide-preview-inner">
                  <div className="slide-logo" style={{ color: '#f9a8d4' }}>
                    PP2
                  </div>
                  <div className="slide-lines">
                    <div
                      className="slide-line"
                      style={{ background: 'rgba(249,168,212,0.3)' }}
                    />
                    <div
                      className="slide-line"
                      style={{ background: 'rgba(249,168,212,0.3)' }}
                    />
                    <div
                      className="slide-line"
                      style={{ background: 'rgba(249,168,212,0.3)' }}
                    />
                  </div>
                </div>
              </div>
              <div className="slide-card-body">
                <h4>Progress Presentation II</h4>
                <p>
                  Second milestone — integrated systems, evaluation metrics,
                  refined architectures
                </p>
                <div className="slide-actions">
                  <a
                    href="/Assets/pp2Final%2025-26J-240%20.pptx"
                    className="slide-btn primary"
                    target="_blank"
                    rel="noopener"
                  >
                    View
                  </a>
                  <a
                    href="/Assets/pp2Final%2025-26J-240%20.pptx"
                    className="slide-btn"
                    download
                  >
                    ⬇ PPTX
                  </a>
                </div>
              </div>
            </div>

            <div className="slide-card">
              <div
                className="slide-preview"
                style={{ background: 'linear-gradient(135deg, #3d1a00, #6b3a00)' }}
              >
                <div className="slide-preview-inner">
                  <div className="slide-logo">FINAL</div>
                  <div className="slide-lines">
                    <div className="slide-line" />
                    <div className="slide-line" />
                    <div className="slide-line" />
                  </div>
                </div>
              </div>
              <div className="slide-card-body">
                <h4>Final Presentation</h4>
                <p>
                  Complete research findings, system demonstrations, conclusions,
                  and future scope
                </p>
                <div className="slide-actions">
                  <a
                    href="#"
                    className="slide-btn primary"
                    onClick={(e) =>
                      handlePlaceholder(
                        e,
                        '🔍 Viewer coming soon — upload Final_Presentation_SLM_Legal.pptx'
                      )
                    }
                  >
                    View
                  </a>
                  <a
                    href="#"
                    className="slide-btn"
                    onClick={(e) =>
                      handlePlaceholder(
                        e,
                        '📊 Final_Presentation_SLM_Legal.pptx — Place your PPTX file at this path'
                      )
                    }
                  >
                    ⬇ PPTX
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about">
        <div className="section-inner">
          <div className="about-header">
            <div className="section-label" style={{ color: 'var(--gold)' }}>
              About Us
            </div>
            <h2 className="section-title">
              Our <span className="accent">Team</span>
            </h2>
            <div className="gold-divider" />
            <p className="section-desc">
              A dedicated research team from the Department of Information
              Technology, Sri Lanka Institute of Information Technology (SLIIT),
              working to make legal knowledge accessible to all Sri Lankans.
            </p>
          </div>

          <div className="supervisors">
            <div className="supervisor-card">
              <div className="supervisor-avatar">PS</div>
              <div className="supervisor-info">
                <p className="supervisor-role">Supervisor</p>
                <h4>Dr. Prasanna Sumathipala</h4>
                <p>Department of Information Technology</p>
                <p>Sri Lanka Institute of Information Technology</p>
              </div>
            </div>
            <div className="supervisor-card">
              <div className="supervisor-avatar">KR</div>
              <div className="supervisor-info">
                <p className="supervisor-role">Co-Supervisor</p>
                <h4>Ms. Karthiga Rajendran</h4>
                <p>Department of Information Technology</p>
                <p>Sri Lanka Institute of Information Technology</p>
              </div>
            </div>
          </div>

          <div className="team-grid">
            <div className="member-card">
              <div className="member-photo">
                <img
                  src="/Assets/Niruthiha%20pic.jpeg"
                  alt="E. Niruththika"
                  onError={handleImgError}
                />
                <div className="member-photo-placeholder" style={{ display: 'none' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Add Photo URL</span>
                </div>
              </div>
              <div className="member-body">
                <span className="member-id">IT22322326</span>
                <h4>E. Niruththika</h4>
                <p className="member-role">B.Sc. (Hons) Information Technology</p>
                <p className="member-focus">
                  Research Focus: Labour &amp; Employment Law Recommendation System
                  — Fine-tuned Qwen3-8B with FAISS-based RAG for structured legal
                  recommendations including Act, Section, and Year
                  identification.
                </p>
                <a href="mailto:it22322326@my.sliit.lk" className="member-email">
                  ✉ it22322326@my.sliit.lk
                </a>
              </div>
            </div>

            <div className="member-card">
              <div className="member-photo">
                <img
                  src="/Assets/Abirami%20pic.jpeg"
                  alt="Abiramy T"
                  onError={handleImgError}
                />
                <div className="member-photo-placeholder" style={{ display: 'none' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Add Photo URL</span>
                </div>
              </div>
              <div className="member-body">
                <span className="member-id">IT22049322</span>
                <h4>Abiramy.T</h4>
                <p className="member-role">B.Sc. (Hons) Information Technology</p>
                <p className="member-focus">
                  Research Focus: Criminal Case Outcome Prediction —
                  LEGAL-BERT-SMALL fine-tuned on 890 Sri Lankan criminal
                  judgments for 11-class judicial outcome classification (67%
                  accuracy, 0.61 Macro F1).
                </p>
                <a href="mailto:it22049322@my.sliit.lk" className="member-email">
                  ✉ it22049322@my.sliit.lk
                </a>
              </div>
            </div>

            <div className="member-card">
              <div className="member-photo">
                <img
                  src="/Assets/mathusigan%20pic.jpeg"
                  alt="E.S. Mathusigan"
                  onError={handleImgError}
                />
                <div className="member-photo-placeholder" style={{ display: 'none' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Add Photo URL</span>
                </div>
              </div>
              <div className="member-body">
                <span className="member-id">IT22177032</span>
                <h4>E.S. Mathusigan</h4>
                <p className="member-role">B.Sc. (Hons) Information Technology</p>
                <p className="member-focus">
                  Research Focus: Property &amp; Family Law Step-by-Step Guidance —
                  Qwen3-1.7B with Agentic RAG (LangGraph), 4,700+ JSONL training
                  samples, three-backend comparative evaluation (SLM / RAG /
                  Agentic RAG).
                </p>
                <a href="mailto:it22177032@my.sliit.lk" className="member-email">
                  ✉ it22177032@my.sliit.lk
                </a>
              </div>
            </div>

            <div className="member-card">
              <div className="member-photo">
                <img
                  src="/Assets/Thuvaraga%20pic.jpeg"
                  alt="A. Thuvaraga"
                  onError={handleImgError}
                />
                <div className="member-photo-placeholder" style={{ display: 'none' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Add Photo URL</span>
                </div>
              </div>
              <div className="member-body">
                <span className="member-id">IT22030412</span>
                <h4>A. Thuvaraga</h4>
                <p className="member-role">B.Sc. (Hons) Information Technology</p>
                <p className="member-focus">
                  Research Focus: Deed Document Template Matching Agent —
                  Multi-agent SLM system for 5 deed types (Sale, Gift, Mortgage,
                  Power of Attorney, Testamentary). 99.13% classification
                  accuracy with rule-based legal validation.
                </p>
                <a href="mailto:it22030412@my.sliit.lk" className="member-email">
                  ✉ it22030412@my.sliit.lk
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact">
        <div className="section-inner">
          <div className="section-label">Contact Us</div>
          <h2 className="section-title">
            Get In <span className="accent">Touch</span>
          </h2>
          <div className="gold-divider" />

          <div className="contact-grid">
            <div className="contact-info">
              <h3>We'd love to hear from you</h3>
              <p>
                For research enquiries, collaboration opportunities, or questions
                about our legal AI systems, please reach out through any of the
                following channels.
              </p>

              <div className="contact-detail">
                <div className="contact-detail-icon">🏛</div>
                <div className="contact-detail-text">
                  <h5>Institution</h5>
                  <p>Sri Lanka Institute of Information Technology (SLIIT)</p>
                </div>
              </div>
              <div className="contact-detail">
                <div className="contact-detail-icon">📚</div>
                <div className="contact-detail-text">
                  <h5>Department</h5>
                  <p>Department of Information Technology</p>
                </div>
              </div>
              <div className="contact-detail">
                <div className="contact-detail-icon">🌐</div>
                <div className="contact-detail-text">
                  <h5>Project Website</h5>
                  <p>cdap.sliit.lk</p>
                </div>
              </div>
              <div className="contact-detail">
                <div className="contact-detail-icon">📧</div>
                <div className="contact-detail-text">
                  <h5>Research Supervisor</h5>
                  <p>Dr. Prasanna Sumathipala — SLIIT</p>
                </div>
              </div>
              <div className="contact-detail">
                <div className="contact-detail-icon">📅</div>
                <div className="contact-detail-text">
                  <h5>Academic Year</h5>
                  <p>2025 / 2026 — Final Year Research Project</p>
                </div>
              </div>
            </div>

            <div className="contact-form">
              <form onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fname">First Name</label>
                    <input
                      type="text"
                      id="fname"
                      name="fname"
                      className="form-control"
                      placeholder="Your first name"
                      value={contact.fname}
                      onChange={handleContactChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lname">Last Name</label>
                    <input
                      type="text"
                      id="lname"
                      name="lname"
                      className="form-control"
                      placeholder="Your last name"
                      value={contact.lname}
                      onChange={handleContactChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="your@email.com"
                    value={contact.email}
                    onChange={handleContactChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="form-control"
                    placeholder="Research inquiry / Collaboration / General"
                    value={contact.subject}
                    onChange={handleContactChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-control"
                    placeholder="Tell us about your inquiry..."
                    value={contact.message}
                    onChange={handleContactChange}
                  />
                </div>
                <button className="form-submit" type="submit" disabled={isSending}>
                  {isSending ? 'Sending…' : 'Send Message →'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-copy">
            © 2026 <strong>SLM for Sri Lankan Legal Applications</strong> —
            Department of IT, SLIIT
            <br />
            <span style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
              Supervised by Dr. Prasanna Sumathipala · Co-supervised by Ms.
              Karthiga Rajendran
            </span>
          </div>
          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#domain">Domain</a>
            <a href="#milestones">Milestones</a>
            <a href="#documents">Documents</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>

      {/* ── SCROLL TOP ── */}
      <button
        id="scrollTop"
        className={showScrollTop ? 'show' : undefined}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        ↑
      </button>

      {/* ── TOAST ── */}
      <div
        id="toast"
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: toast.visible
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(80px)',
          background: 'var(--navy)',
          color: 'var(--gold)',
          border: '1px solid var(--border)',
          padding: '14px 28px',
          borderRadius: 50,
          fontFamily: "'Space Mono',monospace",
          fontSize: 12,
          letterSpacing: '0.06em',
          transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 9999,
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          opacity: toast.visible ? 1 : 0,
          pointerEvents: toast.visible ? 'all' : 'none',
        }}
      >
        {toast.message}
      </div>
    </>
  );
};

export default Home;
