# voice_qa — how the two registries relate

There are two files here and they measure different things. Confusing them is how
a project ends up believing it has tested something it has not.

| File | Owner | What it is | Rows |
|---|---|---|---|
| `VOICE_TEST_CASES.csv` | Founder's handoff package, restored verbatim 24 Aug 2026 | A **manual voice-QA script**: what a human dials, in which accent, at which noise level, and what must happen | 46 |
| `AUTOMATED_COVERAGE.csv` | Generated from the above | For each of those 46 scenarios, **what the code already proves** and what still needs a real call | 46 |
| `IRISH_ACCENT_AND_NOISE_TEST_PLAN.md` | Founder's handoff package | How to run the accent and noise session | — |

## Why the counts differed

The reconstructed registry written before the package arrived had **45** rows and
the original has **46**. They were never the same list, so the difference is not
a missing scenario:

- the original is organised by **caller utterance and speaking condition** —
  Galway quiet, Cork at +5 dB SNR, West of Ireland — and carries `priority` and
  `release_blocker`;
- the reconstruction was organised by **what a test file asserts**, and carried
  automation status and a test path.

One tracked what a human must hear. The other tracked what code proves. Both are
needed, so both are kept, and `AUTOMATED_COVERAGE.csv` is the join between them.

The reconstruction is preserved at
`docs/reconstructed-superseded/VOICE_TEST_CASES.reconstructed.csv` so the two can
be compared, but it is no longer authoritative.

## Coverage vocabulary

| Value | Meaning |
|---|---|
| `automated` | Fully proven by a test that runs in CI today. |
| `partial` | The mechanism is proven in code — the script exists, the data is gated, the rule is asserted — but whether the agent *says* the right thing needs a real call. |
| `live-only` | Cannot be proven without real audio: barge-in, accent, noise, mid-call language switching. |
| `deferred` | Belongs to a later milestone (reservations are Milestone 5). |

## Current position

46 scenarios · 33 release blockers.
7 fully automated · 28 mechanism-proven · 9 live-only · 2 deferred.

**No live call has been made.** Until one has, every `live-only` row stays
`not-run`, and a `partial` row is not evidence that the agent behaves correctly on
the telephone — only that it cannot behave incorrectly for the reason the code
controls.
