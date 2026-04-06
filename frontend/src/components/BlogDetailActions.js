"use client";

import { useState } from "react";

function htmlToMarkdown(html) {
  let markdown = html;
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  markdown = markdown.replace(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  markdown = markdown.replace(/<ul[^>]*>|<\/ul>/gi, "");
  markdown = markdown.replace(/<ol[^>]*>|<\/ol>/gi, "");
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n");
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  markdown = markdown.replace(/<div[^>]*>(.*?)<\/div>/gi, "$1\n");
  markdown = markdown.replace(/<[^>]+>/g, "");
  markdown = markdown.replace(/&nbsp;/gi, " ");
  markdown = markdown.replace(/\n{3,}/g, "\n\n");
  return markdown.trim();
}

function formatMarkdown(blog) {
  const title = `# ${blog.title}\n\n`;
  const meta = blog.metaDescription ? `_${blog.metaDescription}_\n\n` : "";
  const subtitle = `**Keyword:** ${blog.keyword}  \n**Slug:** /${blog.slug}  \n**Published:** ${blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Unknown date"}  \n\n`;
  const body = htmlToMarkdown(blog.content);
  return `${title}${meta}${subtitle}${body}`;
}

export default function BlogDetailActions({ blog, regenerateUrl }) {
  const [feedback, setFeedback] = useState("");

  const copyToClipboard = async () => {
    const markdown = formatMarkdown(blog);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(markdown);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = markdown;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setFeedback("Copied markdown to clipboard");
      setTimeout(() => setFeedback(""), 2000);
    } catch (error) {
      setFeedback("Copy failed");
      setTimeout(() => setFeedback(""), 2000);
    }
  };

  const shareArticle = async () => {
    const shareText = `${blog.title} - ${blog.metaDescription || "AI generated blog"}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setFeedback("Link copied to clipboard");
      }
    } catch (error) {
      setFeedback("Share failed");
    } finally {
      setTimeout(() => setFeedback(""), 2000);
    }
  };

  const downloadMarkdown = () => {
    const markdown = formatMarkdown(blog);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${blog.slug || "blog"}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setFeedback("Markdown file downloaded");
    setTimeout(() => setFeedback(""), 2000);
  };

  const exportPdf = () => {
    const html = `
      <html>
        <head>
          <title>${blog.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; background: #ffffff; }
            h1 { font-size: 2rem; margin-bottom: 0.5rem; }
            p { margin: 0.75rem 0; line-height: 1.6; }
            ul { margin: 0.75rem 0; padding-left: 1.25rem; }
            li { margin-bottom: 0.5rem; }
            strong { font-weight: 700; }
            em { font-style: italic; }
          </style>
        </head>
        <body>
          <h1>${blog.title}</h1>
          <p><strong>Keyword:</strong> ${blog.keyword}</p>
          <p><strong>Slug:</strong> /${blog.slug}</p>
          <p><strong>Published:</strong> ${blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Unknown date"}</p>
          <p><em>${blog.metaDescription || ""}</em></p>
          ${blog.content}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setFeedback("Please allow popups to export PDF");
      setTimeout(() => setFeedback(""), 2000);
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setFeedback("Open print dialog to save as PDF");
    setTimeout(() => setFeedback(""), 2000);
  };

  const handleRegenerate = () => {
    if (!regenerateUrl) {
      setFeedback("Regenerate URL not available.");
      setTimeout(() => setFeedback(""), 2000);
      return;
    }
    window.location.href = regenerateUrl;
  };

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/15">
      <p className="text-xs uppercase tracking-[0.3em] text-brand-400 mb-4">Actions</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={copyToClipboard} className="btn-secondary w-full">
          Copy markdown
        </button>
        <button onClick={shareArticle} className="btn-secondary w-full">
          Share article
        </button>
        <button onClick={downloadMarkdown} className="btn-primary w-full">
          Download .md
        </button>
        <button onClick={handleRegenerate} className="btn-secondary w-full">
          Regenerate
        </button>
      </div>
      <button onClick={exportPdf} className="btn-secondary mt-4 w-full">
        Export PDF
      </button>
      {feedback ? <p className="mt-4 text-sm text-slate-300">{feedback}</p> : null}
    </div>
  );
}
