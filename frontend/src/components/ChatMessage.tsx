import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import ArticleCard from "./ArticleCard";
import type { Message } from "../types";
import rehypeRaw from "rehype-raw";

const ChatMessage = ({ msg }: { msg: Message }) => {
  console.log(typeof msg.content, msg.content);
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-orange-500 px-4 py-2 rounded-2xl text-white">
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.role === "ai") {
    return (
      <div className="flex justify-start">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 w-full">
          <div className="text-xs text-gray-400 mb-2">AI</div>

          {!msg.done ? (
            <div className="whitespace-pre-wrap text-gray-300">
              {msg.content}
              
            </div>
          ) : (
            <div className="overflow-x-auto">
                <div className="markdown-content">
                    
                    <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                    
                    >
                    {msg.content as string}
                    
                    </ReactMarkdown>

                </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (msg.role === "search") {
    return (
      <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Sources</div>
        {(msg.content as any[]).map((item, i) => (
          <ArticleCard key={i} {...item} />
        ))}
      </div>
    );
  }

  return null;
};

export default ChatMessage;