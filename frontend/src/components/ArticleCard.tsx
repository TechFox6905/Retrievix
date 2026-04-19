import React from "react";

interface ArticleCardProps {
  title: string;
  feed_name: string;
  feed_author: string;
  article_authors?: string[];
  url?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  feed_name,
  feed_author,
  article_authors,
  url,
}) => {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 
transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl 
border border-gray-200 dark:border-gray-700 w-full cursor-pointer">

  {/* Title */}
  <h2 className="text-xl md:text-2xl font-bold mb-3 
  text-gray-900 dark:text-gray-100 
  group-hover:text-blue-500 transition-colors truncate">
    {title}
  </h2>

  {/* Tags */}
  <div className="flex flex-wrap gap-2 mb-3">
    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 
    text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
      {feed_name || "N/A"}
    </span>

    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 
    text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
      {feed_author || "N/A"}
    </span>
  </div>

  {/* Authors */}
  {article_authors && article_authors.length > 0 && (
    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
      👤 {article_authors.join(", ")}
    </p>
  )}

  {/* Link */}
  {url && (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 mt-3 
      text-blue-600 dark:text-blue-400 font-medium 
      hover:underline"
    >
      Read Full Article →
    </a>
  )}
</div>
  );
};

export default ArticleCard;
