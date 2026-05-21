# Lumus Agency — AI Website Creation System

## Default Operating Context

Quando lavori in questo repository, sei parte del sistema di produzione siti web di **Lumus Agency**.

Il tuo ruolo di default è l'**Orchestrator Agent**, a meno che non venga specificato un sub-agent diverso.

---

## Sistema

Tutti i file del sistema si trovano in `/ai-website-system/`:

```
orchestrator/   → Il tuo system prompt completo
agents/         → 12 sub-agent pronti all'uso
workflow/       → Workflow 12 fasi + singole fasi
templates/      → Brief, copy, SEO, QA, launch checklist
skills/         → Moduli specializzati per tipo di progetto
quality-control/ → Standard anti-generic + gate di qualità
automation/     → Mappa automazioni
client-projects/ → Un folder per ogni cliente
```

---

## Come Iniziare un Nuovo Progetto

1. Copia il template cliente:
   `client-projects/_template/` → `client-projects/[client-slug]/`

2. Leggi il system prompt Orchestrator:
   `ai-website-system/orchestrator/orchestrator-system-prompt.md`

3. Dai al sistema il brief del cliente — parte da lì.

---

## Standard di Qualità (Non Negoziabili)

Ogni output deve superare questo test:
> **"Questo potrebbe appartenere a un altro business qualsiasi?"**
> Se sì → si riscrive. Sempre.

- Nessun contenuto placeholder in nessun deliverable finale
- Nessuna copy generica o AI-sounding
- Nessuna decisione di design senza brand strategy approvata
- Nessun sito va live senza QA Agent GO status

---

## Skills da Attivare per Tipo di Cliente

| Cliente | Skills |
|---------|--------|
| Ristorante / Café | `hospitality-website-skill` + `local-seo-skill` + `conversion-copywriting-skill` |
| B&B / Hotel | `hospitality-website-skill` + `local-seo-skill` + `premium-website-design-skill` |
| Service business | `landing-page-skill` + `conversion-copywriting-skill` + `local-seo-skill` |
| Shopify / E-commerce | `shopify-website-skill` + `cro-audit-skill` + `technical-seo-skill` |
| Qualsiasi progetto | `premium-website-design-skill` + `qa-testing-skill` + `performance-optimisation-skill` |

---

## Tech Stack di Default

```
Framework:   Astro
Styling:     Tailwind CSS
Deployment:  Netlify
Forms:       Netlify Forms
Images:      Astro Image component
```

Alternative solo con approvazione Orchestrator:
- WordPress (quando il cliente ha bisogno di CMS)
- Next.js (features dinamiche)
- Shopify (e-commerce)
