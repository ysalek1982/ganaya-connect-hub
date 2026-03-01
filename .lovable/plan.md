

# Mejoras para Admin y Dashboard de Agentes

## Problemas detectados

### 1. AdminLeads: Line Leaders no ven leads por refCode de sus subagentes
`AdminLeads.tsx` (línea 69) solo consulta `assignedLineLeaderId == agentId` con `onSnapshot`. Si un subagente genera leads vía su refCode y `assignedLineLeaderId` no fue seteado (depende del flujo de `save-chat-lead`), esos leads son invisibles para el Line Leader en el panel admin.

### 2. AdminLeads usa `onSnapshot` pero AppLeads usa `useQuery` — inconsistencia
AdminLeads (línea 78) suscribe en tiempo real con `onSnapshot`, mientras AppLeads usa `useFirebaseLeads` con `useQuery` + `refetchInterval`. Esto causa comportamiento dispar y duplicación de lógica de fetching.

### 3. AdminDashboard descarga TODOS los leads sin límite real
Línea 50: `getDocs(leadsRef)` sin `limit()`. Si hay 2000+ leads, consume lecturas innecesarias. El `limit(500)` solo se aplica en `useFirebaseLeads`, no aquí.

### 4. AdminDashboard no tiene refetchInterval
Tiene `staleTime: 60000` pero sin `refetchInterval`, así que los datos no se actualizan automáticamente sin navegación.

### 5. AppDashboard no muestra gráfico semanal
El admin tiene un gráfico de barras con tendencia de 7 días, pero el portal del agente solo muestra números. Los agentes se beneficiarían de ver su tendencia visual.

### 6. STATUS_COLORS duplicado en 3 archivos
`AdminDashboard.tsx`, `AppDashboard.tsx` y `AppLeads.tsx` cada uno define su propio mapa de colores por estado.

### 7. AdminLeads: Line Leader no puede ver leads de refCode de subagentes
Regla de Firestore línea 82 (`assignedLineLeaderId == request.auth.uid`) es correcta, pero el frontend no consulta leads de los refCodes de los subagentes del Line Leader.

### 8. No hay indicador de "última actualización" en dashboards
Los agentes no saben cuándo se actualizaron los datos por última vez.

---

## Plan de implementación

### Paso 1: Extraer constantes compartidas a un archivo común
- Crear `src/lib/lead-constants.ts` con `STATUS_COLORS`, `STATUS_OPTIONS`, `timeAgo()`
- Importar en `AdminDashboard`, `AppDashboard`, `AppLeads`

### Paso 2: Agregar gráfico semanal al AppDashboard del agente
- Añadir mini bar chart de Recharts con tendencia de 7 días (mismo estilo que admin)
- Reutilizar lógica de `eachDayOfInterval` + `startOfDay`

### Paso 3: Optimizar AdminDashboard con limit y refetchInterval
- Agregar `limit(2000)` al query de leads en AdminDashboard para evitar lecturas ilimitadas
- Agregar `refetchInterval: 60000` para auto-refresh cada 60s
- Agregar badge "última actualización" con timestamp

### Paso 4: Unificar AdminLeads para que Line Leaders vean leads de subagentes
- En `AdminLeads.tsx`, para Line Leaders, agregar una segunda suscripción `onSnapshot` que consulte leads cuyos `assignedAgentId` sea uno de sus subagentes directos
- Combinar ambos snapshots con deduplicación por `id`

### Paso 5: Agregar indicador "última actualización" en ambos dashboards
- Mostrar "Actualizado hace Xm" debajo del título
- Basado en `dataUpdatedAt` de React Query

### Paso 6: Agregar refetchInterval a AdminDashboard
- `refetchInterval: 60000` (cada 60s)

---

## Archivos a modificar

```text
├── src/lib/lead-constants.ts          → NUEVO: constantes compartidas
├── src/pages/admin/AdminDashboard.tsx  → limit, refetchInterval, indicador de actualización
├── src/pages/app/AppDashboard.tsx      → gráfico semanal, indicador de actualización
├── src/pages/admin/AdminLeads.tsx      → Line Leader: query expandido para subagentes
├── src/pages/app/AppLeads.tsx          → importar constantes compartidas
```

