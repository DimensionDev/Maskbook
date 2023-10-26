import type { Plugin } from '@masknet/plugin-infra'
import { usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { useMemo } from 'react'
import { z } from 'zod'
import { base } from '../base.js'
import { NextIdPage } from '../components/NextIdPage.js'
import { PLUGIN_ID } from '../constants.js'
import { VerificationPayload } from './VerificationPayload.js'

function createSchema() {
    return z.object({
        type: z.literal('tuple'),
        items: z.tuple([
            z.object({
                type: z.literal('text'),
                content: z.string(),
            }),
            z.any(),
        ]),
    })
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    PostInspector() {
        const schema = useMemo(createSchema, [])
        const raw = usePostInfoDetails.rawMessage()
        const result = schema.safeParse(raw)

        const content = result.success
            ? result.data.items.find((x) => {
                  return (
                      x.type === 'text' &&
                      x.content.match(/^🎭 {2}Verify {2}@.*? {2}with {2}@NextDotID .\nSig: .*\nMisc: /)
                  )
              })?.content
            : null

        usePluginWrapper(!!content)

        return content ? <VerificationPayload payload={content} /> : null
    },
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'Wallets',
            priority: 10,
            UI: {
                TabContent: ({ identity }) => <NextIdPage />,
            },
        },
    ],
}

export default site
