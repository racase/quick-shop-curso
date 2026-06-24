# Frontend - QuickShop

Aplicacion React 18 con Vite, Tailwind CSS y React Router. Gestion de paquetes con pnpm 11.

AVISO CRITICO (pnpm 11): Las aprobaciones de build scripts se guardan en pnpm-workspace.yaml bajo la clave allowBuilds, no en el lockfile. El Dockerfile debe copiar pnpm-workspace.yaml antes de ejecutar pnpm install o fallara con ERR_PNPM_IGNORED_BUILDS.

Para convenciones de componentes, configuracion de Tailwind, estructura de rutas, manejo de autenticacion y guia completa de pnpm consulta @AGENTS.md.

Para el sistema de diseño visual (colores, tipografia, botones, tarjetas, espaciado, breakpoints y los dos tracks de canvas) consulta **@DESIGN.md**. Este fichero es la fuente de verdad para toda decision de UI/UX. Cualquier componente nuevo o modificado debe respetar las reglas definidas ahi.

## Regla de Idioma del Agente
- **El agente debe comunicarse e interactuar siempre en castellano (español).**

