import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Image Frame | Pro Camera Metadata Overlays',
  description: 'Add beautiful camera metadata frames and watermarks to your photos. Support EXIF extraction, custom styles, and batch processing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="layout-wrapper">
          <header className="header">
            <div className="header-container">
              <div className="logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>Image Frame</span>
              </div>
              <nav className="nav-links">
                <a href="#" className="active">Editor</a>
                <a href="#">Batch</a>
                <a href="#">Gallery</a>
              </nav>
            </div>
          </header>
          <main className="main-content">
            {children}
          </main>
          <footer className="footer">
            <p>Built with Next.js & NestJS. Inspired by Liit / Cameramark.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
