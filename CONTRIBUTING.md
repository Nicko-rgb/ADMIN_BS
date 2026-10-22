# CONTRIBUTING — ADMIN_BS

Metodología de trabajo en equipo del panel de administración de **Booking Sport**: **Git Flow** (ramas) + **Conventional Commits** (mensajes de commit).

---

## 1. Árbol de ramas

```
                    ┌──────────────────────────────────────────────┐
                    │                  main (PRODUCCIÓN)           │
                    │  solo el owner hace merge; se despliega acá  │
                    └───▲──────────────────────────────▲───────────┘
                        │ merge release (owner)        │ merge hotfix
          ┌─────────────┴──────────────┐               │
          │                            │               │
          │   ┌────────────────────────┴────────┐      │
          │   │        develop (INTEGRACIÓN)    │      │
          │   │  rama base de todo el equipo    │      │
          │   └────▲──────────────▲─────────────┘      │
          │        │              │                    │
          │   merge PR         merge PR                │
          │        │              │                    │
          │  ┌─────┴─────┐  ┌─────┴──────┐             │
          │  │feat/BS-12 │  │fix/BS-30   │             │
          │  │nicola     │  │marco       │             │
          │  └───────────┘  └────────────┘             │
          │                                            │
          │  ┌──────────────────────────────────────┐  │
          └──┤ hotfix/BS-44-error-produccion        │──┘
             └──────────────────────────────────────┘
                    (sale de main, vuelve a main y a develop)
```

### Tabla de ramas

| Rama                                      | Para qué                                     | Quién hace push                                         | Se despliega     |
| ----------------------------------------- | --------------------------------------------- | -------------------------------------------------------- | ---------------- |
| `main`                                  | **Producción.** Rama protegida.        | **Solo el owner**, vía PR `develop` → `main` | Sí              |
| `develop`                               | **Integración.** Rama base del equipo. | Solo vía PR (feature/hotfix)                            | No               |
| `feat/*`, `fix/*`, `refactor/*`, … | **Tarea en curso.** Una por dev.        | Su autor                                                 | No               |
| `hotfix/*`                              | **Fix urgente en producción.**         | Su autor                                                 | Sale de `main` |

### Reglas

1. `main` y `develop` **nunca** se actualizan con push directo: siempre por Pull Request.
2. Cada dev trabaja en **su propia rama**, creada desde `develop` actualizado.
3. **Una rama = una tarea = un PR.** Si la tarea crece, se divide en varias PRs.
4. **El owner es el único que hace merge `develop` → `main`.**
5. Nada entra a `main` sin pasar antes por `develop`.
6. Un fix en producción sale de `main` (rama `hotfix/`), y además se mergea a `develop`.
7. Antes de abrir el PR, la rama se actualiza con `develop`.

---

## 2. Convención de nombres de rama

```
<tipo>/<ticket-id>-<descripcion-corta>
```

- `<tipo>`: uno de la tabla de abajo.
- `<ticket-id>`: opcional. Si existe ticket, va primero (ej. `BS-123`). Si no, se usa un sufijo corto del tema.
- `<descripcion-corta>`: `kebab-case`, minúsculas, sin tildes ni espacios, 2-4 palabras.

### Tipos permitidos

| Tipo         | Cuándo                                        |
| ------------ | ---------------------------------------------- |
| `feat`     | Funcionalidad nueva                            |
| `fix`      | Corrección de un bug                          |
| `hotfix`   | Corrección urgente en producción             |
| `refactor` | Reestructuración sin cambio de comportamiento |
| `perf`     | Mejora de rendimiento                          |
| `docs`     | Solo documentación                            |
| `test`     | Solo tests                                     |
| `chore`    | Mantenimiento (dependencias, config)           |
| `ci`       | Cambios en workflows                           |
| `build`    | Sistema de build                               |
| `style`    | Formato, sin cambio de lógica                 |

### Ejemplos

```
feat/BS-120-gestor-de-sucursales
fix/BS-118-error-al-cargar-galeria
hotfix/BS-131-error-500-al-loguear
refactor/BS-95-logica-del-modal-a-un-hook
chore/actualizar-react
```

### Reglas de validación

- ✅ Solo minúsculas, números, `-` y **un** `/` (el que separa tipo de descripción).
- ❌ Sin espacios, tildes, `ñ` ni caracteres especiales.
- ❌ Nombres genéricos: `test`, `fix`, `dev`, `new`, `update`, `wip`.

---

## 3. Commits — Conventional Commits

```
<tipo>(<ámbito>): <descripción en imperativo>
```

```
feat(sucursales): agregar formulario de edición
fix(galeria): corregir error al cargar imágenes
refactor(hooks): extraer la lógica del modal a un hook
```

