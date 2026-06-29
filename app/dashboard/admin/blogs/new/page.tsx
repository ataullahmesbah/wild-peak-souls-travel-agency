"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ArrowLeft, Save, Eye, Upload, Image, Heading1, Heading2, Bold, Italic, List, ListOrdered, Quote, Link as LinkIcon, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardPathForRole } from "@/config/dashboard";
import { isAdmin } from "@/lib/roles";

export default function NewBlogPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "guest";
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [activeFormat, setActiveFormat] = useState<string>("p");

  if (!isAdmin(role)) redirect(getDashboardPathForRole(role));

  const insertFormat = (type: string) => {
    const textarea = document.getElementById("blog-content") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    let before = content.substring(0, start);
    let after = content.substring(end);
    let wrapped = "";
    switch (type) {
      case "h1": wrapped = `\n# ${selected || "Heading"}\n`; break;
      case "h2": wrapped = `\n## ${selected || "Heading"}\n`; break;
      case "bold": wrapped = `**${selected || "bold text"}**`; break;
      case "italic": wrapped = `*${selected || "italic text"}*`; break;
      case "ul": wrapped = `\n- ${selected || "List item"}\n`; break;
      case "ol": wrapped = `\n1. ${selected || "List item"}\n`; break;
      case "quote": wrapped = `\n> ${selected || "Quote text"}\n`; break;
      case "link": wrapped = `[${selected || "Link text"}](https://example.com)`; break;
      case "image": wrapped = `\n![${selected || "Alt text"}](https://images.pexels.com/.../image.jpg)\n`; break;
    }
    setContent(before + wrapped + after);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + wrapped.length;
      textarea.focus();
    }, 0);
  };

  const renderPreview = (text: string) => {
    return text
      .replace(/^# (.+)$/gm, '<h1 class="font-display text-2xl font-bold mt-6 mb-3">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="font-display text-xl font-semibold mt-5 mb-2">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^\> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic text-foreground/70 my-3">$1</blockquote>')
      .replace(/^\- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-lg border w-full max-h-80 object-cover" />')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80">$1</a>')
      .replace(/\n\n/g, '</p><p class="my-3">')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <a href="/dashboard/admin/blogs"><ArrowLeft className="h-4 w-4" /> Back to Blogs</a>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setMode(mode === "edit" ? "preview" : "edit")}>
            <Eye className="h-4 w-4" /> {mode === "edit" ? "Preview" : "Edit"}
          </Button>
          <Button size="sm" className="gap-2"><Save className="h-4 w-4" /> Save Draft</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border/60 p-6">
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Blog Post Title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-none bg-transparent font-display text-3xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0 h-auto"
                />
              </div>
              <div>
                <Input
                  placeholder="Write a short excerpt..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="border-none bg-transparent text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0 h-auto"
                />
              </div>
            </div>
          </Card>

          {mode === "edit" ? (
            <Card className="border-border/60 overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-1 border-b border-border/60 bg-muted/30 p-2 flex-wrap">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat("h1")}><Heading1 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat("h2")}><Heading2 className="h-4 w-4" /></Button>
                <div className="mx-1 h-5 w-px bg-border/60" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat("bold")}><Bold className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat("italic")}><Italic className="h-4 w-4" /></Button>
                <div className="mx-1 h-5 w-px bg-border/60" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat("ul")}><List className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat("ol")}><ListOrdered className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat("quote")}><Quote className="h-4 w-4" /></Button>
                <div className="mx-1 h-5 w-px bg-border/60" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat("link")}><LinkIcon className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat("image")}><Image className="h-4 w-4" /></Button>
              </div>
              <Textarea
                id="blog-content"
                placeholder="Write your story here... Use the toolbar for formatting."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] border-none bg-transparent resize-none rounded-none focus-visible:ring-0 px-4 py-3 text-base leading-relaxed"
              />
              <div className="border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
                {content.length} characters | Markdown formatting supported
              </div>
            </Card>
          ) : (
            <Card className="border-border/60 p-6">
              {coverUrl && (
                <img src={coverUrl} alt="Cover" className="w-full h-64 object-cover rounded-lg mb-6" />
              )}
              <h1 className="font-display text-3xl font-bold mb-4">{title || "Untitled Post"}</h1>
              <p className="text-lg text-muted-foreground mb-6">{excerpt}</p>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderPreview(content) || "<p class='text-muted-foreground'>Start writing to see the preview...</p>" }} />
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/60 p-4">
            <h3 className="font-display font-semibold text-sm mb-4">Post Settings</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Category</Label>
                <Input placeholder="Select category" className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Tags</Label>
                <Input placeholder="travel, hiking, nepal" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 text-sm" />
                <p className="mt-1 text-xs text-muted-foreground">Separate with commas</p>
              </div>
              <div>
                <Label className="text-xs">Cover Image</Label>
                <div className="mt-1">
                  {coverUrl ? (
                    <div className="relative">
                      <img src={coverUrl} alt="Cover" className="w-full h-32 object-cover rounded-lg" />
                      <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setCoverUrl("")}>Remove</Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border/60 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-xs text-muted-foreground">Upload cover image</p>
                    </div>
                  )}
                </div>
                <Input placeholder="Or paste image URL" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="mt-2 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Read Time</Label>
                <Input placeholder="e.g. 5 min" className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs">SEO Title</Label>
                <Input placeholder="SEO title" className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs">SEO Description</Label>
                <Textarea placeholder="Meta description" className="mt-1 text-sm min-h-[60px]" />
              </div>
            </div>
          </Card>

          <Card className="border-border/60 p-4">
            <h3 className="font-display font-semibold text-sm mb-3">Publishing</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full gap-2"><Save className="h-4 w-4" /> Save Draft</Button>
              <Button className="w-full gap-2"><Eye className="h-4 w-4" /> Publish Now</Button>
            </div>
            <div className="mt-3 flex gap-2">
              <Badge variant="outline">Draft</Badge>
              <Badge variant="outline">Allow Comments</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
