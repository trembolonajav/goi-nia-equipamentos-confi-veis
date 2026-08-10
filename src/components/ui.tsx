import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { imgOf } from "../lib/images";

/** Tag colorida (mesma ideia do TAG(cor) do mockup). */
export function Tag({ cor, children }: { cor: string; children: ReactNode }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", minHeight: 24, padding: "2px 10px",
      borderRadius: 999, border: `1px solid ${cor}`, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", color: cor,
    }}>{children}</span>
  );
}

export function Thumb({ img, w = 56, h = 46 }: { img: string; w?: number; h?: number }) {
  return <span style={{ width: w, height: h, flex: "none", borderRadius: 8, border: "1px solid var(--border)", background: `var(--input) center/cover no-repeat`, backgroundImage: img ? `url(${imgOf(img)})` : undefined }} />;
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  const migratedTitles: Record<string, string> = {
    "Contas a receber": "Cobranças",
    "Lançamentos": "Fluxo de caixa",
  };
  const displayTitle = migratedTitles[title] ?? title;
  return (
    <div className="spread">
      <div>
        <h1 className="h1">{displayTitle}</h1>
        {sub && <p className="lead">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

interface ToastApi { toast: (msg: string) => void; }
const ToastCtx = createContext<ToastApi>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);
  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, msg }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="toast-wrap">{items.map((i) => <div className="toast" key={i.id}>{i.msg}</div>)}</div>
    </ToastCtx.Provider>
  );
}
export function useToast(): ToastApi { return useContext(ToastCtx); }