- **Tipo**: los de la tabla anterior.
- **Ámbito** *(opcional)*: módulo afectado (`companys` `sucursales` `spaces` `bookings` `galeria` `users` `shared`).
- **Descripción**: imperativo ("agregar", no "agregado"), minúscula, sin punto final.
- Un commit = un cambio lógico. Commits chicos.

El cuerpo del commit es opcional y explica **por qué**, no **qué** (el diff ya muestra el qué).

```bash
git commit -m "fix(galeria): corregir error al cargar imágenes" -m "Closes #118"
```

---

## 4. Flujo de trabajo

### 4.1 Empezar una tarea

```bash
git checkout develop
git pull origin develop

git checkout -b feat/BS-124-gestion-de-galeria
```

### 4.2 Durante la tarea

```bash
git add -A
git commit -m "feat(galeria): agregar formulario de edicion"
git push -u origin feat/BS-124-gestion-de-galeria
```

### 4.3 Antes de abrir el PR

```bash
npm run lint            # eslint
npm run build           # tsc -b && vite build

git fetch origin
git rebase origin/develop    # o: git merge origin/develop
git push --force-with-lease   # solo si la rama ya estaba pusheada
```

### 4.4 Abrir el PR

- **Origen**: tu rama de tarea → **Destino**: `develop`.
- Requiere **1 aprobación** de otro dev y el CI en verde.
- Se mergea con **squash**, así `develop` queda con commits limpios (`feat(galeria): ... (#124)`).
- Si el PR **depende de un endpoint o campo nuevo del backend**, el PR de `BACKEND_BS` debe estar **ya mergeado en `develop`** de ese repo (ver §6).

### 4.5 Después del merge

```bash
git checkout develop
git pull origin develop
git branch -d feat/BS-124-gestion-de-galeria
git fetch origin --prune
```

---

## 5. Release a producción (`develop` → `main`)

Lo hace **el owner**.

```bash
# 1. develop al día
git checkout develop
git pull origin develop

# 2. Rama de release desde develop
git checkout -b release/v1.2.0
#    acá se corrige lo que falte, en commits fix/chore

# 3. PR: release/v1.2.0 → main   (el owner revisa y mergea)
# 4. PR: release/v1.2.0 → develop (para que develop quede igual que main)

# 5. Tag
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

**Checklist antes de mergear a `main`:**

- [ ] `develop` tiene todo lo que va a producción.
- [ ] `npm run lint` y `npm run build` en verde.
- [ ] Si cambió el contrato de la API, el backend ya está desplegado con ese contrato.
- [ ] Flujo principal probado en `develop`.
- [ ] Versión/tag definida.

---

## 6. Hotfix en producción

Un fix urgente **no** se hace desde `develop` (puede tener cambios no liberados).

```bash
git checkout main
git pull origin main
git checkout -b hotfix/BS-131-error-500-al-loguear

# ... se hace el fix ...
git commit -m "fix(auth): corregir expiracion del token"
git push -u origin hotfix/BS-131-error-500-al-loguear
```

- PR `hotfix/…` → **`main`** (el owner mergea, se despliega).
- PR `hotfix/…` → **`develop`** (obligatorio, para no perder el fix en el próximo release).

---

## 7. Coordinación con `BACKEND_BS`

El backend manda en el contrato de la API. Si un PR de front necesita un endpoint o campo nuevo:

1. Abrir primero (o en paralelo, avisando) el PR de backend con el cambio de contrato, marcado `⚠️ Breaking change en la API`.
2. Mergear el backend a `develop` **primero**.
3. Mergear el front a `develop` después, en el mismo día.
4. En el release, backend a `main` antes que front a `main`.

---

## 8. Checklist del PR

- [ ] La rama sale de `develop` actualizado y cumple la nomenclatura.
- [ ] `npm run lint` y `npm run build` pasan sin errores.
- [ ] Ninguna `page` tiene lógica de estado (va en `hooks/` o `store/`).
- [ ] Ningún componente llama a `axios` directo — todo pasa por `service/`.
- [ ] Estilos en `styles/`, con nesting, sin inline.
- [ ] Mensajes de éxito/error vienen del backend, no hardcodeados.
- [ ] Sin secretos ni `.env` en el repo.
- [ ] El PR hace una sola cosa.

---

## 9. Reglas de código

Las reglas de estructura del front están en `.claude/CLAUDE.md` del workspace y en la skill `ui-design` (`.claude/skills/ui-design/SKILL.md`). Resumen:

```
Interfaces (tipos) → .tsx (presentación) ← Hook (lógica/estado) + Store ← Service (API) ← Backend
```

| Script            | Para qué                |
| ----------------- | ------------------------ |
| `npm run dev`   | Vite dev server          |
| `npm run lint`  | ESLint                   |
| `npm run build` | `tsc -b && vite build` |
