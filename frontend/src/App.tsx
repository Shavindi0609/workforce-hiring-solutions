 /* import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App */


import { useState } from 'react';
import SkillsExperienceForm from './Candidate/SkillsExperience';
import type { CandidateFormData } from './types/candidate';
import logo from './assets/logo.png'; // Make sure your logo image is placed here

function App() {
  const [formData, setFormData] = useState<CandidateFormData>({
    skills: ['React', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript'],
    status: '',
    salaryRange: '',
    availability: '',
    willingToContact: ''
  });

  const updateFormData = (newData: Partial<CandidateFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const steps = [
    { id: 1, name: 'Basic Information' },
    { id: 2, name: 'Professional Information' },
    { id: 3, name: 'Skills & Experience' },
    { id: 4, name: 'Additional Details' },
    { id: 5, name: 'Upload CV' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] antialiased text-gray-700">
      {/* 1. Full Length Top Header Bar */}
      <header className="w-full bg-white border-b border-gray-200/80 px-6 py-4 flex items-center gap-4">
        <img 
          src={logo} 
          alt="Workforce Hiring Solutions Logo" 
          className="h-16 w-auto object-contain" 
        />
        <h1 className="text-[#1E3A8A] font-bold text-xl tracking-wide">
          Join Our Candidate Pool
        </h1>
      </header>

      {/* Main Container Core */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* 2. Step Element Progress Length Bar */}
        <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 px-2">
            {steps.map((step) => {
              const isCompletedOrActive = step.id <= 3; // Steps 1, 2, and 3 show active checkmarks
              return (
                <div key={step.id} className="flex items-center gap-2.5">
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full transition-colors ${
                    isCompletedOrActive 
                      ? 'bg-[#22C55E] text-white' 
                      : 'border border-gray-300 text-gray-400'
                  }`}>
                    {isCompletedOrActive ? (
                      <svg className="w-3 h-3 fill-current stroke-current" viewBox="0 0 24 24" strokeWidth="3">
                        <path d="M4.5 12.75l6 6 9-13.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <span className="text-xs font-semibold">{step.id}</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium tracking-tight ${
                    step.id === 3 ? 'text-gray-900 font-semibold' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. The Form Wizard Component Box Wrapper */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <SkillsExperienceForm 
            formData={formData}
            updateFormData={updateFormData}
            onNext={() => alert('Proceeding to Additional Details Form step!')}
            onBack={() => alert('Returning back to previous structural step.')}
          />
        </div>
      </main>
    </div>
  );
}

export default App;