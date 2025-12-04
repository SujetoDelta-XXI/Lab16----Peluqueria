# Backend - Sistema de Reserva de Peluquería

Backend API para el sistema de gestión de citas de peluquería.

## 🚀 Estado del Proyecto

✅ Configuración inicial completada  
✅ Modelos de base de datos implementados  
✅ Autenticación (JWT + Google OAuth) implementada  
✅ Endpoints de Cliente implementados  
✅ Endpoints de Peluquero implementados  
✅ Endpoints de Administrador implementados  
⏳ Frontend - Pendiente  

## 🛠️ Tecnologías

- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Google OAuth 2.0
- Passport.js
- bcrypt (password hashing)
- express-validator

## 📋 Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/peluqueria

# JWT
JWT_SECRET=tu-clave-secreta-muy-segura
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### 3. Inicializar base de datos

```bash
# Ejecutar seed para crear datos iniciales
npm run seed
```

Esto creará:
- Usuario administrador (admin@peluqueria.com / Admin123!)
- Configuración del negocio
- 6 servicios de ejemplo

Ver `CREDENTIALS.md` para las credenciales de prueba.

## 🚀 Comandos

```bash
# Desarrollo (con hot reload)
npm run dev

# Compilar TypeScript
npm run build

# Producción
npm start

# Ejecutar seed
npm run seed

# Tests (cuando estén implementados)
npm test
```

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuración (DB, env, passport)
├── models/           # Modelos de Mongoose
│   ├── Usuario.ts
│   ├── Cliente.ts
│   ├── Peluquero.ts
│   ├── Servicio.ts
│   ├── Cita.ts
│   ├── Ausencia.ts
│   └── Negocio.ts
├── routes/           # Rutas de Express
│   ├── authRoutes.ts
│   ├── clientRoutes.ts
│   ├── hairstylistRoutes.ts
│   └── adminRoutes.ts
├── controllers/      # Controladores
│   ├── authController.ts
│   ├── clientController.ts
│   ├── hairstylistController.ts
│   └── adminController.ts
├── services/         # Lógica de negocio
│   └── availabilityService.ts
├── middleware/       # Middleware personalizado
│   ├── auth.ts
│   └── validate.ts
├── validators/       # Validación de entrada
│   ├── authValidators.ts
│   └── clientValidators.ts
├── utils/            # Utilidades
│   └── jwt.ts
├── types/            # Tipos de TypeScript
├── scripts/          # Scripts de base de datos
│   └── seed.ts
├── app.ts            # Configuración de Express
└── server.ts         # Punto de entrada
```

## 🔐 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registro de usuario (cliente o peluquero) | No |
| POST | `/login` | Login con email/password | No |
| POST | `/logout` | Cerrar sesión | Sí |
| GET | `/me` | Obtener usuario actual | Sí |
| GET | `/google` | Iniciar OAuth con Google | No |
| GET | `/google/callback` | Callback de Google OAuth | No |

### Cliente (`/api/client`)

**Servicios y Peluqueros**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/services` | Listar servicios activos |
| GET | `/hairstylists?serviceId=<id>` | Listar peluqueros por servicio |
| GET | `/availability?hairstylistId=<id>&date=<date>&serviceId=<id>` | Ver slots disponibles |

**Citas**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/appointments` | Crear nueva cita |
| GET | `/appointments?filter=<upcoming\|history>` | Listar mis citas |
| GET | `/appointments/:id` | Ver detalle de cita |
| PATCH | `/appointments/:id/cancel` | Cancelar cita (regla 24h) |

**Perfil**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| PATCH | `/profile` | Actualizar perfil |
| PATCH | `/change-password` | Cambiar contraseña |

### Peluquero (`/api/hairstylist`)

**Agenda**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/agenda?date=<date>&view=<day\|week>` | Ver agenda |
| GET | `/appointments/:id` | Ver detalle con historial del cliente |
| PATCH | `/appointments/:id/complete` | Marcar como completada |
| PATCH | `/appointments/:id/no-show` | Marcar como no asistió |

**Perfil**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/profile` | Ver perfil |
| PATCH | `/change-password` | Cambiar contraseña |

### Administrador (`/api/admin`)

**Servicios**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/services` | Listar todos los servicios |
| POST | `/services` | Crear servicio |
| GET | `/services/:id` | Ver servicio |
| PATCH | `/services/:id` | Actualizar servicio |
| DELETE | `/services/:id` | Eliminar servicio |
| PATCH | `/services/:id/toggle-state` | Activar/desactivar |

