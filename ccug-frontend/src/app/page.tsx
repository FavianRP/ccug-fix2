'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Users,
  Shield,
  Code2,
  Terminal,
  Flag,
  Trophy,
} from 'lucide-react';

const FEATURED_TROPHIES = [
  { place: '3rd Place', event: 'POLRICTF 2026', host: 'Kepolisian Negara Republik Indonesia', year: '2026', rankColor: 'text-[#ffd54f] bg-[#2a2614] border-[#5e5320]' },
  { place: 'Finalist', event: 'GEMASTIK 2026', host: 'Divisi Keamanan Siber • PUSPRESNAS', year: '2026', rankColor: 'text-[#81C995] bg-[#1e2a22] border-[#2e4c34]' },
  { place: '3rd Place', event: 'FINDIT! 2023 CTF', host: 'Universitas Gadjah Mada', year: '2023', rankColor: 'text-[#ffd54f] bg-[#2a2614] border-[#5e5320]' },
  { place: '1st Place', event: 'Tech. Enthusiast Day 2022', host: 'Universitas Gadjah Mada', year: '2022', rankColor: 'text-[#ffd54f] bg-[#2a2614] border-[#5e5320]' },
  { place: '2nd Place', event: 'National Cyber Week 2022', host: 'Bina Nusantara', year: '2022', rankColor: 'text-[#78b3ea] bg-[#1c2834] border-[#28425a]' },
  { place: '1st Place', event: 'TheLast CTF 2021', host: 'Helixs Crew National', year: '2021', rankColor: 'text-[#ffd54f] bg-[#2a2614] border-[#5e5320]' },
  { place: '1st Place', event: 'KKSTNI AD CTF 2021', host: 'Pusat Sandi dan Siber TNI AD', year: '2021', rankColor: 'text-[#ffd54f] bg-[#2a2614] border-[#5e5320]' },
  { place: '2nd Place', event: 'Gemastik XIV Keamanan Siber', host: 'PUSPRESNAS & Telkom University', year: '2021', rankColor: 'text-[#78b3ea] bg-[#1c2834] border-[#28425a]' },
  { place: '2nd Place', event: 'COMPFEST 12 CTF', host: 'Universitas Indonesia', year: '2020', rankColor: 'text-[#78b3ea] bg-[#1c2834] border-[#28425a]' },
];

const TIMELINE = [
  {
    year: 'MAY 2017',
    title: 'Genesis of CCUG',
    desc: 'Founded by three passionate computer science students aiming to represent Universitas Gunadarma in competitive collegiate CTFs.',
  },
  {
    year: '2018 - 2019',
    title: 'National Recognition',
    desc: 'Secured podium finishes across major national cybersecurity competitions including Slashroot Bali and Amikom Hackfest.',
  },
  {
    year: '2020',
    title: 'Championship Finalists',
    desc: 'Podium runners-up at COMPFEST XII CTF (Universitas Indonesia), finalists at Cyber Jawara National and KKSTNI AD.',
  },
  {
    year: '2024 - PRESENT',
    title: 'New Generation Active Roster',
    desc: 'Active competition lineup (tiramisaks, zennova, kyouraa, Vortaile) continuing the research legacy in binary exploitation, web, and forensics.',
  },
];

const PILLARS = [
  {
    icon: Terminal,
    title: 'Binary & Reverse Engineering',
    desc: 'Low-level vulnerability research, memory corruption exploitation, assembly analysis, and executable reverse engineering.',
  },
  {
    icon: Code2,
    title: 'Web & Cryptographic Security',
    desc: 'Auditing complex modern web applications, API security flaws, and applied mathematical cryptanalysis of encryption schemes.',
  },
  {
    icon: Shield,
    title: 'Digital Forensics & Incident Triage',
    desc: 'Dissecting memory dumps with Volatility, investigating network packet streams (PCAP), and Open Source Intelligence (OSINT).',
  },
];

