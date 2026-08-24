import { describe, expect, it } from 'vitest'
import {
  assessAllergenQuestion,
  detectSeverity,
  isSpeakableAsFact,
  mayAnswerAllergenFromDietaryAttribute,
  type AllergenFacts,
} from '@/lib/agent/safety'

const GNOCCHI: AllergenFacts = {
  menuItemId: '31100000-0000-4000-8000-000000000008',
  nameEn: 'Potato gnocchi with basil pesto',
  nameIt: 'Gnocchi al pesto di basilico',
  contains: [
    { code: 'nuts', nameEn: 'Nuts', nameIt: 'Frutta a guscio' },
    { code: 'milk', nameEn: 'Milk', nameIt: 'Latte' },
  ],
  mayContain: [],
  declaredFreeFrom: [],
  undeclared: [{ code: 'peanuts', nameEn: 'Peanuts', nameIt: 'Arachidi' }],
  crossContaminationNotes: 'Pesto is made in a blender also used for nut-based sauces.',
}

const POTATOES: AllergenFacts = {
  menuItemId: '31100000-0000-4000-8000-000000000014',
  nameEn: 'Rosemary potatoes',
  nameIt: 'Patate al rosmarino',
  contains: [],
  mayContain: [
    {
      code: 'cereals_gluten',
      nameEn: 'Cereals containing gluten',
      nameIt: 'Cereali contenenti glutine',
      crossContaminationNotes:
        'Finished in the shared fryer, which is also used for floured items.',
    },
  ],
  declaredFreeFrom: [],
  undeclared: [],
  crossContaminationNotes: null,
}

/** TECHNICAL_PRIVACY_REQUIREMENTS.md TPR-4. */
describe('severity detection', () => {
  it('recognises severity in English', () => {
    for (const phrase of [
      'I have a severe nut allergy',
      'my son is anaphylactic',
      'she carries an EpiPen',
      'it is life-threatening',
      'I am coeliac',
    ]) {
      expect(detectSeverity(phrase), phrase).toBe(true)
    }
  })

  it('recognises severity in Italian', () => {
    for (const phrase of [
      'ho un’allergia grave alle arachidi',
      'mia figlia è fortemente allergica',
      'rischio shock anafilattico',
    ]) {
      expect(detectSeverity(phrase), phrase).toBe(true)
    }
  })

  it('does not treat a plain preference as severe', () => {
    expect(detectSeverity('I do not really like nuts')).toBe(false)
    expect(detectSeverity('avete piatti vegani?')).toBe(false)
  })
})