**Peluqueros**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/hairstylists?estado=<pendiente\|activo\|inactivo>` | Listar peluqueros |
| POST | `/hairstylists` | Crear peluquero |
| GET | `/hairstylists/:id` | Ver peluquero |
| PATCH | `/hairstylists/:id` | Actualizar peluquero |
| PATCH | `/hairstylists/:id/approve` | Aprobar peluquero pendiente |
| PATCH | `/hairstylists/:id/deactivate` | Desactivar peluquero |
| PATCH | `/hairstylists/:id/reactivate` | Reactivar peluquero |
| DELETE | `/hairstylists/:id` | Eliminar peluquero |

**Ausencias**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/ausencias?peluqueroId=<id>` | Listar ausencias |
| POST | `/ausencias` | Crear ausencia |
| GET | `/ausencias/:id` | Ver ausencia |
| PATCH | `/ausencias/:id` | Actualizar ausencia |
| DELETE | `/ausencias/:id` | Eliminar ausencia |

**Citas**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/appointments?estado=<>&peluqueroId=<>&clienteId=<>&fechaDesde=<>&fechaHasta=<>` | Listar con filtros |
| GET | `/appointments/:id` | Ver cita |
| DELETE | `/appointments/:id` | Eliminar cita |

**Clientes**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/clients?search=<query>` | Listar/buscar clientes |
| GET | `/clients/:id` | Ver cliente |
| PATCH | `/clients/:id` | Actualizar cliente |
| PATCH | `/clients/:id/toggle-state` | Activar/desactivar |

**Configuración**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/configuration` | Ver configuración del negocio |
| PATCH | `/configuration` | Actualizar configuración |

## 🔒 Autenticación y Autorización

Todos los endpoints (excepto `/api/auth/register`, `/api/auth/login`, y `/api/auth/google*`) requieren autenticación.

**JWT Token**: Se envía en el header `Authorization: Bearer <token>` o en la cookie `token`.

**Roles**:
- `cliente` - Puede reservar citas, ver sus citas, gestionar perfil
- `peluquero` - Puede ver agenda, gestionar citas, ver perfil (requiere aprobación del admin)
- `admin` - Acceso completo a todos los endpoints de gestión

## 📊 Modelos de Base de Datos

### Usuario
- Información básica (nombre, email, teléfono, contraseña)
- Rol (cliente, peluquero, admin)
- Estado activo/inactivo

### Cliente
- Referencia a Usuario
- Preferencias (peluquero favorito, servicios frecuentes)
- Notas internas

### Peluquero
- Referencia a Usuario
- Servicios especializados
- Horario disponible
- Estado (pendiente, activo, inactivo)

### Servicio
- Nombre, descripción, precio
- Duración en minutos
- Categoría
- Estado (activo/inactivo)

### Cita
- Referencias a Cliente, Peluquero, Servicio
- Fecha/hora inicio y fin
- Estado (Confirmada, Pendiente, Cancelada, Completada, NoAsistio)
- Precio total
- Notas del cliente
- Información de cancelación

### Ausencia
- Referencia a Peluquero
- Fecha inicio y fin
- Motivo

### Negocio (Singleton)
- Información del negocio
- Horario de operación por día
- Tiempo de buffer entre citas

## 🧪 Lógica de Negocio

### Registro de Usuarios
- **Clientes**: Se activan inmediatamente
- **Peluqueros**: Quedan en estado "pendiente" hasta aprobación del admin

### Reserva de Citas
- Solo se pueden reservar slots disponibles
- Se valida que el peluquero esté especializado en el servicio
- Se calcula automáticamente la hora de fin (duración + buffer)
- Estado inicial: "Confirmada"

### Cancelación de Citas
- Los clientes pueden cancelar con al menos 24 horas de anticipación
- El admin puede eliminar cualquier cita

### Disponibilidad
- Se consideran: horario del negocio, horario del peluquero, citas existentes, ausencias
- Slots de 15 minutos
- Se bloquea el día completo si hay ausencia

## 📝 Próximos Pasos

1. ✅ Backend API completado
2. ⏳ Implementar frontend con Next.js
3. ⏳ Implementar tests unitarios y de integración
4. ⏳ Desplegar en producción

## 📄 Documentación Adicional

- Ver `CREDENTIALS.md` para credenciales de prueba
- Ver `.kiro/specs/sistema-reserva-peluqueria/` para especificaciones completas

## 📄 Licencia

MIT
