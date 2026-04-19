import { useEffect, useRef } from "react";

export const useAutoScroll = (dependency: any) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [dependency]);

  return ref;
};