# Converts Obsidian-style callouts (> [!note] Title ...) into styled divs.
# Runs as a post-render hook on the rendered HTML of posts and pages, so it
# works regardless of how kramdown rendered the blockquote.
#
# Handles both of the forms that kramdown's GFM parser can produce for:
#
#   >[!note]
#   >Some text on the next line
#
# 1) hard-wrap form (no blank line between quoted lines):
#      <p>[!note]<br />\nSome text on the next line</p>
# 2) separate-paragraph form (title given, blank quoted line, or multiple
#    paragraphs in the callout):
#      <p>[!note] Some Title</p>\n<p>Some text...</p>
module Jekyll
  module Callouts
    MARKER_RE = /\A\s*<p>\s*\[!(\w+)\]-?\s*/i
    TERMINATOR_RE = /\A(.*?)(<br\s*\/?>\s*|<\/p>)/im

    def self.convert(html)
      html.gsub(/<blockquote>(.*?)<\/blockquote>/sim) do |block|
        inner = $1
        marker_match = inner.match(MARKER_RE)
        next block unless marker_match

        type = marker_match[1].downcase
        rest = inner[marker_match.end(0)..-1]

        term_match = rest.match(TERMINATOR_RE)
        if term_match
          title = term_match[1].strip
          body = rest[term_match.end(0)..-1]
        else
          title = ""
          body = rest
        end
        title = type.capitalize if title.empty?

        <<~HTML
          <div class="callout callout-#{type}">
            <div class="callout-title">#{title}</div>
            <div class="callout-body">#{body}</div>
          </div>
        HTML
      end
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |doc|
  next unless doc.output_ext == ".html"
  doc.output = Jekyll::Callouts.convert(doc.output)
end
