---
name: commit-push-pr
description: Analiza el diff, genera un conventional commit, hace push y opcionalmente abre una PR. Úsalo cuando quieras commitear cambios siguiendo el estándar Conventional Commits.
---

Genera un commit con Conventional Commits, hace push y pregunta si abrir una PR.

---

**Steps**

## 1. Recopilar el estado del repositorio

Ejecuta en paralelo:
```bash
git status --short
git diff HEAD          # cambios sin stagear
git diff --cached      # cambios ya en staging
git log --oneline -5   # contexto del historial
git branch --show-current
```

## 2. Determinar qué archivos incluir

- Si hay archivos en staging (`git diff --cached` no está vacío): usa solo esos.
- Si no hay nada en staging pero sí hay cambios sin stagear: haz `git add -A` para incluirlos todos, **excepto** archivos que coincidan con `.gitignore` o contengan secretos evidentes (`.env`, `*.key`, `credentials.*`).
- Si no hay ningún cambio: informa al usuario y detente.

Si detectas archivos potencialmente sensibles sin ignorar, avisa antes de continuar.

## 3. Leer el diff final

```bash
git diff --cached --stat
git diff --cached
```

Analiza los cambios: qué ficheros se modificaron, qué tipo de cambio es (nueva funcionalidad, corrección, refactor, docs, etc.).

## 4. Generar el mensaje de commit

Sigue el estándar **Conventional Commits** (https://www.conventionalcommits.org):

```
<type>(<scope>): <description>

[body opcional — solo si el cambio necesita explicación adicional]

[footer opcional — BREAKING CHANGE, closes #issue, etc.]
```

**Tipos permitidos:**
| Tipo | Cuándo usarlo |
|------|--------------|
| `feat` | Nueva funcionalidad visible para el usuario |
| `fix` | Corrección de un bug |
| `refactor` | Cambio de código que no añade feature ni corrige bug |
| `perf` | Mejora de rendimiento |
| `test` | Añadir o corregir tests |
| `docs` | Solo documentación |
| `style` | Formato, espacios, punto y coma — sin cambio de lógica |
| `chore` | Tareas de mantenimiento (dependencias, config, scripts) |
| `ci` | Cambios en CI/CD |
| `build` | Sistema de build, Dockerfile, docker-compose |
| `revert` | Revertir un commit anterior |

**Scope:** área del proyecto afectada en kebab-case. Ejemplos: `auth`, `products`, `frontend`, `backend`, `db`, `seed`, `docker`. Omítelo si el cambio es transversal.

**Description:** imperativo, en el mismo idioma que el historial del repo, máximo 72 caracteres. No termina en punto.

**Ejemplos:**
```
feat(auth): add JWT refresh token endpoint
fix(products): return 404 when deactivated product is fetched
chore(deps): upgrade SQLAlchemy to 2.0.51
build(docker): mount docs volume for seed data access
```

**Reglas:**
- Si hay BREAKING CHANGE, añade `!` después del tipo/scope: `feat(api)!: rename endpoint` y un footer `BREAKING CHANGE: <descripción>`.
- Si el diff toca múltiples áreas sin scope común, omite el scope.
- Si hay varios cambios lógicamente distintos, usa el tipo del cambio más relevante y describe el principal en la descripción; el resto va en el body.

## 5. Mostrar propuesta y confirmar

Muestra el mensaje propuesto al usuario:

```
Mensaje de commit propuesto:

  <tipo>(<scope>): <descripción>

  <body si aplica>

¿Confirmas, quieres editarlo o cancelar?
```

Usa **AskUserQuestion** con opciones:
- "Confirmar" — procede con el mensaje tal cual
- "Editar" — pide al usuario el mensaje definitivo (campo libre)
- "Cancelar" — detente sin hacer nada

## 6. Hacer el commit

```bash
git commit -m "<mensaje confirmado>"
```

Si el commit falla por un pre-commit hook, muestra el error completo y espera instrucciones del usuario. **No uses `--no-verify`** salvo que el usuario lo pida explícitamente.

## 7. Push

Obtén la rama actual:
```bash
git branch --show-current
```

Haz push. Si la rama no tiene upstream todavía:
```bash
git push -u origin <rama>
```

Si ya tiene upstream:
```bash
git push
```

Muestra la URL del remote y confirma que el push fue exitoso.

## 8. Preguntar por la PR

Usa **AskUserQuestion** para preguntar:

> "¿Quieres abrir una Pull Request?"

Opciones:
- "Sí" — pregunta a qué rama base con otra AskUserQuestion (opciones sugeridas: `main`, `dev`, `develop`, u "Otra" para entrada libre)
- "No" — termina aquí

## 9. Crear la PR (si el usuario dijo sí)

Lee los commits entre la rama actual y la base para escribir el resumen:
```bash
git log <base>..<rama-actual> --oneline
```

Crea la PR con `gh`:
```bash
gh pr create \
  --base <rama-base> \
  --title "<tipo>(<scope>): <descripción>" \
  --body "$(cat <<'EOF'
## Summary

<1-3 bullets describiendo qué cambia y por qué>

## Test plan

<checklist de verificación mínima>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

El título de la PR debe ser el mismo mensaje de commit (sin el body/footer).
Devuelve la URL de la PR al usuario.

---

**Guardrails**

- Nunca uses `--no-verify` ni `--force-push` salvo petición explícita del usuario.
- No commitees `.env`, `*.key`, `credentials.*` ni ficheros que el `.gitignore` debería cubrir.
- Si `git status` está limpio, informa y detente sin hacer nada.
- Si el push falla por divergencia (`non-fast-forward`), muestra el error y pregunta al usuario cómo proceder; no hagas `--force` automáticamente.
- Confirma siempre el mensaje antes de commitear — nunca asumas que la propuesta es definitiva.
