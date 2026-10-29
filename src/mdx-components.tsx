import type { MDXComponents } from "mdx/types";
import Claim from "@/components/Claim";
import RepoCard from "@/components/RepoCard";
import Warn from "@/components/Warn";

// Required by @next/mdx in the App Router. Step and MenuPath (plan.md › "Componentes MDX")
// are added as they are built. check-content validates every <Claim> and <Repo> in content/.
const components: MDXComponents = {
  Claim,
  Repo: RepoCard,
  Warn,
  a: ({ href = "", ...props }) =>
    href.startsWith("/") || href.startsWith("#") ? (
      <a href={href} {...props} />
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
