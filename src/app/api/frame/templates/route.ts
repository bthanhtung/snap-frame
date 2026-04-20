import { NextResponse } from 'next/server';
import { STYLE_CONFIG, FrameStyle } from '@/lib/frame-logic/frame-renderer.util';

export async function GET() {
  const styles: Array<{ id: FrameStyle; name: string; description: string }> = [
    { id: 'white-minimal', name: 'White Minimal',  description: 'Nền trắng tối giản, chữ đen. Phong cách hiện đại, sạch sẽ.' },
    { id: 'black-film',    name: 'Black Film',     description: 'Nền đen, chữ trắng, centered uppercase. Phong cách điện ảnh.' },
    { id: 'light-leica',   name: 'Light Leica',    description: 'Nền kem, font serif, chấm đỏ Leica. Sang trọng cổ điển.' },
    { id: 'film-strip',    name: 'Film Strip',     description: 'Nền đen với lỗ cuộn film, monospace. Phong cách analog.' },
    { id: 'polaroid',      name: 'Polaroid',       description: 'Viền trắng dày dưới, font serif nghiêng. Vintage tức thì.' },
    { id: 'instax',        name: 'Instax Mini',    description: 'Viền trắng kem, accent cam. Dễ thương, tươi trẻ.' },
    { id: 'kodachrome',    name: 'Kodachrome',     description: 'Nền kem vàng ấm, text nâu vàng. Vintage Kodak 35mm.' },
    { id: 'darkroom',      name: 'Darkroom',       description: 'Nền đen sâu, accent đỏ thẫm. Cinemagraph darkroom.' },
    { id: 'fujifilm',      name: 'Fujifilm Green', description: 'Nền trắng tinh, accent xanh Fuji. Minimalist Nhật Bản.' },
  ];

  const templates = styles.map(s => ({
    ...s,
    backgroundColor: STYLE_CONFIG[s.id].bg,
    textColor:       STYLE_CONFIG[s.id].text,
    accentColor:     STYLE_CONFIG[s.id].accent ?? STYLE_CONFIG[s.id].accentText,
    fontStyle:       STYLE_CONFIG[s.id].font.includes('serif') ? 'serif'
                   : STYLE_CONFIG[s.id].font.includes('mono')  ? 'monospace' : 'sans-serif',
    preview: null,
  }));

  return NextResponse.json(templates);
}
