# Freelance Hub

SaaS de gestión de proyectos, horas trabajadas y facturación para freelancers y estudios creativos. Construido como proyecto full-stack completo — desde el modelo de datos hasta el cobro de suscripciones con Stripe.

**Demo en vivo:** 

*Register*:

<img width="505" height="666" alt="Screenshot_8-9-2026_105839_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/93c3068d-f90a-48cc-9858-50d326a072b8" />

---

*Login*:

<img width="440" height="647" alt="Screenshot_8-9-2026_105812_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/4db9899a-c0c5-42d7-9a48-a5d62397063f" />

---

*Main Page*:

<img width="1195" height="734" alt="Screenshot_8-9-2026_10406_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/d94771bf-00b5-4f01-ad60-032232b58c50" />

---

*Dashboard*:

<img width="1553" height="647" alt="Screenshot_8-9-2026_10459_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/a65c3e2c-132e-4497-bd3a-496b202794e4" />

---

*Clients*:

<img width="633" height="531" alt="Screenshot_8-9-2026_104720_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/367f3ec2-8c78-4cb6-9e8e-00203eabb0de" />
<img width="497" height="435" alt="Screenshot_8-9-2026_104834_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/a994819f-60f1-4188-94bf-f3d57911d60c" />
<img width="1583" height="711" alt="Screenshot_8-9-2026_104614_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/ccf2995d-c1ae-4aff-ad25-d660c5508a04" />

---

*Projects*:

<img width="1300" height="279" alt="Screenshot_8-9-2026_104851_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/e901421e-e96a-46e8-b722-5070c981a452" />

---

*Hours*:

<img width="1298" height="512" alt="Screenshot_8-9-2026_105612_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/b3ab0b28-033f-4c97-a78c-e71a241ededf" />
<img width="1285" height="725" alt="Screenshot_8-9-2026_105556_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/7fb8e68d-c7ee-4aaa-9af2-11eda65cf603" />

---

*Invoices*:

<img width="1304" height="299" alt="Screenshot_8-9-2026_105715_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/8bf5e0ad-a84a-41cb-a70f-e6d472277872" />
<img width="1298" height="512" alt="Screenshot_8-9-2026_105612_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/f4c3fff4-dd1c-41f4-8d78-539508486bb0" />

---

*Plan and Payments*:

<img width="1580" height="706" alt="Screenshot_8-9-2026_105754_freelance-hub-ruby vercel app" src="https://github.com/user-attachments/assets/12398102-145c-45ef-9a0c-ca3af894f2e2" />


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