export default function Home() {
  return (
    <div className="space-y-28 pb-28">
      {/* Hero Section with Ambient Glow and Floating Animations */}
      <section className="relative overflow-hidden border-b border-[#262626] bg-black bg-grid-pattern">
        {/* Subtle Ambient Radial Backlight */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-white/[0.04] blur-[140px] rounded-full pointer-events-none animate-pulse-glow" />

        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-[#a3a3a3] border border-[#262626] rounded-full px-4 py-1.5 bg-[#111111]/90 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Universitas Gunadarma • Jakarta, Indonesia</span>
              </div>

              <h1 className="font-heading text-5xl sm:text-7xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.04]">
                Cyber Community <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#d4d4d4] to-[#737373]">
                  Universitas Gunadarma
                </span>
              </h1>

              <p className="text-[#a3a3a3] text-base sm:text-lg max-w-xl font-sans leading-relaxed">
                Official collegiate cybersecurity research team and premier competitive Capture The
                Flag (CTF) organization of Universitas Gunadarma, Jakarta, Indonesia.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2 font-heading text-sm font-bold">
                <a
                  href="https://pendaftaran.ccug.gunadarma.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-black rounded-full hover:bg-[#e5e5e5] transition-all duration-300 hover:scale-[1.03] shadow-lg hover:shadow-white/10"
                >
                  <span>Join CCUG</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </a>

                <Link
                  href="/members"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#333333] hover:border-white text-white rounded-full bg-[#141414] hover:bg-[#1f1f1f] transition-all duration-300 hover:scale-[1.03]"
                >
                  <span>Meet the Members</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/posts"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#333333] hover:border-white text-[#a3a3a3] hover:text-white rounded-full transition-all duration-300 hover:scale-[1.03]"
                >
                  <span>Read Writeups</span>
                  <BookOpen className="w-4 h-4" />
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#262626] max-w-lg">
                <div className="group">
                  <div className="font-heading text-3xl sm:text-4xl font-extrabold text-white transition-transform group-hover:-translate-y-0.5 duration-200">
                    2017
                  </div>
                  <div className="font-sans text-xs text-[#737373] uppercase tracking-wider">
                    Established
                  </div>
                </div>
                <div className="group">
                  <div className="font-heading text-3xl sm:text-4xl font-extrabold text-white transition-transform group-hover:-translate-y-0.5 duration-200">
                    20+
                  </div>
                  <div className="font-sans text-xs text-[#737373] uppercase tracking-wider">
                    National Titles
                  </div>
                </div>
                <div className="group">
                  <div className="font-heading text-3xl sm:text-4xl font-extrabold text-white transition-transform group-hover:-translate-y-0.5 duration-200">
                    100%
                  </div>
                  <div className="font-sans text-xs text-[#737373] uppercase tracking-wider">
                    Student Run
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: 3D Crest with Floating Animation */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md aspect-square bg-[#0c0c0c]/80 backdrop-blur-md border border-[#262626] rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl overflow-hidden group hover:border-[#404040] transition-all duration-500 hover:shadow-white/[0.03]">
                <div className="flex items-center justify-between font-mono text-[11px] text-[#737373] uppercase">
                  <span>Official Insignia</span>
                  <span>Est. May 2017</span>
                </div>

                {/* 3D GIF Animation with gentle floating */}
                <div className="relative w-64 h-64 mx-auto my-auto flex items-center justify-center animate-float">
                  <Image
                    src="/img/3dgifmaker16954.gif"
                    alt="CCUG 3D Crest"
                    width={260}
                    height={260}
                    className="object-contain drop-shadow-[0_20px_35px_rgba(255,255,255,0.08)] transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                    priority
                  />
                </div>

                <div className="pt-4 border-t border-[#262626] flex items-center justify-between font-mono text-[11px] text-[#737373]">
                  <span>Universitas Gunadarma</span>
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us: Vision & Story */}
      <section id="about" className="max-w-7xl mx-auto px-6">
        <div className="border border-[#262626] bg-[#0c0c0c] rounded-3xl p-8 sm:p-14 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-3">
              <div className="font-mono text-xs text-[#737373] uppercase tracking-widest">
                Our Foundation
              </div>
              <h2 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                About Cyber Community Gunadarma
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-4 text-[#a3a3a3] font-sans text-base leading-relaxed">
              <p>
                Cyber Community Universitas Gunadarma (CCUG) was formed in May 2017 by three
                forward-thinking undergraduate students: <strong>Ravi Dharmawan</strong>,{' '}
                <strong>Muhammad Fadel Maulana</strong>, and <strong>Jibril Hartri Putra</strong>.
              </p>
              <p>
                Motivated by the ambition to see Gunadarma students compete head-to-head with the
                nation's finest university teams in competitive Capture The Flag (CTF) events, CCUG
                was born as an elite academic community and student-led security research lab.
              </p>
              <p className="text-white font-medium pt-2">
                Today, CCUG represents Universitas Gunadarma on regional and global leaderboards,
                cultivating expertise across collegiate and professional cybersecurity tournaments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="space-y-8">
          <div className="space-y-1">
            <div className="font-mono text-xs text-[#737373] uppercase tracking-widest">
              Milestones
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              The Journey of CCUG
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIMELINE.map((item, i) => (
              <div
                key={i}
                className="bg-[#0c0c0c] border border-[#262626] rounded-2xl p-6 space-y-3 hover:border-white transition-colors"
              >
                <div className="font-mono text-xs font-bold text-white tracking-wider border-b border-[#262626] pb-2">
                  {item.year}
                </div>
                <h3 className="font-heading text-lg font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="font-sans text-xs text-[#a3a3a3] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tournament Records & Trophies Showcase */}
      <section id="record" className="max-w-7xl mx-auto px-6">
        <div className="border border-[#262626] bg-[#0c0c0c] rounded-3xl p-8 sm:p-14 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#262626]">
            <div className="space-y-3">
              <div className="font-mono text-xs text-[#737373] uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-white" />
                <span>Honors & Competitive Record</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Tournament Record & Trophies
              </h2>
            </div>
            <Link
              href="/contests"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#333333] hover:border-white text-white rounded-full bg-[#141414] hover:bg-[#1f1f1f] transition text-xs font-heading font-bold uppercase tracking-wider shrink-0"
            >
              <span>View All 29+ Contests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_TROPHIES.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#121212] border border-[#222222] hover:border-[#383838] rounded-2xl p-5 space-y-4 transition duration-300 group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[11px] font-bold px-3 py-1 rounded-full border ${t.rankColor}`}
                  >
                    {t.place}
                  </span>
                  <span className="font-mono text-xs text-[#737373]">{t.year}</span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white group-hover:text-white transition">
                    {t.event}
                  </h3>
                  <p className="font-sans text-xs text-[#8a8a8a] mt-1">{t.host}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dedicated Team Members Callout (Dedicated Page Bridge) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-[#0e0e0e] border border-[#262626] rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-[#383838] transition">
          <div className="space-y-2 text-center md:text-left">
            <div className="font-mono text-xs text-[#737373] uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
              <Users className="w-3.5 h-3.5 text-white" />
              <span>Full Team Roster & Alumni Directory</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Meet Our Active Roster & Alumni
            </h2>
            <p className="text-[#a3a3a3] font-sans text-sm max-w-xl">
              Discover all CCUG active players (tiramisaks, zennova, kyouraa, Vortaile) and
              founding alumni with their expertise areas, join dates, and social links on the
              dedicated Members page.
            </p>
          </div>

          <Link
            href="/members"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-heading text-sm font-bold uppercase tracking-wider rounded-full hover:bg-[#e5e5e5] transition shrink-0 shadow-lg"
          >
            <span>Open Members Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Call To Action: Join & Contact */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white text-black rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#737373]">
              Be Part of Gunadarma CTF
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
              Interested in Cyber Security?
            </h2>
            <p className="text-neutral-700 font-sans text-sm sm:text-base max-w-xl">
              Register through the official Gunadarma CTF recruitment portal to take part in
              internal challenges and annual HackFest qualifiers.
            </p>
          </div>

          <a
            href="https://pendaftaran.ccug.gunadarma.ac.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-heading text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-900 transition shrink-0 shadow-lg"
          >
            <span>Join CCUG Portal</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </a>
        </div>
      </section>
    </div>
  );
}
