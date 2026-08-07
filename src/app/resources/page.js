"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlitchText from "@/components/GlitchText";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Shield,
  Map,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

const resourceSections = [
  {
    id: "field-manuals",
    label: "FIELD MANUALS",
    subtitle: "Official rulebooks for all competition events",
    color: "neon-cyan",
    icon: FileText,
    resources: [
      {
        name: "ROBO RACE — Official Rulebook",
        description: "Complete rules, track specifications, penalty system, and judging criteria for Robo Race.",
        type: "PDF",
        size: "Coming Soon",
        status: "coming-soon",
        icon: FileText,
        tags: ["Racing", "Autonomous", "Wireless"],
      },
      {
        name: "ROBO SUMO — Official Rulebook",
        description: "1v1 knockout format rules, robot specifications, ring dimensions, and match procedures.",
        type: "PDF",
        size: "Coming Soon",
        status: "coming-soon",
        icon: FileText,
        tags: ["Combat", "1v1", "Knockout"],
      },
      {
        name: "ROBO SOCCER — Official Rulebook",
        description: "Match format, team rules, bot specifications, and arena details for Robo Soccer.",
        type: "PDF",
        size: "Coming Soon",
        status: "coming-soon",
        icon: FileText,
        tags: ["Soccer", "Manual Control"],
      },
      {
        name: "LINE FOLLOWER — Official Rulebook",
        description: "Autonomous line-following competition rules, sensor specs, track details, and penalty structure.",
        type: "PDF",
        size: "Coming Soon",
        status: "coming-soon",
        icon: FileText,
        tags: ["Autonomous", "IR Sensor", "Line Tracking"],
      },
    ],
  },
  {
    id: "bot-specs",
    label: "BOT SPECIFICATIONS",
    subtitle: "Technical constraints and hardware requirements",
    color: "electric-purple",
    icon: Shield,
    resources: [
      {
        name: "General Bot Specification Sheet",
        description: "Consolidated weight limits, dimension constraints, power source rules, and safety requirements for all events.",
        type: "Quick Reference",
        size: "Inline",
        status: "available",
        icon: Shield,
        tags: ["Weight", "Dimensions", "Power"],
        inline: [
          { event: "ROBO RACE", weight: "≤ 3 KG", dims: "280×280×150mm", power: "16–17V" },
          { event: "ROBO SUMO", weight: "≤ 5 KG", dims: "300×300×300mm", power: "16–17V" },
          { event: "ROBO SOCCER", weight: "≤ 5 KG", dims: "300×300×300mm", power: "16–17V" },
          { event: "LINE FOLLOWER", weight: "≤ 1.5 KG", dims: "250×220×100mm", power: "11–12V" },
        ],
      },
    ],
  },
  {
    id: "arena-schematics",
    label: "ARENA SCHEMATICS",
    subtitle: "Venue layouts and competition arena dimensions",
    color: "neon-cyan",
    icon: Map,
    resources: [
      {
        name: "Robo Race — Track Schematic",
        description: "Arena ~45×55 sq ft. Track 130–150 ft long with tunnels, ramps, seesaw, marble pit, and slippery path. Bot lanes 35–55cm wide.",
        type: "Description",
        size: "Inline",
        status: "available",
        icon: Map,
        tags: ["45×55 ft", "130–150 ft Track"],
      },
      {
        name: "Robo Soccer / Sumo — Arena Specs",
        description: "Soccer: 8×5 ft with artificial grass, 35cm goalposts. Sumo: 8×8 ft square ring.",
        type: "Description",
        size: "Inline",
        status: "available",
        icon: Map,
        tags: ["Soccer: 8×5 ft", "Sumo: 8×8 ft"],
      },
      {
        name: "Line Follower — Track Specs",
        description: "Black line (20–30mm wide) on white background. Arena ~8×12 ft indoor with controlled lighting. Includes T-junctions, sharp turns, dead ends.",
        type: "Description",
        size: "Inline",
        status: "available",
        icon: Map,
        tags: ["8×12 ft", "IR Track", "Controlled Lighting"],
      },
    ],
  },
  {
    id: "registration",
    label: "REGISTRATION DOCS",
    subtitle: "Team formation templates and submission formats",
    color: "electric-purple",
    icon: Users,
    resources: [
      {
        name: "Team Registration Guide",
        description: "How to register your team, fill out the form, and what information you'll need on hand.",
        type: "Guide",
        size: "Online",
        status: "link",
        icon: Users,
        link: "/register",
        tags: ["Registration", "Team", "Guide"],
      },
      {
        name: "Event Participation Guidelines",
        description: "Final comprehensive guidelines covering all events, conduct rules, and disqualification criteria.",
        type: "Reference",
        size: "Coming Soon",
        status: "coming-soon",
        icon: FileText,
        tags: ["Guidelines", "Conduct", "DQ Rules"],
      },
    ],
  },
];

