### Requirement: Usuario puede registrarse con rol cliente
El sistema SHALL permitir el registro de nuevos usuarios con rol `cliente` mediante email y password. El password SHALL cumplir: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un dígito. El sistema SHALL devolver 201 con el perfil del usuario creado.

#### Scenario: Registro exitoso
- **WHEN** se envía POST /api/v1/auth/register con email único y password válido
- **THEN** el sistema crea el usuario con rol `cliente`, password hasheado con bcrypt, y devuelve 201 con id, email, rol e is_active

#### Scenario: Email ya registrado
- **WHEN** se envía POST /api/v1/auth/register con un email que ya existe
- **THEN** el sistema devuelve 400 Bad Request

#### Scenario: Password no cumple requisitos
- **WHEN** se envía POST /api/v1/auth/register con password sin mayúscula, sin minúscula o con menos de 8 caracteres
- **THEN** el sistema devuelve 422 Unprocessable Entity

#### Scenario: Registro no puede crear administrador
- **WHEN** se envía POST /api/v1/auth/register con cualquier payload
- **THEN** el usuario creado siempre tiene rol `cliente`, independientemente de campos extras en el body

### Requirement: Usuario puede autenticarse y recibir token JWT
El sistema SHALL autenticar usuarios con email y password correctos y devolver un access token JWT con expiración de 2 horas. El sistema SHALL rechazar usuarios inactivos con 401.

#### Scenario: Login exitoso
- **WHEN** se envía POST /api/v1/auth/login con credenciales correctas de un usuario activo
- **THEN** el sistema devuelve 200 con access_token (JWT) y token_type "bearer"

#### Scenario: Credenciales incorrectas
- **WHEN** se envía POST /api/v1/auth/login con password incorrecto o email inexistente
- **THEN** el sistema devuelve 401 Unauthorized

#### Scenario: Usuario inactivo intenta autenticarse
- **WHEN** se envía POST /api/v1/auth/login con credenciales correctas de un usuario con is_active=false
- **THEN** el sistema devuelve 401 Unauthorized

### Requirement: Token JWT se almacena en memoria en el frontend
El sistema frontend SHALL almacenar el access token únicamente en el estado de React (Context), nunca en localStorage ni sessionStorage.

#### Scenario: Token en memoria tras login
- **WHEN** el usuario completa el login correctamente
- **THEN** el token se guarda en AuthContext y no aparece en localStorage ni sessionStorage del navegador

#### Scenario: Pérdida de sesión al recargar
- **WHEN** el usuario recarga la página del navegador
- **THEN** el token se pierde y el usuario es redirigido a /login si intenta acceder a rutas protegidas
