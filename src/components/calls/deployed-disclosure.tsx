import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DISCLOSURE_VERSION, getDisclosure } from '@/lib/agent/disclosure'
import type { LanguageCode } from '@/lib/db/enums'

/**
 * The disclosure currently in force, shown to the restaurant.
 *
 * compliance/12_AI_ACT_ARTICLE_50_CHECKLIST.md requires that "restaurant
 * dashboard displays the currently deployed disclosure script/version". The
 * point is not decoration: the restaurant is the controller, and it has to be
 * able to see — and sign off — the exact words its callers hear, without asking
 * an engineer.
 *
 * The text is rendered from the same module the prompt builder uses, so it
 * cannot drift from what is actually spoken.
 */
export function DeployedDisclosure({
  locationName,
  languages,
  recordingEnabled,
}: {
  locationName: string
  languages: readonly LanguageCode[]
  recordingEnabled: boolean
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <CardTitle>What callers hear first</CardTitle>
        <Badge tone="neutral">Version {DISCLOSURE_VERSION}</Badge>
        <Badge tone={recordingEnabled ? 'danger' : 'success'}>
          {recordingEnabled ? 'Audio recording ON' : 'No audio recorded'}
        </Badge>
      </div>

      <dl className="mt-3 space-y-3">
        {languages.map((language) => {
          const script = getDisclosure(language, { locationName, recordingEnabled })
          return (
            <div key={language}>
              <dt className="text-ink-500 dark:text-ink-400 text-xs tracking-wide uppercase">
                {language === 'it' ? 'Italiano' : 'English'}
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed">“{script.full}”</dd>
            </div>
          )
        })}
      </dl>

      <p className="text-ink-500 dark:text-ink-400 mt-4 text-xs">
        Wording is an operational draft. It needs written approval from the restaurant and a
        solicitor before a caller outside the team hears it.
      </p>
    </Card>
  )
}
