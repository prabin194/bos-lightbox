import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsDir = path.join(__dirname, "..", "docs");
const pages = ["index.html", "documentation.html", "roadmap.html", "changelogs.html"];
const entries = [];

function stripHtml(html) {
  return html.replace(/<style>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "section";
}

for (const file of pages) {
  const filePath = path.join(docsDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn("  ✗ " + file + " — not found");
    continue;
  }

  const html = fs.readFileSync(filePath, "utf8");
  let sections = [];
  const headingRegex = /<h([23])([^>]*)>([\s\S]*?)<\/h[23]>/gi;
  let match;
  let lastIndex = 0;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const attrs = match[2] || "";
    const headingText = stripHtml(match[3]);
    const idMatch = attrs.match(/id="([^"]+)"/);
    const id = idMatch ? idMatch[1] : slugify(headingText);

    const contentStart = match.index + match[0].length;
    const nextMatch = headingRegex.exec(html);
    const contentEnd = nextMatch ? nextMatch.index : html.length;
    const content = stripHtml(html.substring(contentStart, contentEnd));

    if (level === 2 || sections.length === 0) {
      sections.push({ title: headingText, id, content, page: file.replace(".html", "") });
    } else {
      // h3 — append to last section
      if (sections.length > 0) {
        sections[sections.length - 1].content += " " + content;
        sections[sections.length - 1].title += " — " + headingText;
      }
    }
  }

  if (sections.length === 0) {
    // fallback: use main content
    const mainMatch = html.match(/<main>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
      sections.push({
        title: file.replace(".html", "").charAt(0).toUpperCase() + file.replace(".html", "").slice(1),
        id: "page",
        content: stripHtml(mainMatch[1]).substring(0, 300),
        page: file.replace(".html", ""),
      });
    }
  }

  for (const section of sections) {
    entries.push({
      t: section.title,
      u: section.page + ".html" + (section.id !== "page" ? "#" + section.id : ""),
      p: section.page.charAt(0).toUpperCase() + section.page.slice(1),
      c: section.content.substring(0, 400),
    });
    console.log("  ✓ " + file + " → " + section.title);
  }
}

fs.writeFileSync(path.join(docsDir, "search-index.json"), JSON.stringify(entries, null, 2));
console.log("\\n✅ Written " + entries.length + " search entries to search-index.json");
