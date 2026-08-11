# Handoff: Rythmo — Family Weekly Planner (Mobile App)

## Overview
Rythmo is a mobile app that helps busy/organized parents build a weekly family schedule around their real constraints, habits, and each family member's priorities. It supports onboarding, a home dashboard, search, task/event detail, a multi-task creation flow with an age-aware suggestion library, a "smart replan" engine that proposes scored time slots with visible reasoning, calendar sync, and sharing the plan with people outside the family.

## About the Design Files
The files in this bundle (`Rythmo App.dc.html`, `Rythmo Screens.dc.html`) are **design references** — interactive HTML/React prototypes built to show intended look, content, and behavior. They are **not production code to copy directly**. The task is to **recreate these designs in the target codebase's existing environment** (React Native, SwiftUI, Kotlin/Compose, Flutter, etc.) using its established patterns, navigation, and component libraries — or, if no mobile codebase exists yet, choose the most appropriate framework and implement the designs there.

The prototype is split in two files for prototyping convenience only:
- `Rythmo App.dc.html` — holds all app state (tasks, members, constraints, calendar connection, sharing) and switches between an iOS/Android device-frame preview.
- `Rythmo Screens.dc.html` — all actual screens/UI, receiving state and callbacks as props.
A real implementation does not need this split; treat it as one app with one navigation stack and one data layer.

## Fidelity
**High-fidelity.** Colors, spacing, type, and copy are intended to be final-ish (French copy, tech/data-grid visual direction). Recreate pixel-close using the target codebase's component library; where the target design system already defines an equivalent component (buttons, cards, chips, inputs), prefer that component's styling over copying literal values, but preserve the described layout, hierarchy, and content.

## Screens / Views

### 1. Onboarding (4 steps)
1. **Welcome** — app mark (rounded square, accent bg, "R" monogram), title "Rythmo", one-line tagline, progress dots (1 of 4), primary button "Commencer".
2. **Priorités** — back chevron, heading "Vos priorités", subheading, wrapping row of toggle chips (habits: horaires de travail, école & devoirs, activités extrascolaires, sommeil des enfants, tâches ménagères, temps en famille, rendez-vous santé), progress dots (2 of 4), primary button "Continuer".
3. **Notifications** — back chevron, bell icon in circle, heading "Restez à l'heure", body copy, progress dots (3 of 4), primary "Activer les rappels" + ghost "Plus tard" (either sets a boolean and continues).
4. **Contraintes** (NEW) — back chevron, heading "Vos contraintes", 3 label+time-range-input pairs: Sommeil des enfants, Pause déjeuner, Ne pas déranger (soirée) — each defaulting to 20:00–07:00 / 12:00–13:30 / 20:00–22:00. Progress dots (4 of 4), primary "Terminer" → Home.

