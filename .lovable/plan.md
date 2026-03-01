

# Análisis completo y mejoras propuestas para los paneles

## Problemas detectados

### 1. Inconsistencia en memoria vs código: `upline` eliminado pero sigue construyéndose
El hook `useAddFirebaseLead` (líneas 151-178) todavía construye y guarda el array `upline` al crear leads manuales, pero la consulta en `useFirebaseLeads` ya no lo usa. Esto es código muerto que hace llamadas innecesarias a Firestore (`getDoc` en bucle hasta 5 niveles).

### 2. Firestore rules permiten lectura por `upline` pero ya no se usa
La regla en `firestore.rules` línea 75-77 permite lectura si `request.auth.uid in resource.data.upline`, pero el frontend ya no consulta por `upline`. Esto contradice el requisito de aislamiento total.

### 3. AdminLeads no filtra por `refCode` del agente para Line Leaders
En `AdminLeads.tsx` línea 67-68, los Line Leaders solo ven leads con `assignedLineLeaderId == agentId`, pero si un sub-agente genera leads via refCode, el `assignedLineLeaderId` podría no estar seteado (depende del flujo de `save-chat-lead`).

### 4. Dashboard admin hace dos queries pesadas sin caché
`AdminDashboard.tsx` descarga TODOS los leads y TODOS los usuarios en cada render sin paginación ni `staleTime`, causando lecturas excesivas a Firestore.

### 5. Lista de países inconsistente entre componentes
`AdminAgentesNew` solo tiene Paraguay/Argentina/Colombia. `AppLeads` tiene 7 países. `AdminLeads` tiene 9 países. `AdminSettingsNew` tiene 9. Debería usarse una lista centralizada.

### 6. Sidebar admin accesible a roles no-admin
`AdminLayout.tsx` línea 36 permite acceso a AGENT y LINE_LEADER al panel admin completo, incluyendo Settings, Chat Config y Content. Estos deberían estar restringidos por rol.

### 7. Sin auto-refresh en el dashboard del agente
`useFirebaseLeads` usa `useQuery` sin `refetchInterval`, así que los leads nuevos no aparecen hasta que el agente refresca manualmente.

### 8. SubagentCreatedModal no incluye link de login
Similar al bug corregido en `AgentCreatedModal`, el modal de subagentes creados podría no incluir el link de login en el mensaje de WhatsApp.

---

## Plan de mejoras

### Paso 1: Limpiar código muerto de `upline`
- Eliminar la construcción del array `upline` en `useAddFirebaseLead` (ahorra hasta 5 `getDoc` por lead manual)
- Eliminar la regla de Firestore que permite lectura por `upline` (refuerza aislamiento)
- Mantener las reglas de `assignedAgentId`, `assignedLineLeaderId` y `refCode`

### Paso 2: Centralizar lista de países
- Crear constante `COUNTRIES` en `src/lib/countries.ts` (ya existe el archivo)
- Importar desde todos los componentes que usan listas de países

### Paso 3: Restringir sidebar admin por rol
- Filtrar `navItems` en `AdminLayout` según el rol del usuario
- Agentes y Line Leaders solo ven Dashboard, Leads y Agentes
- Solo ADMIN ve Settings, Chat Config, Content, Diagnósticos

### Paso 4: Agregar auto-refresh al dashboard del agente
- Añadir `refetchInterval: 30000` (30s) en `useFirebaseLeads` para el portal de agentes
- Añadir `staleTime: 60000` en `AdminDashboard` para evitar queries duplicadas

### Paso 5: Verificar SubagentCreatedModal incluya link de login
- Revisar y agregar el link de login al mensaje de WhatsApp del modal de subagentes

### Paso 6: Corregir flujo de Line Leader en AdminLeads
- Agregar query adicional por `refCode` de subagentes del Line Leader para capturar leads que llegaron via referral pero sin `assignedLineLeaderId`

---

## Detalle técnico

```text
Archivos a modificar:
├── src/hooks/useFirebaseLeads.ts      → eliminar upline build, añadir refetchInterval
├── src/lib/countries.ts               → centralizar lista de países
├── src/pages/admin/AdminLayout.tsx     → filtrar nav por rol
├── src/pages/admin/AdminDashboard.tsx  → añadir staleTime
├── src/pages/admin/AdminAgentesNew.tsx → usar countries centralizados
├── src/pages/app/AppLeads.tsx          → usar countries centralizados
├── src/pages/app/AppSubagents.tsx      → usar countries centralizados
├── src/components/app/SubagentCreatedModal.tsx → verificar link login
├── firestore.rules                     → eliminar regla upline
```

