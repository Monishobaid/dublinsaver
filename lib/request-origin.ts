/** Next may use an internal URL behind a proxy; Host is the requested public host. */
export function allowedOrigin(request: Request): boolean {
 const origin=request.headers.get('origin');
 if(!origin)return true;
 try {
  const parsed=new URL(origin);
  const url=new URL(request.url);
  const host=request.headers.get('host')||url.host;
  return ['http:','https:'].includes(parsed.protocol)&&parsed.host===host;
 } catch { return false; }
}
