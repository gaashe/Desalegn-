import Link from "next/link";  
import { notFound } from "next/navigation";  
import type { Metadata } from "next";  
import { FaClock, FaArrowLeft } from "react-icons/fa";  
import { blogPosts } from "@/data/siteData";  
  
export function generateStaticParams() {  
  return blogPosts.map((post) => ({ slug: post.slug }));  
}  
  
export function generateMetadata({  
  params,  
}: {  
  params: { slug: string };  
}): Metadata {  
  const post = blogPosts.find((p) => p.slug === params.slug);  
  if (!post) return { title: "Article Not Found" };  
  return {  
    title: post.title,  
    description: post.excerpt,  
  };  
}  
  
export default function BlogPostPage({  
  params,  
}: {  
  params: { slug: string };  
}) {  
  const post = blogPosts.find((p) => p.slug === params.slug);  
  
  if (!post) {  
    notFound();  
  }  
  
  return (  
    <>  
      {/* Header */}  
      <section className="py-20 gradient-bg">  
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">  
          <Link  
            href="/blog"  
            className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 mb-6"  
          >  
            <FaArrowLeft className="mr-2" size={12} />  
            Back to Blog  
          </Link>  
          <span className="text-xs font-medium text-primary-600 bg-white px-3 py-1 rounded-full">  
            {post.category}  
          </span>  
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-4">  
            {post.title}  
          </h1>  
          <div className="flex items-center space-x-4 text-sm text-gray-500">  
            <span>{post.date}</span>  
            <span className="flex items-center">  
              <FaClock className="mr-1" size={12} />  
              {post.readTime}  
            </span>  
          </div>  
        </div>  
      </section>  
  
      {/* Body */}  
      <section className="py-16 bg-white">  
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">  
          {post.content.map((paragraph, i) => (  
            <p  
              key={i}  
              className="text-lg text-gray-600 leading-relaxed mb-6"  
            >  
              {paragraph}  
            </p>  
          ))}  
        </div>  
      </section>  
    </>  
  );  
}
