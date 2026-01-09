import { Wingman } from "@/components/Wingman";

export default function Home() {
  return (
    <main>
      <Wingman />
      <div className="fixed bottom-2 right-2 text-[10px] text-white font-mono opacity-80 pointer-events-none">
        Build: {new Date().toISOString()} | v21.1 (Visible)
      </div>
    </main>
  );
}