function SpecsTable({ specs }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full font-mono text-[10px]">
        <thead>
          <tr className="border-b border-white/10">
            {["EVENT", "MAX WEIGHT", "MAX DIMS (LxWxH)", "MAX POWER"].map((h) => (
              <th key={h} className="text-left py-2 pr-4 text-gray-500 tracking-widest">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specs.map((row, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="py-2 pr-4 text-neon-cyan font-bold tracking-widest">{row.event}</td>
              <td className="py-2 pr-4 text-white">{row.weight}</td>
              <td className="py-2 pr-4 text-white">{row.dims}</td>
              <td className="py-2 pr-4 text-electric-purple">{row.power}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResourceCard({ resource, sectionColor, index }) {
  const Icon = resource.icon;
  const isComingSoon = resource.status === "coming-soon";
  const isLink = resource.status === "link";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-black/40 border border-white/8 p-5 hover:border-neon-cyan/30 transition-all duration-400"
      style={{
        clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-8 h-8 shrink-0 flex items-center justify-center border ${
            sectionColor === "electric-purple"
              ? "border-electric-purple/30 bg-electric-purple/5 text-electric-purple"
              : "border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan"
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className={`font-mono text-xs font-bold text-white group-hover:${
              sectionColor === "electric-purple" ? "text-electric-purple" : "text-neon-cyan"
            } transition-colors mb-1 tracking-wide`}>
              {resource.name}
            </h3>
            <p className="font-mono text-[10px] text-gray-500 leading-relaxed">{resource.description}</p>
          </div>
        </div>

        {/* Status Badge */}
        {isComingSoon ? (
          <div className="shrink-0 flex items-center gap-1 px-2 py-1 border border-yellow-500/30 bg-yellow-500/5">
            <Clock className="w-3 h-3 text-yellow-500" />
            <span className="font-mono text-[9px] text-yellow-500 tracking-widest uppercase">PENDING</span>
          </div>
        ) : isLink ? (
          <a
            href={resource.link}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 border border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
            style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
          >
            <ExternalLink className="w-3 h-3" />
            <span className="font-mono text-[9px] tracking-widest uppercase">OPEN</span>
          </a>
        ) : null}
      </div>

      {/* Inline spec table */}
      {resource.inline && <SpecsTable specs={resource.inline} />}

      {/* Tags */}
      {resource.tags && (
        <div className="flex flex-wrap gap-2 mt-4">
          {resource.tags.map((tag) => (
            <span key={tag} className="font-mono text-[9px] text-gray-600 border border-white/10 px-2 py-0.5 tracking-wider">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row for available items */}
      {!isComingSoon && !isLink && !resource.inline && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span className="font-mono text-[9px] text-green-400 tracking-widest">AVAILABLE</span>
          </div>
          <span className="font-mono text-[9px] text-gray-600">{resource.type}</span>
        </div>
      )}
    </motion.div>
  );
}

export default function ResourcesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-28 pb-20 px-4 max-w-7xl mx-auto w-full relative z-10">

        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-electric-purple/10 -z-10" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.5em] mb-4"
          >
            GRAVITON ROBOTICS — FIELD DIVISION
          </motion.p>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-4 bg-background inline-block px-8 tracking-tighter">
            INTEL&nbsp;
            <GlitchText text="REPOSITORY" className="text-electric-purple text-glow-purple" />
          </h1>
          <p className="font-mono text-xs text-gray-400 max-w-xl mx-auto uppercase tracking-[0.3em]">
            &gt; CLASSIFIED FIELD MANUALS, BOT SPECS & ARENA INTELLIGENCE
          </p>
        </div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-14 p-4 border border-yellow-500/40 bg-yellow-500/5 flex gap-4 items-start max-w-4xl mx-auto"
          style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}
        >
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-mono text-xs text-yellow-400 font-bold tracking-widest uppercase mb-1">MANDATORY BRIEFING</p>
            <p className="font-mono text-[11px] text-yellow-200/70 leading-relaxed">
              All operatives are required to review the official rulebook for their respective event before deployment.
              Rules are subject to change at the discretion of Graviton Robotics Command. The specifications listed here
              are for reference only — always defer to the most recent official rulebook.
            </p>
          </div>
        </motion.div>

        {/* Resource Sections */}
        <div className="space-y-16">
          {resourceSections.map((section, sIdx) => {
            const SectionIcon = section.icon;
            return (
              <motion.section
                key={section.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
              >
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-10 h-10 flex items-center justify-center border ${
                    section.color === "electric-purple"
                      ? "border-electric-purple/50 bg-electric-purple/10 text-electric-purple"
                      : "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                  }`}
                    style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
                  >
                    <SectionIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className={`font-display font-bold text-xl tracking-[0.2em] uppercase ${
                      section.color === "electric-purple" ? "text-electric-purple" : "text-neon-cyan"
                    }`}>
                      &gt; {section.label}
                    </h2>
                    <p className="font-mono text-[10px] text-gray-500 tracking-widest mt-0.5">{section.subtitle}</p>
                  </div>
                  <div className={`h-px flex-1 ${
                    section.color === "electric-purple" ? "bg-electric-purple/20" : "bg-neon-cyan/20"
                  }`} />
                </div>

                {/* Cards */}
                <div className={`grid gap-4 ${
                  section.resources.length === 1 ? "grid-cols-1 max-w-3xl" :
                  section.resources.length === 2 ? "grid-cols-1 md:grid-cols-2" :
                  "grid-cols-1 md:grid-cols-2"
                }`}>
                  {section.resources.map((resource, rIdx) => (
                    <ResourceCard
                      key={rIdx}
                      resource={resource}
                      sectionColor={section.color}
                      index={rIdx}
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 text-center p-10 border border-dashed border-white/10"
          style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
        >
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.4em] mb-3">&gt; NEED ASSISTANCE?</p>
          <p className="font-mono text-sm text-gray-400 mb-6 max-w-lg mx-auto leading-relaxed">
            If you cannot locate a required file or need clarification on rules and specifications,
            contact the Graviton Robotics command center directly.
          </p>
          <a
            href="mailto:gravitonroboticsidr@gmail.com?subject=Resource Query — RANBHOOMI 2.0"
            className="inline-flex items-center gap-2 font-mono text-xs text-neon-cyan border border-neon-cyan/50 px-6 py-3 hover:bg-neon-cyan/10 transition-colors tracking-widest"
            style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
          >
            <ExternalLink className="w-3 h-3" />
            CONTACT COMMAND
          </a>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
