/// <reference types="vite/client" />
// <reference types="tailwindcss/tailwind-config" />
/// <reference types="tailwindcss" />
// <reference types="react-scripts" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="node" />
/// <reference types="vite" />
// <reference types="vite-plugin-svgr/client" />
interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
