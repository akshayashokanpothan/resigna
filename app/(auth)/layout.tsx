export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-4">
      {/* Research grid from the brand kit (03_Backgrounds), faded towards the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/brand/patterns/research-grid-pattern.svg')] bg-[length:1200px_800px] bg-center opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
