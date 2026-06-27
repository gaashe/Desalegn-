"use client";

import { motion } from "framer-motion";
import { FaCheckCircle, FaDownload } from "react-icons/fa";
import SectionHeading from "@/components/SectionHeading";
import { skills } from "@/data/siteData";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const values = [
  {
    title: "Quality First",
    description:
      "Every line of code is written with care, following best practices and clean architecture principles.",
  },
  {
    title: "Client-Centered",
    description:
      "Your vision drives the project. I listen, collaborate, and deliver solutions that exceed expectations.",
  },
  {
    title: "Continuous Learning",
    description:
      "Staying current with the latest web technologies ensures your project uses the best tools available.",
  },
  {
    title: "Transparent Process",
    description:
      "Regular updates, clear timelines, and honest communication throughout every project phase.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
            >
              About <span className="text-primary-600">Zodaic</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 leading-relaxed"
            >
              A passionate full-stack developer dedicated to building
              exceptional web experiences. Based in Addis Ababa, Ethiopia,
              serving clients worldwide.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                My Journey
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  With over 5 years of experience in web development, I&apos;ve
                  had the privilege of working on projects ranging from small
                  business websites to complex enterprise applications.
                </p>
                <p>
                  My journey started with a curiosity about how the web works
                  and evolved into a deep passion for creating digital
                  experiences that solve real problems. I specialize in
                  building modern web applications using React, Next.js,
                  TypeScript, and Node.js.
                </p>
                <p>
                  I&apos;m particularly passionate about education technology
                  and have built several tutoring platforms that connect
                  educators with students effectively.
                </p>
              </div>
              <div className="mt-8">
                <button className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                  <FaDownload className="mr-2" size={14} />
                  Download Resume
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl p-8 lg:p-12"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Quick Facts
              </h3>
              <ul className="space-y-4">
                {[
                  "Full-Stack Web Developer",
                  "Based in Addis Ababa, Ethiopia",
                  "5+ years of professional experience",
                  "50+ projects delivered",
                  "Specialized in React & Next.js",
                  "Open to remote & local projects",
                ].map((fact, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <FaCheckCircle
                      className="text-primary-600 flex-shrink-0"
                      size={16}
                    />
                    <span className="text-gray-700">{fact}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Technical Skills"
            subtitle="Technologies I work with on a daily basis"
          />

          <div className="max-w-3xl mx-auto grid gap-6">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">
                    {skill.name}
                  </span>
                  <span className="text-sm text-gray-500">{skill.level}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="My Values"
            subtitle="Principles that guide every project I take on"
          />

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="p-6 rounded-2xl border border-gray-100 hover:border-primary-100 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
