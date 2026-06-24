# Modulo: Autenticacion

## Descripcion

Gestiona el registro e inicio de sesion de usuarios, la emision y validacion de tokens JWT y la proteccion de rutas que requieren identidad verificada. Es el punto de entrada obligatorio para cualquier accion que no sea consulta publica del catalogo.

## Modelo de datos

### Tabla: users

| Columna          | Tipo              | Restricciones                          |
|------------------|-------------------|----------------------------------------|
| id               | UUID              | PK, default uuid_generate_v4()        |
| email            | VARCHAR(255)      | NOT NULL, UNIQUE                       |
| hashed_password  | VARCHAR(255)      | NOT NULL                               |
| full_name        | VARCHAR(255)      | NOT NULL                               |
| role             | ENUM(UserRole)    | NOT NULL, valores: client, admin       |
| is_active        | BOOLEAN           | NOT NULL, default TRUE                 |
| created_at       | TIMESTAMP WITH TZ | NOT NULL, default now()                |
| updated_at       | TIMESTAMP WITH TZ | NOT NULL, default now()                |

Notas:
- El campo role se implementa como un tipo enumerado en PostgreSQL (UserRole).
- La contrasena nunca se almacena en texto plano; se guarda el hash producido por bcrypt.
- No existe tabla de tokens: los JWT son stateless y se validan con la clave secreta.

## Endpoints

### POST /auth/register

Registra un nuevo usuario con rol cliente.

**Request body**

```json
{
  "email": "string (formato email valido)",
  "password": "string (min 8 caracteres, al menos 1 mayuscula y 1 numero)",
  "full_name": "string (min 2 caracteres)"
}
```

**Response 201**

```json
{
  "id": "uuid",
  "email": "string",
  "full_name": "string",
  "role": "client"
}
```

**Errores**
- 400: datos de entrada invalidos (validacion Pydantic)
- 409: el email ya esta registrado

---

### POST /auth/login

Autentica un usuario y devuelve un access token JWT.

**Request body**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200**

```json
{
  "access_token": "string (JWT)",
  "token_type": "bearer"
}
```

Notas de seguridad:
- El token se envia en la cabecera Authorization: Bearer o en una cookie HttpOnly.
- No se almacena en localStorage.
- Expira en 2 horas.

**Errores**
- 401: credenciales incorrectas
- 422: formato de request invalido

---

### GET /auth/me

Devuelve los datos del usuario autenticado a partir del token.

**Headers**: Authorization: Bearer {token}

**Response 200**

```json
{
  "id": "uuid",
  "email": "string",
  "full_name": "string",
  "role": "client | admin",
  "is_active": true
}
```

**Errores**
- 401: token ausente, expirado o invalido

## Criterios de aceptacion

1. Un usuario puede registrarse con email unico y contrasena valida.
2. Un usuario registrado puede iniciar sesion y recibir un JWT valido.
3. El JWT expira exactamente a las 2 horas de su emision.
4. Las contrasenas se almacenan hasheadas con bcrypt; nunca en texto plano.
5. Las rutas protegidas devuelven 401 si el token es invalido o esta ausente.
6. No es posible registrar dos usuarios con el mismo email.
7. El endpoint GET /auth/me devuelve los datos correctos para el usuario del token.

## Pantallas en el frontend

### Login

- Formulario con campos: email, contrasena.
- Boton de envio.
- Enlace a la pagina de registro.
- Mensaje de error si las credenciales son incorrectas.
- Redirige al catalogo tras login exitoso.

### Registro

- Formulario con campos: nombre completo, email, contrasena, confirmacion de contrasena.
- Validacion en cliente: formato email, longitud y complejidad de contrasena, coincidencia de confirmacion.
- Mensaje de error si el email ya existe.
- Redirige al login tras registro exitoso.
