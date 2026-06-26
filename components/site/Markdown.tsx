interface MarkdownProps {
  html: string;
  className?: string;
}

export function Markdown({ html, className = "" }: MarkdownProps) {
  return (
    <div
      className={`markdown ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