### 2. Home (dashboard)
- Header: date, "Bonjour, {Prénom}", circular avatar button (initials) → Profile.
- Secondary button "Replanifier ma semaine" → Replan screen.
- Horizontal week strip: 7 day pills (Lun–Dim with date numbers), selecting one filters the day's list below; today is pre-selected and visually marked.
- Loading state: on entering Home, show 3 skeleton rows (pulsing opacity) for ~650ms before the real list.
- Day section: heading ("Aujourd'hui" or full day name) + count tag ("N tâches").
  - Task/event card row: time (monospace) · title · category tag · "Modifiable" accent tag (only if the item's schedule is flexible/AI-managed) · small calendar glyph (only if synced to external calendar) · stacked overlapping avatar circles (one per assigned member, max visual overlap -8px).
  - Empty state (no items that day): centered card, muted copy, secondary button "Ajouter une tâche".
- Bottom tab bar (5 items): Accueil, Recherche, center elevated "+" (Create), Alertes (bell, red/accent dot badge if unread notifications), Profil.

### 3. Replanifier ma semaine (smart replan)
- Intro copy explaining the engine reasons about priority, deadline, and constraints.
- One card per **flexible** item (not user-pinned): title, "Actuellement : {day} {time}", a highlighted proposed-slot panel (day/time in monospace + "Proposé" tag + one-line reason), row of alternate slot pills ("ou Mer 10:00" etc. — clicking swaps which candidate is highlighted), expandable "Voir le détail" revealing a bullet list of the reasoning factors (deadline respected, energy/priority fit, day still light, no conflict, respects lunch/DND/sleep windows), and two actions: primary "Accepter" (applies day/time, dismisses card, shows a toast) and ghost "Ignorer" (dismisses without changing anything).
- Empty state if nothing is flexible: explains that only items marked "Modifiable" get proposals, with a way back Home.

### 4. Rechercher
- Title, search input, horizontal category filter chips (Tous, École, Travail, Maison, Santé, Loisirs).
- No query + "Tous" filter → "Suggestions" list (generic routine templates; tapping opens Create pre-filled with that title).
- Query or filter active → filtered result list (same card style as Home, showing day+time), or an empty-state card ("Aucun résultat pour « query »").

### 5. Détail (tâche/événement)
- Back chevron top bar; edit (pencil) and delete (trash) icon buttons, top-right.
- Category tag + priority tag + "Modifiable"/"Ancrée" tag.
- Title (large).
- Info card: day (full name), time + duration (monospace), recurrence label ("Tâche récurrente" or "Événement ponctuel"), deadline row if set.
- Calendar sync card (only if a calendar is connected): current sync status text + quick toggle button.
- "Assigné à" section: one row per assigned member (avatar + name).
- Notes section if present.

### 6. Créer (nouvelle tâche/événement, supports batch creation)
- "Tâches à ajouter" header + "Choisis pour moi (jour & heure)" button (auto-assigns day/time to any *unset* row only, avoiding conflicts and constraint windows; assigned rows get tagged "Modifiable" — rows the user has manually set a day/time for stay tagged "Ancrée" and are left alone).
- Repeatable row cards, each with: title input + remove (×, hidden if only one row), 7 compact day chips + time text input, a status tag ("Ancrée"/"Modifiable", only once a day is set), duration chips (15/30/45/60/90 min), priority/energy chips (Concentration élevée / Énergie moyenne / Tâche légère), optional deadline chips (Aucune + 7 days).
- "+ Ajouter une tâche" ghost button appends another row.
- Shared (whole batch) fields below the rows: category chips, "Assigné à" member chips (multi-select), age-based suggestion chips (appears once ≥1 member is selected — pulls from an age-bracket task library keyed by the youngest/first selected member's age; tapping fills the first empty row or adds a new one and sets category), a segmented/checkbox choice for **Tâche récurrente vs Événement ponctuel** (this determines the screen title and vocabulary used elsewhere), a "Synchroniser avec {calendar}" checkbox (only shown if a calendar is connected), notes textarea.
- Primary "Enregistrer"/"Enregistrer les tâches" (disabled until at least one row has a title) + ghost "Annuler".
- Editing an existing item pre-fills everything from that item and locks the row count to 1 (no add/remove).

### 7. Profil
- Avatar + name + "Compte principal".
- "Membres de la famille" list (avatar, name, chevron) + "Ajouter un membre" row.
- "Calendrier" section: not connected → list of providers (Google/Apple/Outlook) each with a "Connecter" button; connected → single row showing provider + account email + "Déconnecter".
- "Contraintes récurrentes" card: read-only summary of the 3 time windows set during onboarding.
- "Paramètres" list (Notifications, Confidentialité, Aide & support).
- Secondary button "Partager le planning" → Share screen.
- Ghost button "Se déconnecter".

### 8. Partager le planning (NEW)
- Explanatory copy: people invited only see items synced to the calendar.
- Share-link card: monospace link text + "Copier" button (copies to clipboard, shows a toast).
- "Partagé avec" list: name + role ("Co-parent"/"Invité") + remove (×) per row.
- Name input + "Inviter" button to add a new person (name only in this prototype; a real build should use email/phone + an actual invite/accept flow).

### 9. Notifications
- Title + "Tout marquer comme lu" ghost button.
- Grouped sections "Aujourd'hui" / "Cette semaine", each a list of rows: unread dot (accent if unread, muted if read) + title + relative time. Tapping a row marks it read.
- Empty state: "Vous êtes à jour."

## Interactions & Behavior
- **Navigation**: a simple screen-name + history-stack model (push on forward nav, pop on back). Tab bar items are direct jumps (not pushed to history). No deep linking implemented in the prototype.
- **Toasts**: transient top-of-screen confirmation (e.g. "Créneau appliqué : Mer 10:00.", "Lien copié.") — auto-dismiss after ~2.4s.
- **Smart replan scoring** (reference algorithm, reimplement in the target stack):
  - Hard filters (candidate slot rejected outright): falls inside lunch window, falls inside "do not disturb" window, falls inside children's sleep window, is after the item's deadline day, conflicts with another item sharing an assigned member at the same day+time.
  - Soft scoring: +3 "concentration élevée" priority matched to a morning slot (08:00–11:00); +3 "tâche légère" matched to an evening slot (17:00–20:00); +2 "énergie moyenne" matched to a midday slot (12:00,14:00–16:00); +up to 3 for proximity to deadline; +up to 2 for choosing a day with fewer existing items (load balancing).
  - Take the top-scoring candidate per distinct day, return top 3, sorted by score.
  - Each candidate carries 2–4 human-readable reason strings; the UI shows the top reason inline and the full list in an expandable "detail" panel.
- **"Choisis pour moi" in Create**: same scoring engine, applied per empty row only; rows the user has manually set a day/time for are left untouched ("Ancrée").
- **Loading state**: Home shows a ~650ms skeleton every time it's navigated to (not just first load).
- **Validation**: Create's save button is disabled until at least one row has a non-empty title.

## State Management
Core data (owned by the app shell / a top-level store):
- `tasks`: array of `{ id, title, day (Lun..Dim), time ("HH:MM" or "—"), duration (minutes), category (École|Travail|Maison|Santé|Loisirs), members (array of member ids), recurring (bool — drives "Tâche" vs "Événement" vocabulary), flexible (bool — "Modifiable" if true, "Ancrée" if false/absent; only flexible items get replan proposals), priority (high|medium|low), deadline (day code or null), notes (string), synced (bool) }`.
- `members`: array of `{ id, name, initials, age (number) }` — age drives which bracket of the task-suggestion library is shown at creation time (see below).
- `habits`: array of selected onboarding habit strings (currently informational; not yet fed into scoring — a natural next step is to weight scoring by declared habits).
- `constraints`: `{ sleepStart, sleepEnd, lunchStart, lunchEnd, dndStart, dndEnd }` (all "HH:MM" strings), edited at onboarding step 4 and shown read-only in Profile.
- `notifications`: array of `{ id, title, time, unread, group: 'today'|'week' }`.
- `calendarConnected`: `null | 'google' | 'apple' | 'outlook'`, `calendarEmail`.
- `sharing`: `shareLink` (string) + `sharedWith`: array of `{ name, role }`.
- Per-screen ephemeral UI state (selected day/filter/search query, create-form row drafts, replan accept/ignore/expand state, share-invite input) — fine to keep local to each screen in the real implementation.

Age-bracket task-suggestion library (`AGE_TASKS`), used only to power the tappable suggestion chips in Create — port the content, not necessarily the exact data shape:
- `< 6 ans`: change de couche, biberon/repas adapté, sieste, bain, dépose/récupération crèche ou nounou, histoire du soir, jeux libres/éveil, rendez-vous pédiatre/vaccins, brossage des dents, promenade/sortie au parc, apprentissage de la propreté.
- `6–9 ans`: préparer le cartable, faire les devoirs, lecture du soir, brossage de dents matin/soir, douche/bain, ranger sa chambre, activité extrascolaire, coucher à heure fixe, temps d'écran limité.
- `10–12 ans`: (6–9 list minus cartable) + révisions, club sportif, sortie entre amis, aide ménagère (vaisselle, poubelles).
- `13–17 ans`: devoirs/révisions, cours particuliers, club sportif, sortie entre amis, aide ménagère, rendez-vous orthodontiste, leçons de conduite, petit boulot/job d'été.
- `65 ans et +`: prise de médicaments, rendez-vous médicaux réguliers, courses (avec aide), promenade/activité physique douce, visite famille/petits-enfants, activités sociales, aide à domicile, démarches administratives.
- Transversal (any age): repas principaux, hygiène quotidienne, sommeil, anniversaire/événement familial, activité religieuse ou spirituelle (only shown if member age ≥ 12).

## Design Tokens
Built on the bound **Nocturne** design system (dark, compact, Inter, 8px-radius family), then re-skinned per a later request toward a "tech / data-grid" direction:
- **Ground**: `#121316` (near-neutral graphite, intentionally de-blued from the base system's `#161826`).
- **Surface** (cards/inputs): `#1c1e22`.
- **Accent** (replaces the base system's violet everywhere via token override): `#22d3ee` (cyan). Tonal steps used: 100 `#e6fbff`, 300 `#7ee6f5`, 800 `#0a5568`, 900 `#062f3d`.
- **Text**: `#e9e9ed` primary; neutral ramp for muted text/borders (system's existing 100–900 neutral ramp, unchanged).
- **Type**: Inter (`--font-heading` / `--font-body`, heading weight 500). A monospace stack (`ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace`) is used specifically for times, durations, day numbers, and the replan slot badge — not for body copy.
- **Radius**: sharpened from the base system — small 3px, medium 6px, large 10px (base system used 4/8/14).
- **Chips**: 4px radius rectangles (not pills) everywhere — day/category/priority/duration/deadline/filter chips.
- **Cards**: every `.card` gets a small cyan "reticle" accent — a 9×9px corner bracket (1.5px border, ~65% opacity) top-left and bottom-right.
- **Background texture**: Home and Replan screens only get a faint cyan grid (1px lines every 22px, ~6% opacity) behind their content.
- **Buttons/tags/inputs**: unchanged structurally from the base system (`.btn-primary/-secondary/-ghost/-icon/-block`, `.tag-outline/-neutral/-accent`, `.input`, `.field`, `.seg`/`.seg-opt`) — only the color tokens feeding them changed.
- **Spacing**: base system's compact scale (`--space-1` 2.8px … `--space-8` 22.4px) — unchanged.

## Assets
No bitmap/vector image assets — all iconography is inline line-style SVG (24×24 viewBox, `stroke="currentColor"`, 1.8–2px stroke, round caps/joins) approximating a Phosphor-style icon set: home, search, plus, bell, user, chevron-left/right, pencil, trash, calendar, clock, repeat/shuffle, check, x. Avatars are colored initials circles, not photos.

## Files
- `Rythmo App.dc.html` — root: app-wide state, iOS/Android device-frame toggle (prototyping aid only, not a real requirement), passes everything down as props.
- `Rythmo Screens.dc.html` — all screens/UI and per-screen logic described above.
- `nocturne-styles.css` — the base design-system stylesheet the prototype builds on (colors/type/spacing/components before the cyan/graphite/sharp-radius overrides described under Design Tokens, which live inline in `Rythmo Screens.dc.html`'s own `<style>` block).
