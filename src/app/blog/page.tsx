"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaClock, FaArrowRight } from "react-icons/fa";
import SectionHeading from "@/components/SectionHeading";
import { blogPosts } from "@/data/siteData";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function BlogPage() {
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
            Blog & <span className="text-primary-600">Insights</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Tutorials, best practices, and insights from my web development
            journey. Stay updated with the latest in tech.
          </motion.p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl p-8 md:p-12">
              <span className="text-xs font-medium text-primary-600 bg-white px-3 py-1 rounded-full">
                {blogPosts[0].category}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4 mb-3">
                {blogPosts[0].title}
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl">
                {blogPosts[0].excerpt}
              </p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{blogPosts[0].date}</span>
                  <span className="flex items-center">
                    <FaClock className="mr-1" size={12} />
                    {blogPosts[0].readTime}
                  </span>
                </div>
                <Link
                  href={`/blog/${blogPosts[0].slug}`}
                  className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700"
                >
                  Read Article
                  <FaArrowRight className="ml-2" size={12} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Post Grid */}
          <SectionHeading title="Latest Articles" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post, i) => (
              <motion.article
                key={post.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-200 group-hover:text-primary-200 transition-colors">
                    {post.category.charAt(0)}
                  </span>
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{post.date}</span>
                    <span className="flex items-center">
                      <FaClock className="mr-1" size={10} />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Stay Updated
          </h2>
          <p className="text-gray-500 mb-8">
            Subscribe to get the latest articles and tutorials delivered to your
            inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="button"
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
