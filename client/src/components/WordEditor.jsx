// Tiptap imports
import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useState } from "react";
import {StarterKit} from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import { Icons } from "./UI";

// ── TOOLBAR ──────────────────────────────────
function Toolbar({ editor, disable }) {
  if (!editor) return null;

  const tools = [
    // text formatting
    {
      label: "B",
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      style: { fontWeight: 700 },
    },
    {
      label: "I",
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      style: { fontStyle: "italic" },
    },
    {
      label: "U",
      title: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
      style: { textDecoration: "underline" },
    },
    {
      label: "S",
      title: "Strikethrough",
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
      style: { textDecoration: "line-through" },
    },
    { divider: true },

    // headings
    {
      label: "H1",
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
    },
    {
      label: "H2",
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "H3",
      title: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    { divider: true },

    // alignment
    {
      label: Icons.alignleft,
      title: "Align left",
      action: () => editor.chain().focus().setTextAlign("left").run(),
      active: editor.isActive({ textAlign: "left" }),
    },
    {
      label: Icons.alignCenter,
      title: "Align center",
      action: () => editor.chain().focus().setTextAlign("center").run(),
      active: editor.isActive({ textAlign: "center" }),
    },
    {
      label: Icons.alignRight,
      title: "Align right",
      action: () => editor.chain().focus().setTextAlign("right").run(),
      active: editor.isActive({ textAlign: "right" }),
    },
    { divider: true },

    // lists
    {
      label: Icons.bullet,
      title: "Bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: Icons.numbers,
      title: "Ordered list",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    { divider: true },

    // blocks
    {
      label: "❝",
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      label: "</>",
      title: "Code block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive("codeBlock"),
    },
    { divider: true },

    // history
    {
      label: "↩",
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
    },
    {
      label: "↪",
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
    },
  ];

  return (
    <div className="editor-toolbar">
      {tools.map((tool, i) =>
        tool.divider ? (
          <div key={i} className="editor-toolbar-divider" />
        ) : (
          <button
            key={i}
            title={tool.title}
            className={`editor-toolbar-btn ${tool.active ? "active" : ""}`}
            style={tool.style}
            disabled={tool.disabled || disable}
            onMouseDown={e => { e.preventDefault(); tool.action(); }}
          >
            {tool.label}
          </button>
        )
      )}
    </div>
  );
}

function WordEditor({ content, onChange, published }) {

    useEffect(()=>{
        if(published)
            editor.setOptions({editable: false})
        else
            editor.setOptions({editable: true})
    },[published])


    const editor = useEditor({
        extensions: [
        StarterKit.configure(),
        Placeholder.configure({
            placeholder: "Start writing...",
        }),
        CharacterCount,
        TextAlign.configure({
            types: ["heading", "paragraph"],
        }),
        ],
        content: content || "",
        onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (
        editor &&
        content !== editor.getHTML()
        ) {
        editor.commands.setContent(content || "", false);
        }

    }, [content, editor]);

    if (!editor) return null;

    return (
        <div className="editor-wrapper">
        <Toolbar editor={editor} disable={published}/>
        <EditorContent
            editor={editor}
            className="editor-textarea"
        />
        </div>
    );
    }

export default WordEditor;