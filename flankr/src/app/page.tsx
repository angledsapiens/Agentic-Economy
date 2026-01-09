import { Wingman } from "@/components/Wingman";

export default function Home() {
  return (
    <main>
      <Wingman />
      <div className="fixed bottom-2 right-2 text-[10px] text-zinc-800 font-mono opacity-50 pointer-events-none">
        Build: {new Date().toISOString()} | v20.3
      </div>
    </main>
  );
}
