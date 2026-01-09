# CortinasExpress Configurator

React TypeScript Tailwind CSS Supabase Status

CortinasExpress Configurator es una plataforma de orquestacion de servicios de campo de alta fidelidad (Field Service Orchestrator). Esta disenada para cerrar la brecha entre la planificacion centralizada y la ejecucion operativa, con una interfaz dual que permite la gestion de ordenes de trabajo complejas y su ejecucion secuencial en campo mediante dispositivos moviles.

El sistema destaca por su validacion contextual, guiando al operario paso a paso a traves de procedimientos tecnicos (mediciones, seleccion de tejidos y normativas) mientras mantiene una conexion simulada con sistemas de ingenieria para asegurar la viabilidad tecnica.

## Caracteristicas principales
- Interfaz dual de alta fidelidad, responsiva y optimizada para operarios en movilidad.
- Validacion contextual con feedback inmediato sobre viabilidad de fabricacion.
- Gestion de ordenes complejas con flujo guiado de medidas y materiales.
- Proteccion de margen con ocultacion de precios en pedidos de alto volumen.
- Reporte automatico con generacion de informes tecnicos en HTML.

## Stack tecnologico
Componente | Tecnologia | Proposito
--- | --- | ---
Core | React 18/19 + TypeScript | Logica de negocio robusta, tipada y escalable.
Estilos | Tailwind CSS | Diseno mobile-first rapido y responsivo.
Backend/Data | Supabase | Persistencia de metricas, clientes y estados de ordenes.
UI/UX | Lucide React | Iconografia tecnica para feedback visual inmediato.

## Reglas de negocio (Orchestrator)
- Restricciones de ingenieria: limite de fabricacion 270 cm de altura; valores superiores activan validacion manual forzosa.
- Umbral de ejecucion directa: minimo 10 unidades; cantidades menores bloquean "Compra Directa".
- Proteccion de margen y volumen: disparadores >100 unidades o >2.500 EUR; oculta precios y deriva a revision comercial.

## Instalacion
```bash
npm install
npm run dev
```

## Variables de entorno
Crear `.env.local` en la raiz:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_PUBLIC_URL=https://tudominio.com/admin   # opcional
```

## Base de datos (Supabase)
1) Ejecuta el SQL maestro:
   - `supabase/master.sql`
2) Actualiza el schema cache en Supabase.

Esto crea tablas, indices, triggers y politicas RLS.

## Acceso Admin
- Ruta: `/admin`
- Login con Supabase Auth (email + password)
- El boton "Copiar enlace" usa `VITE_ADMIN_PUBLIC_URL` si esta definido.

## Seguridad (resumen)
- RLS activado:
  - Publico: solo `INSERT` en `orders`.
  - Admin autenticado: `SELECT/UPDATE/DELETE` en `orders` y `email_logs`.
  - `materials`: lectura publica.
- Rate limit basico en el envio (30s).

## Exportacion de datos
En Admin > Pedidos:
- Exportar CSV
- Exportar JSON

## Estructura del proyecto
```
components/           # Orquestadores de la interfaz dual
  Step1.tsx           # Datos profesionales (CIF/NIF/Razon Social)
  Step2.tsx           # Selector de materiales y confeccion tecnica
  Step3.tsx           # Modulo de mediciones y calculo de area
  Step4.tsx           # Resumen, avisos legales y envio
services/             # Conectividad externa
  supabase.ts         # Cliente de orquestacion de datos
constants.ts          # Parametros tecnicos y umbrales
types.ts              # Definiciones TypeScript (arquitectura de datos)
admin/                # Backoffice
supabase/             # SQL
image/                # Assets usados
BULK/                 # Archivos no esenciales
```

## Notas
- Tailwind via CDN muestra aviso en consola; se suprime en dev.
- Para produccion, instalar Tailwind como PostCSS o CLI.
