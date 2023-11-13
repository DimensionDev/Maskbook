import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { NextIDPlatform } from '@masknet/shared-base'
import { MaskLightTheme } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { ThemeProvider } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
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

        const rootElement = usePostInfoDetails.rootNode()
        useEffect(() => {
            if (!rootElement || !available) return

            const sigSpan = rootElement.querySelector<HTMLSpanElement>("[data-testid='tweetText'] > span:last-child")
            if (sigSpan) sigSpan.style.display = 'none'
        }, [rootElement, available])

        return available ?
                <ThemeProvider theme={MaskLightTheme}>
                    <VerificationPayload pubkey={pubkey} />
                </ThemeProvider>
            :   null
    },
    wrapperProps: {
        icon: <Icons.NextID size={24} style={{ boxShadow: '0px 6px 12px 0px rgba(7, 16, 27, 0.20)' }} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.80) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.20) 0%, rgba(249, 55, 55, 0.20) 100%), #FFF',
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
