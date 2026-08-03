/// <reference types="vite/client" />
/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      key?: any;
    }
  }
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
  export const jsxDEV: any;
}

declare module 'react/jsx-dev-runtime' {
  export const jsxDEV: any;
  export const Fragment: any;
}
