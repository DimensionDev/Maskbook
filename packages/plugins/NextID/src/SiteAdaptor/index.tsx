import type { Plugin } from '@masknet/plugin-infra'
import { usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
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
    PostInspector: function VerificationPayloadInspector() {
        const raw = usePostInfoDetails.rawMessage()
        const author = usePostInfoDetails.author()
        const payload = useMemo(() => {
            const schema = createSchema()
            const result = schema.safeParse(raw)

            if (!result.success) return null
            const PAYLOAD_RE = /^🎭 {2}Verify {2}@.*? {2}with {2}@NextDotID .\nSig: .*\nMisc: /
            return result.data.items.find((x) => x.type === 'text' && x.content.match(PAYLOAD_RE))?.content
        }, [raw])

        const enabled = !!payload && !!author?.userId
        const { data: pubkey } = useQuery({
            enabled,
            queryKey: ['next-id', 'restore-pubkey', author?.userId, payload],
            queryFn: () => NextIDProof.restorePubkey(payload, NextIDPlatform.Twitter, author!.userId),
        })

        const available = enabled && !!pubkey
        usePluginWrapper(available)

        return available ? <VerificationPayload pubkey={pubkey} /> : null
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