describe('allergen answers', () => {
  it('escalates a severe allergy and states nothing about the dish', () => {
    const answer = assessAllergenQuestion({ allergenCode: 'nuts', severe: true }, GNOCCHI)
    expect(answer.verdict).toBe('escalate_severe_allergy')
    expect(answer.mustEscalate).toBe(true)
    expect(answer.escalationReason).toBe('severe_allergy')
    expect(answer.speakableFacts).toEqual([])
  })

  it('escalates a severe allergy even when the data would be reassuring', () => {
    const clean: AllergenFacts = { ...GNOCCHI, contains: [], undeclared: [] }
    const answer = assessAllergenQuestion({ allergenCode: 'nuts', severe: true }, clean)
    expect(answer.mustEscalate).toBe(true)
    expect(answer.speakableFacts).toEqual([])
  })

  it('states an approved contains declaration as fact', () => {
    const answer = assessAllergenQuestion({ allergenCode: 'nuts', severe: false }, GNOCCHI)
    expect(answer.verdict).toBe('contains')
    expect(answer.speakableFacts.join(' ')).toMatch(/contains Nuts/i)
    expect(isSpeakableAsFact(answer)).toBe(true)
  })

  it('reports a shared fryer as may-contain, never as absence', () => {
    const answer = assessAllergenQuestion(
      { allergenCode: 'cereals_gluten', severe: false },
      POTATOES,
    )
    expect(answer.verdict).toBe('may_contain')
    expect(answer.speakableFacts.join(' ')).toMatch(/may contain/i)
    expect(answer.speakableFacts.join(' ')).toMatch(/shared fryer/i)
    expect(isSpeakableAsFact(answer)).toBe(false)
  })

  it('answers an undeclared allergen with "not confirmed" and no reassurance', () => {
    const answer = assessAllergenQuestion({ allergenCode: 'peanuts', severe: false }, GNOCCHI)
    expect(answer.verdict).toBe('not_confirmed')
    expect(answer.speakableFacts).toEqual([])
    expect(isSpeakableAsFact(answer)).toBe(false)
  })

  it('never produces a free-from claim from missing data', () => {
    const answer = assessAllergenQuestion({ allergenCode: 'sesame', severe: false }, GNOCCHI)
    expect(answer.verdict).not.toBe('declared_free_from')
    expect(answer.speakableFacts.join(' ')).not.toMatch(/free from|does not contain|safe/i)
  })

  it('reports a declared free-from as the restaurant’s declaration, with its note', () => {
    const sorbet: AllergenFacts = {
      ...GNOCCHI,
      contains: [],
      declaredFreeFrom: [
        {
          code: 'milk',
          nameEn: 'Milk',
          nameIt: 'Latte',
          crossContaminationNotes:
            'Made in a dedicated sorbet machine. Serving utensils are shared.',
        },
      ],
    }
    const answer = assessAllergenQuestion({ allergenCode: 'milk', severe: false }, sorbet)
    expect(answer.verdict).toBe('declared_free_from')
    expect(answer.speakableFacts.join(' ')).toMatch(/the restaurant has declared/i)
    expect(answer.speakableFacts.join(' ')).toMatch(/utensils are shared/i)
    // A declaration is still not our assurance.
    expect(isSpeakableAsFact(answer)).toBe(false)
  })

  it('escalates when there is no approved record for the dish at all', () => {
    const answer = assessAllergenQuestion({ allergenCode: 'nuts', severe: false }, null)
    expect(answer.verdict).toBe('escalate_no_approved_data')
    expect(answer.escalationReason).toBe('outside_approved_information')
    expect(answer.speakableFacts).toEqual([])
  })

  it('carries the safety directive on every answer', () => {
    const answers = [
      assessAllergenQuestion({ allergenCode: 'nuts', severe: true }, GNOCCHI),
      assessAllergenQuestion({ allergenCode: 'nuts', severe: false }, GNOCCHI),
      assessAllergenQuestion({ allergenCode: 'peanuts', severe: false }, GNOCCHI),
      assessAllergenQuestion({ allergenCode: null, severe: false }, null),
    ]
    for (const answer of answers) {
      expect(answer.safetyDirective).toMatch(/Never state or imply that a dish is safe/i)
    }
  })

  it('never emits the word "safe" in a speakable fact', () => {
    const answers = [
      assessAllergenQuestion({ allergenCode: 'nuts', severe: false }, GNOCCHI),
      assessAllergenQuestion({ allergenCode: 'cereals_gluten', severe: false }, POTATOES),
      assessAllergenQuestion({ allergenCode: null, severe: false }, GNOCCHI),
    ]
    for (const answer of answers) {
      expect(answer.speakableFacts.join(' ')).not.toMatch(/\bsafe\b/i)
    }
  })

  it('answers in Italian when the call is in Italian', () => {
    const answer = assessAllergenQuestion({ allergenCode: 'nuts', severe: false }, GNOCCHI, 'it')
    expect(answer.speakableFacts.join(' ')).toMatch(/Frutta a guscio/)
  })

  it('refuses, structurally, to answer an allergen question from a dietary label', () => {
    expect(mayAnswerAllergenFromDietaryAttribute()).toBe(false)
  })
})
