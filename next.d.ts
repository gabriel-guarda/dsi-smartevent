import 'next';

declare module 'next' {
  export type RouteContext = {
    params: Record<string, string | string[]> | { codprod: string }
  };
}