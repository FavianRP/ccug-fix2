"use client";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PostDetailPage({ params }) {
  const { id } = params;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPost();
  }, []);

  const loadPost = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}`);
      if (!res.ok) throw new Error("Failed to fetch post");

      const data = await res.json();
      setPost(data);
      document.title = `${data.title} | CCUG`;
    } catch (err) {
      setError("Failed to load post.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen ccug-bg text-white flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-ccug-purple rounded-full"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen ccug-bg flex items-center justify-center text-red-400">
        Failed to load post.
      </div>
    );
  }

  return (
    <div className="min-h-screen ccug-bg text-white">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <div className="mb-6">
          <p className="text-ccug-gray text-sm">
            <a href="/" className="hover:text-white">Home</a>
            <span className="mx-2">»</span>
            <a href="/posts" className="hover:text-white">Posts</a>
            <span className="mx-2">»</span>
            <span className="text-white">{post.title}</span>
          </p>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-3 text-green-400">
          {post.title}
        </h1>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-ccug-gray mb-8">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {formatDate(post.date)}
          </span>
          <span>•</span>
          <span className="capitalize">{post.category}</span>
          <span>•</span>
          <span className="text-white">{post.author}</span>
        </div>

        <div className="border-b border-ccug-purple mb-8"></div>

        {/* Writeup Content (Markdown) */}
        <article className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, children, ...props }) {
                return !inline ? (
                  <pre className="bg-black/40 border border-green-400/40 rounded-lg p-4 overflow-x-auto my-4">
                    <code {...props}>{children}</code>
                  </pre>
                ) : (
                  <code className="bg-black/40 px-1 rounded text-green-300" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {post.description}
          </ReactMarkdown>
        </article>

        <div className="border-b border-ccug-gray/30 mt-10"></div>
      </main>
    </div>
  );
}
