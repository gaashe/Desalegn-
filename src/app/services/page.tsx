"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaGlobe,
  FaCode,
  FaGraduationCap,
  FaShoppingCart,
  FaPalette,
  FaTools,
  FaArrowRight,
} from "react-icons/fa";
import SectionHeading from "@/components/SectionHeading";
import { services } from "@/data/siteData";

const iconMap: Record<string, React.ReactNode> = {
  globe: <FaGlobe size={24} />,
  code: <FaCode size={24} />,
  academic: <FaGraduationCap size={24} />,
  cart: <FaShoppingCart size={24} />,
  design: <FaPalette size={24} />,
  support: <FaTools size={24} />,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const processSteps = [
  {
    step: "01",
    title: "Discovery",
    description:
      "We discuss your goals, target audience, and requirements to define the project scope.",
  },
  {
    step: "02",
    title: "Planning & Design",
    description:
      "I create wireframes and mockups, then refine the design based on your feedback.",
  },
  {
    step: "03",
    title: "Development",
    description:
      "Clean, efficient code brings the design to life with modern frameworks and best practices.",
  },
  {
    step: "04",
    title: "Launch & Support",
    description:
      "After testing and deployment, I provide ongoing support to keep everything running smoothly.",
  },
];

export default function ServicesPage() {
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
            Services & <span className="text-primary-600">Solutions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Comprehensive web development services tailored to your unique
            needs. From concept to deployment and beyond.
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all group"
              >
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 text-primary-600 group-hover:bg-primary-100 transition-colors">
                  {iconMap[service.icon]}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="How I Work"
            subtitle="A streamlined process from initial concept to final delivery"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative text-center"
              >
                <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <span className="text-white font-bold text-lg">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Every Project Is Unique
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              I provide custom quotes based on your specific requirements.
              Let&apos;s discuss your project and find the right solution for
              your budget.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Request a Free Quote
              <FaArrowRight className="ml-2" size={14} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
