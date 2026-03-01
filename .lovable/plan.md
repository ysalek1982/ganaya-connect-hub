

## Plan: Links de referido dinámicos según el dominio actual

### Problema
El sistema tiene `https://ganaya.bet` hardcodeado como fallback en múltiples archivos. Además, el dominio publicado `ganaya-connect-hub.lovable.app` está en la lista de exclusión, por lo que nunca se usa como base para links.

### Cambios

**1. `src/lib/siteUrl.ts` — Corregir lógica de detección**
- Quitar `.lovable.app` de la lista de exclusión (es el dominio publicado válido)
- Solo excluir `.lovableproject.com` (preview) y `localhost`
- Eliminar el fallback hardcodeado a `ganaya.bet`; si estamos en producción, usar `window.location.origin` siempre

**2. `supabase/functions/create-agent-user/index.ts` — Recibir origen desde frontend**
- Aceptar un campo `siteUrl` en el body del request para que el frontend pase su propio origen
- Usar ese valor para construir `referralUrl` en vez del fallback hardcodeado

**3. `supabase/functions/ensure-profile/index.ts` — Mismo ajuste**
- Aceptar `siteUrl` desde el request o usar el header `Origin`/`Referer`
- Eliminar fallback hardcodeado

**4. Archivos que invocan las edge functions**
- Pasar `siteUrl: getPublicSiteUrl()` en el body cuando se llama a `create-agent-user` y `ensure-profile`

### Resultado
- Si publican en `ganaya.bet` → links usan `ganaya.bet`
- Si publican en `ganaya-connect-hub.lovable.app` → links usan ese dominio
- Si cambian a otro dominio custom → se adapta automáticamente
- En preview/localhost → usa el `VITE_PUBLIC_SITE_URL` del `.env` si existe, sino usa el dominio publicado de Lovable como último recurso

