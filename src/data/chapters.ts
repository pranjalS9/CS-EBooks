export interface Chapter {
  id: string;
  title: string;
  content: string; // HTML string rendered inside the book page
  order: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// To add a new chapter:
//   1. Copy the example below and uncomment it.
//   2. Give it a unique `id`, the next `order` number, and a `title`.
//   3. Write your HTML content in the `content` field.
//   4. Run `npm run build` (or `npm run dev`) — no database needed.
// ─────────────────────────────────────────────────────────────────────────────

export const chapters: Chapter[] = [
  // {
  //   id: 'ch-01',
  //   order: 1,
  //   title: 'Chapter Title',
  //   content: `<h3>Subtitle</h3><p>Your content here...</p>`,
  // },
];
