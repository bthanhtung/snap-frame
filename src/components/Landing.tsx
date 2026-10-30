'use client';
import { Aperture, Frame, ImagePlus, Layers, Loader2, Lock, Moon, Share2, Sparkles, Sun, WifiOff } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { usePrefs } from '@/state/prefs';
import { Logo } from './ui';

const SAMPLES = ['/samples/halong.jpg', '/samples/terraces.jpg'];
const Github = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>
);

export function Landing({ onPick, onFiles, importing }: { onPick(): void; onFiles(f: File[]): void; importing: boolean }) {
  const t = useT();
  const prefs = usePrefs();
  async function sample() {
    const files = await Promise.all(SAMPLES.map(async u => {
      const b = await fetch(u).then(r => r.blob());
      return new File([b], u.split('/').pop()!, { type: 'image/jpeg' });
    }));
    onFiles(files);
  }
  const features = [
    [<Sparkles key="a" />, t('l.f1', '22 film looks'), t('l.f1d', 'Portra, Ektar, Gold, Classic Chrome, Velvia, Tri-X, CineStill… with strength control.')],
    [<Frame key="b" />, t('l.f2', '13 frames'), t('l.f2d', 'Classic, Polaroid, film strip, slide mount, blur backdrop, date stamp — any aspect ratio.')],
    [<Aperture key="c" />, t('l.f3', 'EXIF captions'), t('l.f3d', 'Camera, lens and settings read from your photo, fully editable.')],
    [<Layers key="d" />, t('l.f4', 'Batch editing'), t('l.f4d', 'Open many photos, apply one look to all, export a ZIP.')],
    [<Lock key="e" />, t('l.f5', '100% private'), t('l.f5d', 'Processed by your GPU. Photos never leave your device.')],
    [<WifiOff key="f" />, t('l.f6', 'Works offline'), t('l.f6d', 'Install it as an app. No account, no upload, no watermark.')],
  ] as const;
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="h-16 flex items-center gap-2 px-4 sm:px-8 max-w-6xl w-full mx-auto">
        <Logo size={28} />
        <div className="flex-1" />
        <button className="icon-btn" onClick={() => prefs.set({ lang: prefs.lang === 'en' ? 'vi' : 'en' })} aria-label="Language"><span className="text-xs font-semibold uppercase">{prefs.lang}</span></button>
        <button className="icon-btn" onClick={() => prefs.set({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })} aria-label="Theme">
          {prefs.theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}</button>
        <a className="icon-btn" href="https://github.com/bthanhtung/snap-frame" aria-label="GitHub"><Github className="size-4" /></a>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <section className="relative text-center pt-10 sm:pt-16">
          <div aria-hidden className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-24 size-[560px] rounded-full bg-accent/15 blur-[120px]" />
          <h1 className="relative text-4xl sm:text-6xl font-semibold tracking-[-0.035em] leading-[1.05] animate-up">
            {t('l.h1a', 'Film looks & frames')}<br />
            <span className="font-serif italic font-normal bg-gradient-to-r from-[#ffb547] to-[#ff6a2b] bg-clip-text text-transparent">{t('l.h1b', 'for every photo you love.')}</span>
          </h1>
          <p className="relative mt-5 max-w-xl mx-auto text-muted sm:text-lg animate-up [animation-delay:80ms] [animation-fill-mode:both]">
            {t('l.sub', 'Give your shots the colour of Kodak & Fujifilm, add an elegant frame with camera details, and export in full resolution — right in your browser.')}
          </p>
        </section>

        <button onClick={onPick} disabled={importing}
          className="relative mt-10 w-full max-w-3xl mx-auto block rounded-3xl border-2 border-dashed border-line hover:border-accent bg-panel/60 hover:bg-accent-soft/40 transition group animate-up [animation-delay:160ms] [animation-fill-mode:both]">
          <div className="py-14 sm:py-20 px-6 flex flex-col items-center">
            <div className="size-16 rounded-2xl bg-accent text-black grid place-items-center shadow-[0_12px_40px_-12px_var(--accent)] group-hover:scale-105 transition">
              {importing ? <Loader2 className="size-7 animate-spin" /> : <ImagePlus className="size-7" />}
            </div>
            <p className="mt-5 text-lg font-semibold">{t('l.drop', 'Drop photos here, or click to choose')}</p>
            <p className="mt-1 text-sm text-muted">{t('l.formats', 'JPEG · PNG · WebP · HEIC — paste works too (⌘V)')}</p>
          </div>
        </button>
        <div className="mt-4 text-center">
          <button onClick={sample} className="text-sm text-muted hover:text-accent underline-offset-4 hover:underline">{t('l.sample', 'No photo at hand? Try two sample shots →')}</button>
        </div>

        <section className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map(([icon, title, body], i) => (
            <div key={i} className="rounded-2xl border border-line bg-panel/60 p-5">
              <div className="size-9 rounded-xl bg-accent-soft text-accent grid place-items-center [&>svg]:size-[18px]">{icon}</div>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-faint flex items-center justify-center gap-2">
        <Share2 className="size-3.5" />{t('l.foot', 'Free & open source · MIT')}
      </footer>
    </div>
  );
}
