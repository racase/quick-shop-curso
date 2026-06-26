# Modulo: Autenticacion

## Descripcion

Gestiona el acceso al sistema mediante tokens JWT. Los usuarios se identifican con email y password. El sistema emite un access token con duracion de 2 horas que el frontend almacena en memoria (nunca en localStorage). El registro esta restringido a usuarios con rol cliente; el administrador se crea exclusivamente por seed.

## Modelo de datos

No dispone de tabla propia. Utiliza la tabla `usuarios` definida en el modulo Usuarios.

## Endpoints

### POST /auth/login

Autentica a un usuario y devuelve un access token.

**Request body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

**Errores:**
- 401 Unauthorized: credenciales incorrectas o usuario inactivo
- 422 Unprocessable Entity: formato de datos invalido

---

### POST /auth/register

Registra un nuevo usuario con rol cliente.

**Request body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Restricciones de password:** minimo 8 caracteres, al menos una mayuscula, una minuscula y un digito.

**Response 201:**
```json
{
  "id": 1,
  "email": "string",
  "rol": "cliente",
  "is_active": true
}
```

**Errores:**
- 400 Bad Request: el email ya existe en el sistema
- 422 Unprocessable Entity: formato de datos invalido o password no cumple requisitos

## Criterios de aceptacion

- Un usuario con credenciales correctas recibe un access token JWT valido durante 2 horas.
- Las passwords se almacenan hasheadas con bcrypt directamente (sin passlib).
- Un usuario inactivo recibe 401 al intentar autenticarse.
- Un email ya registrado devuelve 400 al intentar registrarse de nuevo.
- El registro solo crea usuarios con rol cliente; el administrador no puede crearse por este endpoint.
- El token no se almacena en localStorage en el frontend.

## Pantallas en el frontend

- **Login:** formulario con campos email y password, boton de acceso y enlace a registro. Muestra mensaje de error si las credenciales son incorrectas.
- **Registro:** formulario con campos email y password, boton de registro y enlace a login. Muestra mensajes de validacion inline.
- Tras autenticacion exitosa se redirige automaticamente al catalogo de productos.
- El header muestra el estado de sesion y un boton de cerrar sesion cuando hay usuario autenticado.
