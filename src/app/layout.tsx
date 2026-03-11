import Link from 'next/link';
import { Providers } from '@/components/providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <Providers>
          <nav className="bg-gray-800 p-4 shadow-md">
            <div className="container mx-auto flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
                ReviewKit
              </Link>
              <ul className="flex space-x-6">
                <li><Link href="/" className="text-gray-300 hover:text-blue-400 transition-colors text-lg">Home</Link></li>
                <li><Link href="/history" className="text-gray-300 hover:text-blue-400 transition-colors text-lg">History</Link></li>
                <li><Link href="/templates" className="text-gray-300 hover:text-blue-400 transition-colors text-lg">Templates</Link></li>
                <li><Link href="/commands" className="text-gray-300 hover:text-blue-400 transition-colors text-lg">Commands</Link></li>
                <li><Link href="/docs" className="text-gray-300 hover:text-blue-400 transition-colors text-lg">Custom Docs</Link></li>
              </ul>
            </div>
          </nav>
          <main className="container mx-auto p-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
