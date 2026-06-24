# Modulo: Usuarios

## Descripcion

Gestiona el perfil de los usuarios autenticados. Un cliente puede consultar y actualizar sus propios datos. El administrador puede listar todos los usuarios y cambiar su estado activo/inactivo. Los roles son asignados en el seed o en el registro; no existe un endpoint para cambiar el rol.

## Modelo de datos

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

### GET /users/me

Devuelve el perfil del usuario autenticado.

**Headers requeridos**: `Authorization: Bearer {access_token}`

**Response 200**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "cliente1@quickshop.com",
  "full_name": "Cliente Uno",
  "role": "client",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Errores**

| Codigo | Motivo                          |
|--------|---------------------------------|
| 401    | Token ausente, invalido o expirado |

---

### PUT /users/me

Actualiza el perfil del usuario autenticado. Solo clientes y administradores sobre su propio perfil.

**Headers requeridos**: `Authorization: Bearer {access_token}`

**Request body** (todos los campos son opcionales; se actualiza solo lo enviado)

```json
{
  "full_name": "Nuevo Nombre",
  "password": "NuevaContraseña1!"
}
```

**Response 200**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "cliente1@quickshop.com",
  "full_name": "Nuevo Nombre",
  "role": "client",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Errores**

| Codigo | Motivo                              |
|--------|-------------------------------------|
| 401    | Token ausente, invalido o expirado  |
| 422    | Datos invalidos                     |

---

### GET /users — Solo admin

Lista todos los usuarios registrados.

**Headers requeridos**: `Authorization: Bearer {access_token}` (rol admin)

**Query params**

| Param  | Tipo    | Default | Descripcion                |
|--------|---------|---------|----------------------------|
| skip   | integer | 0       | Numero de registros a saltar |
| limit  | integer | 20      | Maximo de registros a devolver |

**Response 200**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "cliente1@quickshop.com",
    "full_name": "Cliente Uno",
    "role": "client",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

**Errores**

| Codigo | Motivo                          |
|--------|---------------------------------|
| 401    | Token ausente, invalido o expirado |
| 403    | El usuario no tiene rol admin   |

---

### PATCH /users/{user_id}/status — Solo admin

Activa o desactiva un usuario.

**Headers requeridos**: `Authorization: Bearer {access_token}` (rol admin)

**Request body**

```json
{
  "is_active": false
}
```

**Response 200**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "cliente1@quickshop.com",
  "full_name": "Cliente Uno",
  "role": "client",
  "is_active": false,
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Errores**

| Codigo | Motivo                              |
|--------|-------------------------------------|
| 401    | Token ausente, invalido o expirado  |
| 403    | El usuario no tiene rol admin       |
| 404    | Usuario no encontrado               |

## Criterios de aceptacion

- Un usuario autenticado puede consultar su propio perfil.
- Un usuario autenticado puede actualizar su nombre completo y/o contrasena.
- No es posible cambiar el email ni el rol desde este modulo.
- El administrador puede listar todos los usuarios del sistema.
- El administrador puede activar o desactivar cualquier usuario.
- Un usuario desactivado no puede iniciar sesion (401 en /auth/login).

## Pantallas en el frontend

### /profile — Perfil del usuario (cliente)

- Muestra: nombre completo, email, fecha de registro.
- Formulario para actualizar nombre completo y/o contrasena.
- Confirmacion visual tras actualizar correctamente.
- Solo accesible para usuarios autenticados con rol cliente.

### /admin/users — Listado de usuarios (admin)

- Tabla con columnas: nombre completo, email, rol, estado (activo/inactivo), fecha de registro.
- Boton para activar/desactivar cada usuario.
- Solo accesible para usuarios con rol admin.
