# Modulo: Autenticacion

## Descripcion

Gestiona el registro de nuevos clientes, el inicio de sesion de todos los usuarios (clientes y administrador) y la invalidacion de sesion. La identidad se verifica mediante JWT con una duracion de 2 horas. Las contrasenas se almacenan hasheadas con bcrypt. El token no se persiste en localStorage en el frontend.

## Modelo de datos

El modulo comparte la tabla `users` con el modulo Usuarios.

### Tabla: users

| Columna           | Tipo                        | Restricciones                          |
|-------------------|-----------------------------|----------------------------------------|
| id                | UUID                        | PK, default gen_random_uuid()          |
| email             | VARCHAR(255)                | NOT NULL, UNIQUE                       |
| hashed_password   | VARCHAR(255)                | NOT NULL                               |
| full_name         | VARCHAR(255)                | NOT NULL                               |
| role              | ENUM('client', 'admin')     | NOT NULL, default 'client'             |
| is_active         | BOOLEAN                     | NOT NULL, default TRUE                 |
| created_at        | TIMESTAMP WITH TIME ZONE    | NOT NULL, default now()                |
| updated_at        | TIMESTAMP WITH TIME ZONE    | NOT NULL, default now()                |

## Endpoints

### POST /auth/register

Registra un nuevo usuario con rol cliente. El administrador no se puede registrar por este endpoint; se crea por seed.

**Request body**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "Contraseña1!",
  "full_name": "Nombre Apellido"
}
```

**Validaciones**
- `email`: formato RFC 5321 valido
- `password`: minimo 8 caracteres, al menos una mayuscula, una minuscula, un digito y un caracter especial
- `full_name`: entre 2 y 255 caracteres

**Response 201**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "full_name": "Nombre Apellido",
  "role": "client"
}
```

**Errores**

| Codigo | Motivo                              |
|--------|-------------------------------------|
| 400    | El email ya esta registrado         |
| 422    | Datos invalidos (formato, longitud) |

---

### POST /auth/login

Autentica al usuario y devuelve un access token JWT.

**Request body**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "Contraseña1!"
}
```

**Response 200**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errores**

| Codigo | Motivo                                       |
|--------|----------------------------------------------|
| 401    | Credenciales invalidas o usuario inactivo    |
| 422    | Datos invalidos                              |

---

### POST /auth/logout

Invalida la sesion del usuario autenticado. El servidor responde con 200 y el cliente descarta el token. No se implementa blacklist de tokens.

**Headers requeridos**: `Authorization: Bearer {access_token}`

**Response 200**

```json
{
  "message": "Sesion cerrada correctamente"
}
```

**Errores**

| Codigo | Motivo                          |
|--------|---------------------------------|
| 401    | Token ausente, invalido o expirado |

## Criterios de aceptacion

- Un usuario nuevo puede registrarse con email unico, contrasena valida y nombre completo.
- Intentar registrar un email ya existente devuelve 400.
- Un usuario registrado puede iniciar sesion y recibe un JWT con expiracion de 2 horas.
- Las credenciales incorrectas devuelven 401 sin revelar si el email existe o no.
- El token JWT no se almacena en localStorage en el frontend.
- Las contrasenas se almacenan como hash bcrypt en la base de datos; nunca en texto plano.
- Los endpoints protegidos rechazan peticiones sin token o con token expirado con 401.
- El campo `role` del JWT permite al frontend y al backend tomar decisiones de autorizacion.

## Pantallas en el frontend

### /register — Registro

- Formulario con campos: nombre completo, email, contrasena.
- Validacion de cliente antes de enviar (longitud, formato email, requisitos de contrasena).
- Mensaje de error visible si el email ya esta registrado.
- Redireccion al catalogo (`/`) tras registro exitoso.
- Enlace a la pantalla de login para usuarios ya registrados.

### /login — Inicio de sesion

- Formulario con campos: email, contrasena.
- Mensaje de error visible si las credenciales son incorrectas.
- Redireccion al catalogo (`/`) tras login exitoso; si el usuario es admin, redireccion a `/admin/products`.
- Enlace a la pantalla de registro.
- No exponer en el mensaje de error si el email existe o no.
