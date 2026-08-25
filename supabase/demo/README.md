# supabase/demo — optional demonstration data

> **Sintesi in italiano**
> File SQL facoltativi per arricchire il ristorante dimostrativo. Si incollano
> nell'editor SQL di Supabase, dopo il seed. Non servono all'applicazione: servono
> a rendere una telefonata di prova realistica.

These are **not** migrations and **not** part of the seed. They are optional
loads for the fictional demonstration restaurant, applied by hand after
`supabase/seed.sql`, so a test call has enough material to feel like a real one.

| File | What it adds |
|---|---|
| `vindaro-extra.sql` | Kitchen last orders, booking policy, groups, gluten-free, children, corkage, service charge, transport and payment answers; seven more dishes with their allergen declarations. |

Everything here describes **Osteria Vindaro, which does not exist**. The allergen
declarations are invented, which is exactly why they are safe to experiment with.
For a real restaurant they must come from the kitchen and be approved by someone
who answers for them.

Re-running a file is harmless: every insert is guarded by `on conflict do nothing`.
