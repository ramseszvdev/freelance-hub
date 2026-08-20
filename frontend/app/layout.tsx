import type { Metadata } from 'next';
import { Fraunces, Space_Mono, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const fraunces = Fraunces({
	subsets: ['latin'],
	variable: '--font-fraunces',
	weight: ['400', '500', '600'],
});

const spaceMono = Space_Mono({
	subsets: ['latin'],
	variable: '--font-space-mono',
	weight: ['400', '700'],
});

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
});

export const metadata: Metadata = {
	title: 'Freelance Hub — The meter will not stop',
	description: 'Project management, hours, and billing for freelancers',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={`${fraunces.variable} ${spaceMono.variable} ${inter.variable}`}
		>
			<body className="font-sans">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
