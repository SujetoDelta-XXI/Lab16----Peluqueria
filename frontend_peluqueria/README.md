# Frontend - Sistema de Reserva de Peluquería

Frontend del sistema de gestión de citas para peluquería construido con Next.js 16, React 19 y Tailwind CSS.

## 🚀 Estado del Proyecto

✅ Autenticación (Login/Registro) implementada  
✅ Contexto de autenticación global  
✅ Rutas protegidas por rol  
✅ Dashboard de cliente implementado  
⏳ Flujo de reserva de citas - Pendiente  
⏳ Panel de peluquero - Pendiente  
⏳ Panel de administrador - Pendiente  

## 🛠️ Tecnologías

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Axios (HTTP client)
- React Hook Form (formularios)

## 📋 Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.local.example` a `.env.local`:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con la URL de tu backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id
```

### 3. Asegúrate de que el backend esté corriendo

El frontend necesita que el backend esté corriendo en `http://localhost:5000` (o la URL que hayas configurado).

```bash
# En el directorio backend_peluqueria
cd ../backend_peluqueria
npm run dev
```

## 🚀 Comandos

```bash
# Desarrollo (con hot reload)
npm run dev

# Compilar para producción
npm run build

# Iniciar en producción
npm start

# Linter
npm run lint
```

El servidor de desarrollo estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
app/
├── login/              # Página de inicio de sesión
├── registro/           # Página de registro
├── registro-exitoso/   # Confirmación de registro
├── cliente/            # Panel de cliente
│   ├── dashboard/      # Dashboard principal
│   ├── reservar/       # Flujo de reserva (pendiente)
│   ├── citas/          # Lista de citas (pendiente)
│   └── perfil/         # Perfil del cliente (pendiente)
├── peluquero/          # Panel de peluquero (pendiente)
└── admin/              # Panel de administrador (pendiente)

components/
└── ProtectedRoute.tsx  # Componente para rutas protegidas

contexts/
└── AuthContext.tsx     # Contexto de autenticación

lib/
└── api.ts              # Cliente API y endpoints
```

## 🔐 Autenticación

### Flujo de Autenticación

1. **Registro**:
   - Los clientes se activan inmediatamente
   - Los peluqueros quedan pendientes de aprobación del admin
   - Soporta registro con Google OAuth

2. **Login**:
   - Email/contraseña o Google OAuth
   - JWT almacenado en localStorage
   - Redirección automática según rol:
     - Cliente → `/cliente/dashboard`
     - Peluquero → `/peluquero/agenda`
     - Admin → `/admin/dashboard`

3. **Rutas Protegidas**:
   - Todas las rutas de paneles requieren autenticación
   - Validación de roles específicos
   - Redirección automática si no autorizado

## 🎨 Diseño

- **Framework CSS**: Tailwind CSS 4
- **Fuente**: Inter (Google Fonts)
- **Paleta de colores**:
  - Primario: Blue-600 (#2563eb)
  - Éxito: Green-600
  - Error: Red-600
  - Fondo: Gray-50

## 📱 Páginas Implementadas

### Autenticación

- **Login** (`/login`):
  - Formulario de email/contraseña
  - Botón de Google OAuth
  - Validación de campos
  - Manejo de errores

- **Registro** (`/registro`):
  - Selector de tipo de cuenta (cliente/peluquero)
  - Formulario con validación
  - Selección de servicios para peluqueros
  - Google OAuth
  - Confirmación visual

### Cliente

- **Dashboard** (`/cliente/dashboard`):
  - Resumen de próximas citas
  - Acciones rápidas
  - Navegación a otras secciones

## 🔌 Integración con Backend

El frontend se comunica con el backend a través de axios con las siguientes características:

- **Base URL**: Configurable via `NEXT_PUBLIC_API_URL`
- **Autenticación**: JWT en header `Authorization: Bearer <token>`
- **Cookies**: Soporte para httpOnly cookies
- **Interceptores**:
  - Agregar token automáticamente
  - Manejo de errores 401 (redirección a login)

### Endpoints Disponibles

Ver `lib/api.ts` para la lista completa de endpoints organizados por módulo:
- `authAPI` - Autenticación
- `clientAPI` - Operaciones de cliente
- `hairstylistAPI` - Operaciones de peluquero
- `adminAPI` - Operaciones de administrador

## 🧪 Testing

```bash
# Tests (cuando estén implementados)
npm test
```

## 📝 Próximos Pasos

1. ✅ Sistema de autenticación
2. ✅ Dashboard de cliente
3. ⏳ Flujo completo de reserva de citas
4. ⏳ Lista y gestión de citas del cliente
5. ⏳ Perfil del cliente
6. ⏳ Panel de peluquero (agenda)
7. ⏳ Panel de administrador (gestión completa)

## 🐛 Troubleshooting

### Error de conexión con el backend

Si ves errores de conexión, verifica:
1. El backend está corriendo en `http://localhost:5000`
2. La variable `NEXT_PUBLIC_API_URL` está configurada correctamente
3. CORS está habilitado en el backend

### Problemas con Google OAuth

1. Verifica que `GOOGLE_CLIENT_ID` esté configurado
2. Asegúrate de que la URL de callback esté registrada en Google Console
3. El backend debe tener las mismas credenciales de Google

### Token expirado

Si el token expira, el usuario será redirigido automáticamente a `/login`. Los tokens tienen una duración de 7 días por defecto.

## 📄 Licencia

MIT
