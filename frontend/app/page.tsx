import { BillingMeter } from '@/components/landing/billing-meter';

export default function HomePage() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-100 selection:bg-brass selection:text-neutral-950">
			{/* Malla de Fondo Brutalista / Grid Pattern */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

			{/* Resplandor de Fondo (Glow Effect) */}
			<div className="absolute -top-40 -left-40 h-125 w-125 rounded-full bg-brass/10 blur-[140px] pointer-events-none" />
			<div className="absolute top-1/3 -right-40 h-150 w-150 rounded-full bg-ledger-green/10 blur-[160px] pointer-events-none" />

			{/* Navbar con Efecto Glassmorphism y Bordes Definidos */}
			<nav className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
					<span className="group flex items-center gap-2 font-display text-xl font-black tracking-tight text-white cursor-pointer">
						<span className="inline-block h-3 w-3 bg-brass transition-transform duration-300 group-hover:rotate-45 group-hover:scale-125" />
						Freelance Hub
					</span>
					<div className="flex items-center gap-6">
						<a
							href="/login"
							className="text-sm font-medium text-neutral-400 transition-colors hover:text-white"
						>
							Log in
						</a>
						<a
							href="/register"
							className="relative group overflow-hidden rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-neutral-950 transition-all duration-300 hover:scale-105 hover:bg-brass hover:shadow-[0_0_25px_rgba(234,179,8,0.4)]"
						>
							<span className="relative z-10">Start for free</span>
						</a>
					</div>
				</div>
			</nav>

			<section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-20 sm:py-32 lg:grid-cols-2">
				<div>
					<div className="inline-flex items-center gap-2 rounded-full border border-ledger-green/30 bg-ledger-green/10 px-3.5 py-1.5 backdrop-blur-sm">
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ledger-green opacity-75" />
							<span className="relative inline-flex h-2 w-2 rounded-full bg-ledger-green" />
						</span>
						<p className="font-mono text-xs uppercase tracking-[0.25em] text-ledger-green font-semibold">
							Management + Invoicing for Freelancers
						</p>
					</div>

					<h1 className="mt-8 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-7xl">
						Clock does not stop.
						<br />
						<span className="text-white">Your bill</span>
						<br />
						should not either.
					</h1>

					<p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-400">
						Record your hours, generate invoices with one click, and get
						paid without chasing anyone. Every minute worked is{' '}
						<span className="font-semibold text-neutral-200">
							{' '}
							literally{' '}
						</span>
						accounted for.
					</p>

					<div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-5">
						<a
							href="/register"
							className="inline-flex items-center justify-center gap-3 rounded-xl bg-brass px-8 py-4 text-sm font-black text-neutral-950 transition-all duration-300 hover:scale-105 hover:bg-brass-bright hover:shadow-[0_0_35px_rgba(234,179,8,0.5)] active:scale-95"
						>
							<span>Start for free</span>
							<span className="text-base transition-transform duration-300 group-hover:translate-x-1">
								→
							</span>
						</a>
						<span className="text-sm font-medium text-neutral-400 flex items-center gap-2">
							<span className="inline-block h-1.5 w-1.5 rounded-full bg-brass/60" />
							No credit card. 3 clients for free.
						</span>
					</div>
				</div>

				<div className="relative group lg:justify-self-end w-full max-w-md">
					<div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-brass/50 via-ledger-green/40 to-brass/20 blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
					<div className="relative rounded-2xl border border-white/10 bg-neutral-900/90 p-3 backdrop-blur-xl shadow-2xl">
						<BillingMeter />
					</div>
				</div>
			</section>

			<section className="relative border-t border-white/10 bg-neutral-900/50 backdrop-blur-lg">
				<div className="mx-auto max-w-6xl px-6 py-28">
					<div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
						<div>
							<span className="font-mono text-xs uppercase tracking-widest text-brass">
								Simplified flow
							</span>
							<h2 className="mt-2 font-display text-4xl font-black text-white sm:text-5xl">
								How it works?
							</h2>
						</div>
						<p className="mt-4 md:mt-0 text-neutral-400 max-w-xs text-sm">
							Designed to automate the accounting of your time without
							frictions.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
						<div className="group relative rounded-2xl border border-white/10 bg-neutral-950/60 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-brass/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
							<div className="flex items-center justify-between">
								<span className="font-mono text-xl font-bold text-brass bg-brass/10 px-3 py-1 rounded-md border border-brass/20">
									01
								</span>
								<span className="h-2 w-2 rounded-full bg-brass opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
							<h3 className="mt-6 font-display text-2xl font-bold text-white group-hover:text-brass transition-colors">
								Start the meter
							</h3>
							<p className="mt-3 text-sm leading-relaxed text-neutral-400">
								One click per project. Time is recorded automatically,
								without spreadsheets.
							</p>
						</div>
						<div className="group relative rounded-2xl border border-white/10 bg-neutral-950/60 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-brass/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
							<div className="flex items-center justify-between">
								<span className="font-mono text-xl font-bold text-brass bg-brass/10 px-3 py-1 rounded-md border border-brass/20">
									02
								</span>
								<span className="h-2 w-2 rounded-full bg-brass opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
							<h3 className="mt-6 font-display text-2xl font-bold text-white group-hover:text-brass transition-colors">
								Stop and check
							</h3>
							<p className="mt-3 text-sm leading-relaxed text-neutral-400">
								Each hour is associated with a project and a client,
								ready to be billed.
							</p>
						</div>

						{/* Paso 3 */}
						<div className="group relative rounded-2xl border border-white/10 bg-neutral-950/60 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-brass/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
							<div className="flex items-center justify-between">
								<span className="font-mono text-xl font-bold text-brass bg-brass/10 px-3 py-1 rounded-md border border-brass/20">
									03
								</span>
								<span className="h-2 w-2 rounded-full bg-brass opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
							<h3 className="mt-6 font-display text-2xl font-bold text-white group-hover:text-brass transition-colors">
								Invoice and collect
							</h3>
							<p className="mt-3 text-sm leading-relaxed text-neutral-400">
								Generate the invoice from the hours worked. The
								calculation never fails.
							</p>
						</div>
					</div>
				</div>
			</section>

			<footer className="border-t border-white/10 bg-neutral-950">
				<div className="mx-auto max-w-6xl px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
					<p>© 2026 Freelance Hub. All rights reserved.</p>
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-ledger-green" />
						<span>Operating systems at 100%</span>
					</div>
				</div>
			</footer>
		</main>
	);
}
