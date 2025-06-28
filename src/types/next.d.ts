// types/next.d.ts
import 'next';

declare module 'next/server' {
  interface NextApiContext {
    params: Record<string, string | string[]>;
  }
  
  type RouteContext = {
    params: Record<string, string | string[]>;
  };
}