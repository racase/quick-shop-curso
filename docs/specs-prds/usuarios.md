# Modulo: Usuarios

## Descripcion

Gestiona los usuarios del sistema. Existen dos roles: cliente y administrador. El cliente puede consultar su perfil. El administrador puede listar y gestionar el estado de cualquier usuario. Los administradores se crean exclusivamente por seed; no existe un endpoint de creacion de administradores.

## Modelo de datos

### Tabla: usuarios

| Columna          | Tipo         | Restricciones                              |
|------------------|--------------|--------------------------------------------|
| id               | INTEGER      | PRIMARY KEY, AUTOINCREMENT                 |
| email            | VARCHAR(255) | NOT NULL, UNIQUE                           |
| hashed_password  | VARCHAR(255) | NOT NULL                                   |
| rol              | ENUM         | NOT NULL, valores: cliente / administrador |
| is_active        | BOOLEAN      | NOT NULL, DEFAULT true                     |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT now()                    |

## Endpoints

### GET /users/me

Devuelve el perfil del usuario autenticado.

**Headers:** Authorization: Bearer {token}

**Response 200:**
```json
{
  "id": 1,
  "email": "string",
  "rol": "cliente",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

**Errores:**
- 401 Unauthorized: token ausente o invalido

---

### GET /users/

Lista todos los usuarios. Solo accesible para administradores.

**Headers:** Authorization: Bearer {token}

**Response 200:**
```json
[
  {
    "id": 1,
    "email": "string",
    "rol": "cliente",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

**Errores:**
- 401 Unauthorized: token ausente o invalido
- 403 Forbidden: el usuario autenticado no es administrador

---

### PATCH /users/{id}

Actualiza el estado activo de un usuario. Solo accesible para administradores.

**Headers:** Authorization: Bearer {token}

**Request body:**
```json
{
  "is_active": false
}
```

**Response 200:**
```json
{
  "id": 1,
  "email": "string",
  "rol": "cliente",
  "is_active": false,
  "created_at": "2024-01-01T00:00:00"
}
```

**Errores:**
- 401 Unauthorized: token ausente o invalido
- 403 Forbidden: el usuario autenticado no es administrador
- 404 Not Found: usuario no encontrado

## Criterios de aceptacion

- Un usuario autenticado puede consultar su propio perfil.
- Un administrador puede listar todos los usuarios del sistema.
- Un administrador puede activar o desactivar cualquier usuario.
- Un cliente no puede acceder a los endpoints de administracion de usuarios.
- Los administradores solo se crean por seed; el endpoint de registro no puede crear administradores.
- Un usuario desactivado no puede autenticarse (ver modulo Autenticacion).

## Pantallas en el frontend

- **Perfil de usuario:** muestra email, rol y fecha de registro. Accesible desde el header cuando el usuario esta autenticado.
- **Panel de administrador - Usuarios:** tabla con listado de todos los usuarios, su rol, estado activo/inactivo y boton para activar o desactivar. Solo visible para el administrador.
