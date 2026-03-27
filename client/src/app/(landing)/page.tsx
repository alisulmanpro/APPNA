"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-base-100">
      {/* Header */}
      <header className="absolute top-0 w-full z-50 transition-all border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-primary-content font-extrabold tracking-widest text-sm">APP</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">APPNA</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Features</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">About</a>
            <div className="flex items-center gap-4 ml-4">
              <Link href="/dashboard" className="btn btn-primary btn-sm rounded-full px-5 shadow-lg shadow-primary/30 border-none font-semibold">
                Go to Dashboard
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-[#f0f4ff] via-[#e8f0fe] to-[#f0f9ff]">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-60 mix-blend-multiply pointer-events-none animate-pulse-ring"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl opacity-60 mix-blend-multiply pointer-events-none animate-pulse-ring" style={{ animationDelay: '1s' }}></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/50 text-sm font-medium text-primary mb-8 shadow-sm animate-fade-in-up">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              APPNA Command Center 2.0 is Live
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-5xl mx-auto leading-[1.1] animate-fade-in-up animate-delay-100">
              Empowering Pakistan's Medical Community <span className="gradient-text">Worldwide.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
              The centralized platform for managing members, committees, and AI-powered meeting summaries for the Association of Physicians of Pakistani Descent of North America.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animate-delay-300">
              <Link href="/dashboard" className="btn btn-primary btn-lg rounded-full px-8 shadow-xl shadow-primary/30 border-none w-full sm:w-auto group">
                Access Dashboard
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <a href="#features" className="btn btn-outline btn-lg rounded-full px-8 bg-white/50 border-slate-200 text-slate-700 hover:bg-white w-full sm:w-auto">
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Integration / Stats Section */}
        <section className="py-12 border-y border-base-200 bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-base-200">
              <div className="px-4">
                <p className="text-4xl font-extrabold text-slate-900 mb-2">370+</p>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Active Members</p>
              </div>
              <div className="px-4">
                <p className="text-4xl font-extrabold text-slate-900 mb-2">33</p>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Committees</p>
              </div>
              <div className="px-4">
                <p className="text-4xl font-extrabold text-slate-900 mb-2">10k+</p>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Meeting Minutes</p>
              </div>
              <div className="px-4">
                <p className="text-4xl font-extrabold text-slate-900 mb-2">100%</p>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">AI Accurate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to manage APPNA.</h2>
              <p className="text-lg text-slate-600">A unified suite of tools designed specifically for medical associations and large-scale organizational management.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                  <Users className="text-blue-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">CRM Directory</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Manage over 370+ active members. Filter by specialty, location, or committee assignment instantly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                  <ShieldCheck className="text-indigo-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Committee Control</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Govern 33 unique committees. Appoint chairs, manage rosters, and track inter-committee task completion.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-6">
                  <Zap className="text-purple-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI Meeting Summaries</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Upload transcripts or audio. Our AI instantly generates accurate meeting minutes, decisions, and action items.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs">APP</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">APPNA</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} Association of Physicians of Pakistani Descent of North America. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
