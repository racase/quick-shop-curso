### Requirement: Catálogo público de productos activos
El sistema SHALL exponer GET /api/v1/products/ sin autenticación, devolviendo todos los productos con is_active=true. SHALL soportar parámetros opcionales skip (default 0) y limit (default 100).

#### Scenario: Listado público sin autenticación
- **WHEN** cualquier visitante envía GET /api/v1/products/ sin token
- **THEN** el sistema devuelve 200 con array de productos activos (id, nombre, descripcion, precio, stock, imagen_url, is_active)

#### Scenario: Productos inactivos no aparecen en el listado
- **WHEN** existe un producto con is_active=false
- **THEN** ese producto NO aparece en la respuesta de GET /api/v1/products/

### Requirement: Detalle de producto individual
El sistema SHALL exponer GET /api/v1/products/{id} sin autenticación. SHALL devolver 404 si el producto no existe.

#### Scenario: Detalle de producto existente
- **WHEN** se envía GET /api/v1/products/{id} con un id válido
- **THEN** el sistema devuelve 200 con todos los campos del producto incluyendo created_at y updated_at

#### Scenario: Producto no encontrado
- **WHEN** se envía GET /api/v1/products/{id} con un id inexistente
- **THEN** el sistema devuelve 404 Not Found

### Requirement: Administrador puede crear productos
El sistema SHALL permitir a los administradores crear nuevos productos mediante POST /api/v1/products/. El precio SHALL ser mayor que 0 y el stock SHALL ser mayor o igual a 0. SHALL devolver 201.

#### Scenario: Creación exitosa
- **WHEN** un administrador envía POST /api/v1/products/ con nombre, precio > 0 y stock >= 0
- **THEN** el sistema crea el producto con is_active=true y devuelve 201 con todos los campos

#### Scenario: Precio inválido
- **WHEN** un administrador envía POST /api/v1/products/ con precio <= 0
- **THEN** el sistema devuelve 422 Unprocessable Entity

#### Scenario: Cliente intenta crear producto
- **WHEN** un usuario con rol cliente envía POST /api/v1/products/
- **THEN** el sistema devuelve 403 Forbidden

### Requirement: Administrador puede editar productos
El sistema SHALL permitir a los administradores actualizar cualquier campo de un producto mediante PUT /api/v1/products/{id}. Todos los campos son opcionales en el body. SHALL actualizar updated_at automáticamente.

#### Scenario: Edición exitosa
- **WHEN** un administrador envía PUT /api/v1/products/{id} con campos a actualizar
- **THEN** el sistema aplica los cambios, actualiza updated_at y devuelve 200 con el producto actualizado

#### Scenario: Producto no encontrado al editar
- **WHEN** un administrador envía PUT /api/v1/products/{id} con un id inexistente
- **THEN** el sistema devuelve 404 Not Found

### Requirement: Administrador puede desactivar productos (soft-delete)
El sistema SHALL permitir a los administradores desactivar productos mediante DELETE /api/v1/products/{id}. La operación es un soft-delete (is_active=false), no elimina el registro. SHALL devolver 200 con mensaje de confirmación.

#### Scenario: Desactivación exitosa
- **WHEN** un administrador envía DELETE /api/v1/products/{id} para un producto activo
- **THEN** el sistema pone is_active=false y devuelve 200 con {"detail": "Producto desactivado correctamente"}

#### Scenario: Producto ya desactivado
- **WHEN** un administrador envía DELETE /api/v1/products/{id} para un producto ya inactivo
- **THEN** el sistema devuelve 404 Not Found

### Requirement: Producto con stock 0 visible pero no agregable al carrito
El sistema SHALL mostrar productos con stock=0 en el catálogo con el botón "Agregar al carrito" deshabilitado en el frontend.

#### Scenario: Producto sin stock en el catálogo
- **WHEN** un producto tiene stock=0 y is_active=true
- **THEN** el producto aparece en el catálogo y el botón "Agregar al carrito" está deshabilitado (disabled)

### Requirement: Seed inicial de productos
El sistema SHALL cargar 20 productos iniciales desde `docs/products-images.json` de forma idempotente al arrancar. Si la tabla de productos no está vacía, el seed no inserta nada.

#### Scenario: Seed en base de datos vacía
- **WHEN** la tabla productos está vacía y se ejecuta seed.py
- **THEN** se insertan 20 productos con los datos del JSON

#### Scenario: Seed idempotente
- **WHEN** la tabla productos ya tiene registros y se ejecuta seed.py
- **THEN** el seed no inserta ni modifica ningún producto
