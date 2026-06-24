---
name: git-ship
description: Hace commit de los cambios con Conventional Commits, push al remoto y opcionalmente abre una PR. Úsalo cuando el usuario quiera subir su trabajo actual de una sola vez.
---

Haz commit de los cambios actuales con un mensaje Conventional Commit, push al remoto y opcionalmente crea una PR.

---

**Pasos**

1. **Revisar el estado del repositorio**

   Ejecuta en paralelo:
   - `git status` — identificar ficheros modificados, staged y sin seguimiento
   - `git diff HEAD` — diff completo de todos los cambios (staged + unstaged)
   - `git log --oneline -5` — commits recientes para seguir el estilo del proyecto
   - `git branch --show-current` — nombre de la rama actual

2. **Abortar si no hay nada que commitear**

   Si `git status` muestra el árbol de trabajo limpio, informa al usuario y para.

3. **Redactar el mensaje de Conventional Commit**

   Analiza el diff y determina:
   - **type**: `feat` | `fix` | `refactor` | `test` | `docs` | `chore` | `style` | `perf` | `ci` | `build` | `revert`
   - **scope** (opcional): módulo o área afectada (ej. `auth`, `products`, `frontend`, `docker`)
   - **subject**: modo imperativo, tiempo presente, ≤72 caracteres, sin punto final
   - **cuerpo** (opcional): 1-3 líneas explicando el *por qué*, solo para cambios no triviales
   - **breaking change** (opcional): añade footer `BREAKING CHANGE:` si el cambio rompe la API pública

   Formato:
   ```
   <type>(<scope>): <subject>

   <cuerpo>
   ```

   Muestra el mensaje propuesto al usuario antes de commitear.

4. **Añadir los cambios al stage**

   Ejecuta `git add -A` para añadir todo.

   > Si el usuario pasó rutas de ficheros concretos como argumentos, añade solo esos ficheros.

5. **Crear el commit**

   Crea el commit con el mensaje redactado usando heredoc:
   ```
   git commit -m "$(cat <<'EOF'
   <mensaje>
   EOF
   )"
   ```

   No omitas los hooks (`--no-verify`). Si un pre-commit hook falla, reporta el error y para.

6. **Push al remoto**

   Ejecuta `git push`. Si no hay upstream configurado, ejecuta `git push -u origin <rama>`.

   Si el push es rechazado porque el historial remoto ha divergido, reporta el conflicto y para — no hagas force-push sin confirmación explícita del usuario.

7. **Preguntar sobre la Pull Request**

   Usa la herramienta **AskUserQuestion** con una sola pregunta:

   > "¿Quieres abrir una Pull Request?"

   Opciones:
   - `Sí → main` — crear PR apuntando a `main`
   - `Sí → otra rama` — preguntar a qué rama base y crear la PR
   - `No` — terminar aquí

8. **Crear la PR (si se solicita)**

   Usa `gh pr create` con:
   - Título igual al subject del commit
   - Cuerpo con un resumen en bullets de los cambios (y el cuerpo del commit si existe)
   - `--base <rama-base>`

   Devuelve la URL de la PR al usuario.
