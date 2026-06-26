## ADDED Requirements

### Requirement: Cliente puede consultar su perfil
El sistema SHALL permitir al usuario autenticado obtener su propio perfil mediante GET /api/v1/users/me. La respuesta SHALL incluir id, email, rol, is_active y created_at.

#### Scenario: Consulta de perfil exitosa
- **WHEN** un usuario autenticado envía GET /api/v1/users/me con token válido
- **THEN** el sistema devuelve 200 con el perfil del usuario (id, email, rol, is_active, created_at)

#### Scenario: Consulta sin token
- **WHEN** se envía GET /api/v1/users/me sin Authorization header
- **THEN** el sistema devuelve 401 Unauthorized

### Requirement: Administrador puede listar todos los usuarios
El sistema SHALL permitir a los administradores obtener la lista completa de usuarios del sistema mediante GET /api/v1/users/. Un cliente autenticado SHALL recibir 403.

#### Scenario: Listado exitoso por administrador
- **WHEN** un administrador envía GET /api/v1/users/ con token válido
- **THEN** el sistema devuelve 200 con array de todos los usuarios

#### Scenario: Cliente intenta listar usuarios
- **WHEN** un usuario con rol cliente envía GET /api/v1/users/
- **THEN** el sistema devuelve 403 Forbidden

### Requirement: Administrador puede cambiar el estado activo de un usuario
El sistema SHALL permitir a los administradores activar o desactivar cualquier usuario mediante PATCH /api/v1/users/{id} con el campo is_active. SHALL devolver 404 si el usuario no existe.

#### Scenario: Desactivación de usuario exitosa
- **WHEN** un administrador envía PATCH /api/v1/users/{id} con is_active=false para un usuario existente
- **THEN** el sistema actualiza is_active y devuelve 200 con el perfil actualizado

#### Scenario: Activación de usuario
- **WHEN** un administrador envía PATCH /api/v1/users/{id} con is_active=true
- **THEN** el sistema reactiva el usuario y devuelve 200

#### Scenario: Usuario no encontrado
- **WHEN** un administrador envía PATCH /api/v1/users/{id} con un id inexistente
- **THEN** el sistema devuelve 404 Not Found

#### Scenario: Cliente intenta modificar usuario
- **WHEN** un usuario con rol cliente envía PATCH /api/v1/users/{id}
- **THEN** el sistema devuelve 403 Forbidden
