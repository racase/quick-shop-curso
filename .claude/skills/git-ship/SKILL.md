---
name: git-ship
description: Commit staged/unstaged changes using Conventional Commits, push to remote, then optionally open a PR. Use when the user wants to commit and push their current work in one shot.
---

Commit the current changes with a Conventional Commit message, push to remote, and optionally create a PR.

---

**Steps**

1. **Check working tree state**

   Run these in parallel:
   - `git status` — identify staged/unstaged/untracked files
   - `git diff HEAD` — full diff of all changes (staged + unstaged)
   - `git log --oneline -5` — recent commits to match message style
   - `git branch --show-current` — current branch name

2. **Abort if nothing to commit**

   If `git status` shows a clean working tree, tell the user there is nothing to commit and stop.

3. **Draft the Conventional Commit message**

   Analyse the diff and determine:
   - **type**: `feat` | `fix` | `refactor` | `test` | `docs` | `chore` | `style` | `perf` | `ci` | `build` | `revert`
   - **scope** (optional): the module/area affected (e.g. `auth`, `products`, `frontend`, `docker`)
   - **subject**: imperative, present tense, ≤72 chars, no trailing period
   - **body** (optional): 1-3 bullet lines explaining *why*, only for non-trivial changes
   - **breaking change** (optional): add `BREAKING CHANGE:` footer if the change breaks the public API

   Format:
   ```
   <type>(<scope>): <subject>

   <body>
   ```

   Show the proposed message to the user before committing.

4. **Stage all changes**

   Run `git add -A` to stage everything.

   > If the user passed specific file paths as arguments, stage only those files instead.

5. **Commit**

   Create the commit using the drafted message via heredoc:
   ```
   git commit -m "$(cat <<'EOF'
   <message>
   EOF
   )"
   ```

   Do NOT skip hooks (`--no-verify`). If a pre-commit hook fails, report the error and stop.

6. **Push**

   Run `git push`. If there is no upstream yet, run `git push -u origin <branch>`.

   If the push is rejected due to diverged history, report the conflict and stop — do not force-push without explicit user confirmation.

7. **Ask about a Pull Request**

   Use the **AskUserQuestion tool** with a single question:

   > "¿Quieres abrir una Pull Request?"

   Options:
   - `Sí → main` — create PR targeting `main`
   - `Sí → otra rama` — ask which target branch, then create the PR
   - `No` — finish here

8. **Create the PR (if requested)**

   Use `gh pr create` with:
   - Title matching the commit subject
   - Body with a bullet summary of the changes (and the commit body if present)
   - `--base <target-branch>`

   Return the PR URL to the user.
