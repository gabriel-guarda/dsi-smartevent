// types/next/index.d.ts
import 'next';

declare module 'next/server' {
  export interface RouteHandlerContext {
    params: Record<string, string>;
  }
}