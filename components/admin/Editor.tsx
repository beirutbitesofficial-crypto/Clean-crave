"use client";

import { useEffect, useMemo, useState } from "react";
import { logout, save } from "@/app/admin/actions";
import type { Content } from "@/lib/content";
import { type Category, type Item, money } from "@/lib/menu";

const field = "min-h-12 w-full rounded-xl border border-ivory/15 bg-ink px-3.5 text-base text-ivory placeholder:text-ivory/30 focus:border-gold/70 focus:outline-none";
const area = `${field} py-3 leading-relaxed`;
const small = "inline-flex min-h-11 whitespace-nowrap items-center justify-center rounded-full border border-ivory/20 px-4 text-sm font-semibold text-ivory/85 transition-colors hover:border-gold/60 hover:text-gold disabled:opacity-30 disabled:hover:border-ivory/20 disabled:hover:text-ivory/85";
const danger = "inline-flex min-h-11 items-center justify-center rounded-full border border-[#ff9d8a]/40 px-4 text-sm font-semibold text-[#ff9d8a] transition-colors hover:bg-[#ff9d8a]/10";

const newId = () => `new-${Math.random().toString(36).slice(2, 10)}`;
const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
};

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-semibold text-ivory/65">{label}</span>
      {children}
    </label>
  );
}

/** A number box that lets you type "7." on the way to "7.5" and treats empty as 0. */
function Num({ value, onChange, decimal = false }: { value: number; onChange: (n: number) => void; decimal?: boolean }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      className={field}
      dir="ltr"
      inputMode={decimal ? "decimal" : "numeric"}
      value={draft ?? String(value)}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const raw = e.target.value.replace(",", ".").replace(decimal ? /[^0-9.]/g : /[^0-9]/g, "");
        setDraft(raw);
        const n = Number(raw);
        onChange(Number.isFinite(n) ? n : 0);
      }}
      onBlur={() => setDraft(null)}
    />
  );
}

function MealEditor({
  item,
  onChange,
  onDelete,
  onMove,
  first,
  last,
  cats,
  catId,
  onMoveTo,
}: {
  item: Item;
  onChange: (next: Item) => void;
  onDelete: () => void;
  onMove: (by: number) => void;
  first: boolean;
  last: boolean;
  cats: Category[];
  catId: string;
  onMoveTo: (catId: string) => void;
}) {
  const set = (patch: Partial<Item>) => onChange({ ...item, ...patch });
  return (
    <div className="space-y-4 border-t border-ivory/10 px-4 pb-5 pt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name (English)">
          <input className={field} dir="ltr" value={item.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Name (Arabic)">
          <input className={field} dir="rtl" lang="ar" value={item.ar.name} onChange={(e) => set({ ar: { ...item.ar, name: e.target.value } })} />
        </Field>
        <Field label="Ingredients (English)">
          <textarea className={area} dir="ltr" rows={3} value={item.desc} onChange={(e) => set({ desc: e.target.value })} />
        </Field>
        <Field label="Ingredients (Arabic)">
          <textarea className={area} dir="rtl" lang="ar" rows={3} value={item.ar.desc} onChange={(e) => set({ ar: { ...item.ar, desc: e.target.value } })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Field label="Price ($)" className="col-span-2 sm:col-span-1">
          <Num decimal value={item.price} onChange={(price) => set({ price })} />
        </Field>
        <Field label="Calories">
          <Num value={item.kcal} onChange={(kcal) => set({ kcal })} />
        </Field>
        <Field label="Protein (g)">
          <Num value={item.p} onChange={(p) => set({ p })} />
        </Field>
        <Field label="Carbs (g)">
          <Num value={item.c} onChange={(c) => set({ c })} />
        </Field>
        <Field label="Fat (g)">
          <Num value={item.f} onChange={(f) => set({ f })} />
        </Field>
      </div>
      <label className="flex min-h-12 items-center gap-3 rounded-xl border border-ivory/15 px-3.5">
        <input type="checkbox" className="h-5 w-5 accent-[#ddb65e]" checked={Boolean(item.soldOut)} onChange={(e) => set({ soldOut: e.target.checked || undefined })} />
        <span className="text-[15px] text-ivory/90">Sold out — stays on the menu, can’t be ordered</span>
      </label>
      {cats.length > 1 && (
        <Field label="Category">
          <select className={field} value={catId} onChange={(e) => onMoveTo(e.target.value)}>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title || "Untitled"}
              </option>
            ))}
          </select>
        </Field>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={small} disabled={first} onClick={() => onMove(-1)}>
          ↑ Move up
        </button>
        <button type="button" className={small} disabled={last} onClick={() => onMove(1)}>
          ↓ Move down
        </button>
        <button type="button" className={`${danger} ms-auto`} onClick={() => confirm(`Delete “${item.name || "this meal"}”?`) && onDelete()}>
          Delete meal
        </button>
      </div>
    </div>
  );
}

