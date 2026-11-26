# Converts Obsidian-style callouts (> [!note] Title ...) into styled divs.
# Runs as a post-render hook on the rendered HTML of posts and pages.
#
# Handles both forms kramdown's GFM parser produces for:
#   >[!note]
#   >Some text on the next line
#
# 1) hard-wrap (no blank line between quoted lines):
#      <p>[!note]<br />Some text</p>
# 2) separate-paragraph (title given, or multiple paragraphs):
#      <p>[!note] Some Title</p><p>Some text...</p>
#
# Ruby regex flags are only i/m/x/o -- there is no /s ("dotall") flag like
# in PCRE/Python. Ruby's /m already means "dot matches newline".
module Jekyll
  module Callouts
    MARKER_RE = /\A\s*<p>\s*\[!(\w+)\]-?\s*/i
    TERMINATOR_RE = /\A(.*?)(<br\s*\/?>\s*|<\/p>)/im
    TRAILING_P_RE = /<\/p>\s*\z/i

    def self.convert(html)
      html.gsub(/<blockquote>(.*?)<\/blockquote>/im) do |block|
        inner = $1
        marker_match = inner.match(MARKER_RE)
        next block unless marker_match

        type = marker_match[1].downcase
        rest = inner[marker_match.end(0)..-1]
        term_match = rest.match(TERMINATOR_RE)

        if term_match
          title = term_match[1].strip
          body = rest[term_match.end(0)..-1]
          was_br = term_match[2].downcase.include?("<br")
        else
          title = ""
          body = rest
          was_br = false
        end
        title = type.capitalize if title.empty?
        body = body.sub(TRAILING_P_RE, "") if was_br

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
