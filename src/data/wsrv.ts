export interface WsrvOptions {
  w?: number;
  q?: number;
}

export function wsrv(rawUrl: string, { w, q = 82 }: WsrvOptions = {}): string {
  if (!rawUrl) return rawUrl;
  const params = new URLSearchParams({ url: rawUrl, q: String(q), output: 'webp' });
  if (w) params.set('w', String(w));
  return `https://wsrv.nl/?${params.toString()}`;
}

export function wsrvSrcSet(rawUrl: string, widths: number[], q = 82): string {
  if (!rawUrl) return '';
  return widths.map((width) => `${wsrv(rawUrl, { w: width, q })} ${width}w`).join(', ');
}
