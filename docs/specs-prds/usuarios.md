# Modulo: Usuarios

## Descripcion

Permite consultar y actualizar el perfil del usuario autenticado. El administrador puede listar todos los usuarios y consultar el detalle de cualquiera. No contempla creacion ni eliminacion de usuarios por API: el admin se crea por seed y los clientes se auto-registran via el modulo de autenticacion.

## Modelo de datos

Comparte la tabla `users` definida en el modulo de autenticacion. No requiere tablas adicionales.

## Endpoints

### GET /users/me

Devuelve el perfil completo del usuario autenticado.

**Headers**: Authorization: Bearer {token}

**Response 200**

```json
{
  "id": "uuid",
  "email": "string",
  "full_name": "string",
  "role": "client | admin",
  "is_active": true,
  "created_at": "datetime ISO 8601"
}
```

**Errores**
- 401: no autenticado

---

### PUT /users/me

Actualiza los datos del perfil del usuario autenticado.

**Headers**: Authorization: Bearer {token}

**Request body** (todos los campos son opcionales)

```json
{
  "full_name": "string (min 2 caracteres)",
  "password": "string (nueva contrasena)"
}
```

**Response 200**: perfil actualizado con el mismo esquema que GET /users/me.

**Errores**
- 400: datos invalidos
- 401: no autenticado

---

### GET /users

Lista todos los usuarios del sistema. Solo accesible por administrador.

**Headers**: Authorization: Bearer {token} (rol admin)

**Query params**
- page: int (default 1)
- size: int (default 20, maximo 100)

**Response 200**

```json
{
  "items": [
    {
      "id": "uuid",
      "email": "string",
      "full_name": "string",
      "role": "client | admin",
      "is_active": true,
      "created_at": "datetime ISO 8601"
    }
  ],
  "total": 50,
  "page": 1,
  "size": 20
}
```

**Errores**
- 401: no autenticado
- 403: no es administrador

---

### GET /users/{user_id}

Detalle de un usuario concreto. Solo accesible por administrador.

**Headers**: Authorization: Bearer {token} (rol admin)

**Response 200**: mismo esquema que GET /users/me.

**Errores**
- 401: no autenticado
- 403: no es administrador
- 404: usuario no encontrado

## Criterios de aceptacion

1. Un cliente autenticado puede ver y editar su propio perfil.
2. Un cliente no puede ver ni editar el perfil de otro usuario.
3. El administrador puede listar todos los usuarios y ver el detalle de cualquiera.
4. Al actualizar la contrasena se guarda el nuevo hash bcrypt.
5. El campo email no se puede modificar; es inmutable tras el registro.

## Pantallas en el frontend

### Perfil propio (cliente y administrador)

- Muestra nombre completo, email y rol.
- Formulario editable para cambiar nombre completo y contrasena.
- Boton de guardar con mensaje de exito o error.

### Listado de usuarios (solo administrador)

- Tabla paginada con columnas: nombre, email, rol, activo, fecha de registro.
- Enlace al detalle de cada usuario.

### Detalle de usuario (solo administrador)

- Vista de solo lectura con todos los campos del usuario.
