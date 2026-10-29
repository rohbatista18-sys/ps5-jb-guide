import type { MDXComponents } from "mdx/types";
import Claim from "@/components/Claim";
import Checklist from "@/components/Checklist";
import MenuPath from "@/components/MenuPath";
import RepoCard from "@/components/RepoCard";
import Step from "@/components/Step";
import Warn from "@/components/Warn";

// Required by @next/mdx in the App Router. check-content validates every <Claim>, <Repo> and
// <Step src> in content/.
const components: MDXComponents = {
  Checklist,
  Claim,
  MenuPath,
  Repo: RepoCard,
  Step,
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
