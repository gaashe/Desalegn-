"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCode, FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import SectionHeading from "@/components/SectionHeading";
import { projects } from "@/data/siteData";

const categories = [
  "All",
  ...Array.from(new Set(projects.map((p) => p.category))),
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <>
      {/* Hero */}
      <section className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
          >
            My <span className="text-primary-600">Portfolio</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            A curated collection of projects showcasing my expertise in web
            development, design, and problem-solving.
          </motion.p>
        </div>
      </section>

      {/* Filter & Projects */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === cat
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Project Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="relative h-52 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center overflow-hidden">
                    <FaCode
                      className="text-primary-200 group-hover:text-primary-300 transition-colors"
                      size={56}
                    />
                    <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/60 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-3">
                        <a
                          href={project.liveUrl}
                          className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-700 hover:text-primary-600"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaExternalLinkAlt size={14} />
                        </a>
                        <a
                          href={project.githubUrl}
                          className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-700 hover:text-primary-600"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaGithub size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                      {project.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            title="Want to See More?"
            subtitle="Have a project in mind? Let's discuss how I can help bring your vision to life."
          />
          <a
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Start a Project
          </a>
        </div>
      </section>
    </>
  );
}
