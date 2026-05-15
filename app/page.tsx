import EvaluatorPicker from "@/components/EvaluatorPicker";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-seedz-yellow font-semibold">
            Hackathon Seedz
          </p>
          <h1 className="text-3xl font-bold leading-tight">Avaliação</h1>
          <p className="text-white/70 text-base">
            Digite seu nome para começar
          </p>
        </header>

        <EvaluatorPicker />
      </div>
    </main>
  );
}
