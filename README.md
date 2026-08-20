# Freelance Hub

SaaS de gestión de proyectos, horas trabajadas y facturación para freelancers y estudios creativos. Construido como proyecto full-stack completo — desde el modelo de datos hasta el cobro de suscripciones con Stripe.

**Demo en vivo:** _(próximamente)_
**Video/capturas:** _(próximamente)_

---

## Stack técnico

**Backend:** NestJS · TypeScript · PostgreSQL · Prisma ORM · JWT · Stripe · Resend
**Frontend:** Next.js 15 (App Router) · TypeScript · TanStack Query · Tailwind CSS v4 · React Hook Form + Zod

---

## Qué hace la aplicación

- Registro con creación automática de workspace (multi-tenant desde el modelo de datos)
- Gestión de clientes y proyectos, con dos modelos de facturación (por hora / precio fijo)
- Timer de horas trabajadas en vivo, con cálculo de duración automático
- Generación de facturas directamente desde las horas registradas, con numeración secuencial
- Suscripciones pagas vía Stripe Checkout, con límites de uso por plan (freemium real, no solo cosmético)
- Recuperación de contraseña y verificación de email, ambos con notificaciones transaccionales

## Decisiones de arquitectura que vale la pena destacar

- **Multi-tenancy a nivel de fila**: cada tabla de negocio cuelga de un `workspaceId`, y cada query del backend lo filtra explícitamente — nunca se confía en que "el usuario correcto" pidió el dato correcto.
- **Refresh tokens con rotación + período de gracia**: cada uso de un refresh token lo invalida y emite uno nuevo (limita el daño de un token robado), pero con una ventana corta de tolerancia para absorber condiciones de carrera legítimas (varias pestañas/requests refrescando al mismo tiempo) sin cerrar sesiones de usuarios reales por error.
- **Patrón BFF (Backend for Frontend)**: el JWT nunca toca el navegador. Vive en una cookie `httpOnly`, y el servidor de Next.js actúa de proxy autenticado hacia la API — mitiga robo de tokens vía XSS.
- **Webhooks de Stripe como fuente de verdad**: el estado del plan de un workspace se actualiza exclusivamente por webhook, nunca por la redirección del navegador tras el pago — así el sistema es correcto incluso si el usuario cierra la pestaña antes de volver a la app.
- **Feature-gating real por plan**: un guard de NestJS (`PlanLimitGuard`) bloquea la creación de recursos cuando el workspace supera el límite de su plan — la monetización está aplicada en el backend, no solo sugerida en el frontend.

## Testing

Tests unitarios sobre la lógica de negocio más sensible:

- `AuthService`: rotación de refresh tokens, período de gracia, detección de reuso de tokens revocados
- `InvoicesService`: cálculo de montos (por hora y precio fijo), numeración secuencial de facturas

```bash
cd backend
npm test
```

## Correrlo localmente

### Backend

```bash
cd backend
npm install
cp .env.example .env   # completar variables (ver abajo)
docker compose up -d   # levanta PostgreSQL
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Variables de entorno necesarias

- PostgreSQL (vía Docker, incluido)
- Cuenta de [Stripe](https://stripe.com) en modo test (checkout + webhooks)
- Cuenta de [Resend](https://resend.com) (emails transaccionales)

## Estructura del proyecto
