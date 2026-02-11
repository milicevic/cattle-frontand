# Kako koristiti prevode u Frontend komponentama

## Setup

Prevodi se automatski učitavaju kada se aplikacija pokrene (preko `TranslationProvider` u `app/layout.tsx`).

## Kako koristiti u komponenti

### 1. Importuj hook

```tsx
import { useTranslations } from "@/hooks/useTranslations"
```

### 2. Koristi hook u komponenti

```tsx
export function MyComponent() {
  const { t } = useTranslations()
  
  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <p>{t("dashboard.title")}</p>
    </div>
  )
}
```

## Primer: NotificationsWidget

```tsx
"use client"

import { useTranslations } from "@/hooks/useTranslations"

export function NotificationsWidget() {
  const { t } = useTranslations()
  
  return (
    <Card>
      <CardTitle>{t("notifications.title")}</CardTitle>
      <CardDescription>{t("notifications.important_alerts")}</CardDescription>
    </Card>
  )
}
```

## Dostupni prevodi

### Common
- `t("common.welcome")` → "Dobrodošli" (SR) / "Welcome" (EN)
- `t("common.login")` → "Prijavite se" / "Login"
- `t("common.logout")` → "Odjavite se" / "Logout"
- `t("common.save")` → "Sačuvaj" / "Save"
- `t("common.cancel")` → "Otkaži" / "Cancel"
- `t("common.delete")` → "Obriši" / "Delete"
- `t("common.edit")` → "Izmeni" / "Edit"
- `t("common.add")` → "Dodaj" / "Add"

### Dashboard
- `t("dashboard.title")` → "Kontrolna tabla" / "Dashboard"
- `t("dashboard.farmer")` → "Kontrolna tabla farmera" / "Farmer Dashboard"
- `t("dashboard.vet")` → "Kontrolna tabla veterinara" / "Vet Dashboard"
- `t("dashboard.notifications")` → "Obaveštenja" / "Notifications"
- `t("dashboard.upcoming_calvings")` → "Predstojeći teljenja" / "Upcoming Calvings"
- `t("dashboard.animals")` → "Životinje" / "Animals"

### Animals
- `t("animals.title")` → "Životinje" / "Animals"
- `t("animals.add_animal")` → "Dodaj životinju" / "Add Animal"
- `t("animals.tag_number")` → "Broj oznake" / "Tag Number"
- `t("animals.species")` → "Vrsta" / "Species"
- `t("animals.type")` → "Tip" / "Type"
- `t("animals.cattle")` → "Goveda" / "Cattle"
- `t("animals.cow")` → "Krava" / "Cow"
- `t("animals.bull")` → "Bik" / "Bull"

### Notifications
- `t("notifications.title")` → "Obaveštenja" / "Notifications"
- `t("notifications.important_alerts")` → "Važna upozorenja i podsetnici" / "Important alerts and reminders"
- `t("notifications.calving_due_soon")` → "Teljenje uskoro" / "Calving Due Soon"
- `t("notifications.insemination_due")` → "Inseminacija potrebna" / "Insemination Due"

### Calvings
- `t("calvings.title")` → "Predstojeći teljenja" / "Upcoming Calvings"
- `t("calvings.expected_date")` → "Očekivani datum" / "Expected Date"
- `t("calvings.days_remaining")` → "Preostalo dana" / "Days Remaining"
- `t("calvings.record_calving")` → "Zabeleži teljenje" / "Record Calving"

### Farm
- `t("farm.title")` → "Informacije o farmi" / "Farm Information"
- `t("farm.name")` → "Naziv farme" / "Farm Name"
- `t("farm.location")` → "Lokacija" / "Location"
- `t("farm.state")` → "Država" / "State"

## Testiranje

### Postavi test country (Serbia):
```javascript
localStorage.setItem('test_country', 'RS')
location.reload()
```

### Proveri da li radi:
1. Otvori browser console
2. Proveri Network tab → `/api/translations` request
3. Response treba da sadrži `"locale": "sr"` i srpske prevode
4. Komponente će automatski koristiti srpske prevode

## Dodavanje novih prevoda

1. Dodaj u `cattle-backend/lang/sr.json`:
```json
{
  "my_section": {
    "my_key": "Moja vrednost"
  }
}
```

2. Koristi u komponenti:
```tsx
{t("my_section.my_key")} // → "Moja vrednost"
```

## Napomena

- Ako prevod ne postoji, vraća se ključ (npr. `"my_section.my_key"`)
- Prevodi se automatski učitavaju na app startup
- Možeš ručno osvežiti: `const { reload } = useTranslations(); reload()`