export default function Editor({ initial, canSave }: { initial: Content; canSave: boolean }) {
  const [content, setContent] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [openMeal, setOpenMeal] = useState<string | null>(null);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const dirty = useMemo(() => JSON.stringify(content) !== saved, [content, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setMenu = (fn: (menu: Category[]) => Category[]) => (setNote(null), setContent((c) => ({ ...c, menu: fn(c.menu) })));
  const setCat = (id: string, fn: (cat: Category) => Category) => setMenu((m) => m.map((c) => (c.id === id ? fn(c) : c)));
  const setContact = (patch: Partial<Content["contact"]>) => (setNote(null), setContent((c) => ({ ...c, contact: { ...c.contact, ...patch } })));

  async function onSave() {
    setBusy(true);
    setNote(null);
    try {
      const res = await save(content);
      if (res.ok) {
        setContent(res.content);
        setSaved(JSON.stringify(res.content));
        setNote({ kind: "ok", text: "Saved. The site is updated." });
      } else setNote({ kind: "error", text: res.error });
    } catch {
      setNote({ kind: "error", text: "Could not save. Check the connection and try again." });
    }
    setBusy(false);
  }

  const meals = content.menu.reduce((n, c) => n + c.items.length, 0);

  return (
    <div dir="ltr" lang="en" className="min-h-screen pb-32">
      <header className="sticky top-0 z-20 border-b border-ivory/10 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <p className="me-auto whitespace-nowrap font-serif text-lg text-gold">
            CleanCrave <span className="text-ivory/60">Admin</span>
          </p>
          <a href="/" target="_blank" rel="noopener noreferrer" className={small}>
            View site
          </a>
          <form action={logout}>
            <button type="submit" className={small}>
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-10 px-4 pt-8">
        {!canSave && (
          <p role="alert" className="rounded-2xl border border-[#ff9d8a]/40 bg-[#ff9d8a]/10 p-4 leading-relaxed text-[#ffc4b8]">
            Storage is not connected yet, so edits can’t be saved. In Vercel open the project → Storage → Create → Blob, connect it to this project, then redeploy.
          </p>
        )}

        <section aria-labelledby="contact-h">
          <h2 id="contact-h" className="font-serif text-3xl text-ivory">
            Contact
          </h2>
          <div className="mt-4 grid gap-4 rounded-2xl border border-ivory/12 bg-ink-2 p-4 sm:grid-cols-2">
            <Field label="WhatsApp number for orders (with country code)">
              <input className={field} dir="ltr" inputMode="tel" value={content.contact.whatsapp} onChange={(e) => setContact({ whatsapp: e.target.value })} placeholder="96181640785" />
            </Field>
            <Field label="Phone as shown on the site">
              <input className={field} dir="ltr" inputMode="tel" value={content.contact.phone} onChange={(e) => setContact({ phone: e.target.value })} placeholder="+961 81 640 785" />
            </Field>
            <Field label="Instagram link (empty hides it)" className="sm:col-span-2">
              <input className={field} dir="ltr" inputMode="url" autoCapitalize="none" value={content.contact.instagram} onChange={(e) => setContact({ instagram: e.target.value })} placeholder="https://instagram.com/…" />
            </Field>
          </div>
        </section>

        <section aria-labelledby="menu-h">
          <div className="flex items-end justify-between gap-4">
            <h2 id="menu-h" className="font-serif text-3xl text-ivory">
              Menu
            </h2>
            <p className="text-sm text-ivory/55">
              {meals} meals · {content.menu.length} categories
            </p>
          </div>

          <div className="mt-4 space-y-6">
            {content.menu.map((cat, ci) => (
              <div key={cat.id} className="overflow-hidden rounded-2xl border border-ivory/12 bg-ink-2">
                <div className="flex items-center gap-2 p-4">
                  <h3 className="me-auto min-w-0 truncate font-display text-2xl uppercase tracking-wide text-gold">{cat.title || "Untitled"}</h3>
                  <button type="button" className={small} aria-expanded={openCat === cat.id} onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}>
                    {openCat === cat.id ? "Done" : "Edit category"}
                  </button>
                </div>

                {openCat === cat.id && (
                  <div className="space-y-4 border-t border-ivory/10 px-4 pb-5 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Title (English)">
                        <input className={field} dir="ltr" value={cat.title} onChange={(e) => setCat(cat.id, (c) => ({ ...c, title: e.target.value }))} />
                      </Field>
                      <Field label="Title (Arabic)">
                        <input className={field} dir="rtl" lang="ar" value={cat.ar.title} onChange={(e) => setCat(cat.id, (c) => ({ ...c, ar: { ...c.ar, title: e.target.value } }))} />
                      </Field>
                      <Field label="Line under the title (English)">
                        <input className={field} dir="ltr" value={cat.script} onChange={(e) => setCat(cat.id, (c) => ({ ...c, script: e.target.value }))} />
                      </Field>
                      <Field label="Line under the title (Arabic)">
                        <input className={field} dir="rtl" lang="ar" value={cat.ar.script} onChange={(e) => setCat(cat.id, (c) => ({ ...c, ar: { ...c.ar, script: e.target.value } }))} />
                      </Field>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={small} disabled={ci === 0} onClick={() => setMenu((m) => move(m, ci, ci - 1))}>
                        ↑ Move up
                      </button>
                      <button type="button" className={small} disabled={ci === content.menu.length - 1} onClick={() => setMenu((m) => move(m, ci, ci + 1))}>
                        ↓ Move down
                      </button>
                      <button
                        type="button"
                        className={`${danger} ms-auto`}
                        onClick={() => confirm(`Delete “${cat.title || "this category"}” and its ${cat.items.length} meals?`) && setMenu((m) => m.filter((c) => c.id !== cat.id))}
                      >
                        Delete category
                      </button>
                    </div>
                  </div>
                )}

                <ul>
                  {cat.items.map((item, ii) => {
                    const open = openMeal === item.id;
                    return (
                      <li key={item.id} className="border-t border-ivory/10">
                        <button type="button" aria-expanded={open} onClick={() => setOpenMeal(open ? null : item.id)} className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-start">
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-semibold text-ivory">{item.name || "New meal"}</span>
                            <span className="block truncate text-[13px] text-ivory/50">
                              {item.kcal} kcal · P {item.p} · C {item.c} · F {item.f}
                            </span>
                          </span>
                          {item.soldOut && <span className="rounded-full border border-[#ff9d8a]/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#ff9d8a]">Sold out</span>}
                          <span className="font-cond text-lg font-semibold text-gold">{money(item.price)}</span>
                          <span aria-hidden="true" className={`text-ivory/50 transition-transform ${open ? "rotate-180" : ""}`}>
                            ▾
                          </span>
                        </button>
                        {open && (
                          <MealEditor
                            item={item}
                            first={ii === 0}
                            last={ii === cat.items.length - 1}
                            cats={content.menu}
                            catId={cat.id}
                            onChange={(next) => setCat(cat.id, (c) => ({ ...c, items: c.items.map((i) => (i.id === item.id ? next : i)) }))}
                            onDelete={() => setCat(cat.id, (c) => ({ ...c, items: c.items.filter((i) => i.id !== item.id) }))}
                            onMove={(by) => setCat(cat.id, (c) => ({ ...c, items: move(c.items, ii, ii + by) }))}
                            onMoveTo={(to) =>
                              setMenu((m) => m.map((c) => (c.id === cat.id ? { ...c, items: c.items.filter((i) => i.id !== item.id) } : c.id === to ? { ...c, items: [...c.items, item] } : c)))
                            }
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="border-t border-ivory/10 p-4">
                  <button
                    type="button"
                    className={`${small} w-full`}
                    onClick={() => {
                      const id = newId();
                      setCat(cat.id, (c) => ({ ...c, items: [...c.items, { id, name: "", desc: "", ar: { name: "", desc: "" }, price: 0, kcal: 0, p: 0, c: 0, f: 0 }] }));
                      setOpenMeal(id);
                    }}
                  >
                    + Add a meal to {cat.title || "this category"}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className={`${small} w-full`}
              onClick={() => {
                const id = newId();
                setMenu((m) => [...m, { id, title: "", script: "", ar: { title: "", script: "" }, items: [] }]);
                setOpenCat(id);
              }}
            >
              + Add a category
            </button>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ivory/10 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <p role="status" className={`me-auto text-sm leading-snug ${note?.kind === "error" ? "text-[#ff9d8a]" : note ? "text-wa" : "text-ivory/60"}`}>
            {note?.text ?? (dirty ? "You have unsaved changes." : "Everything is saved.")}
          </p>
          <button type="button" onClick={onSave} disabled={!dirty || busy || !canSave} className="btn btn-gold !min-h-12 disabled:opacity-40">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
