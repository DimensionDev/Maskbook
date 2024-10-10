import { useMemo } from 'react'
import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { Icons } from '@masknet/icons'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURLs } from '@masknet/shared-base'
import { ApplicationEntry } from '@masknet/shared'
import { openWindow } from '@masknet/shared-base-ui'
import { base } from '../base.js'
import { PreviewCard } from './components/PreviewCard.js'
import { Context } from '../hooks/useContext.js'
import { Trans } from '@lingui/macro'

const isMaskBox = (x: string) => x.startsWith('https://box-beta.mask.io') || x.startsWith('https://box.mask.io')

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    DecryptedInspector(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.isNone()) return null
            return parseURLs(x.value).find(isMaskBox)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = links.find(isMaskBox)
        if (!link) return null
        return <Renderer url={link} />
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.MaskBox />
            const name = <Trans>MaskBox</Trans>
            const iconFilterColor = 'rgba(0, 87, 255, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    return (
                        <ApplicationEntry
                            title={name}
                            disabled={disabled}
                            iconFilterColor={iconFilterColor}
                            icon={icon}
                            onClick={() => openWindow('https://box.mask.io/#/')}
                        />
                    )
                },
                appBoardSortingDefaultPriority: 14,
                marketListSortingPriority: 14,
                icon,
                tutorialLink: 'https://realmasknetwork.notion.site/d0941687649a4ef7a38d71f23ecbe4da',
                description: (
                    <Trans>Professional multi-chain decentralized platform for launching NFT blind boxes.</Trans>
                ),
                category: 'dapp',
                iconFilterColor,
                name,
            }
        })(),
    ],
}

export default site

function Renderer(
    props: React.PropsWithChildren<{
        url: string
    }>,
) {
    const [, matchedChainId] = props.url.match(/chain=(\d+)/i) ?? []
    const [, boxId] = props.url.match(/box=(\d+)/i) ?? []
    const [, hashRoot] = props.url.match(/rootHash=([\dA-Za-z]+)/) ?? []

    const shouldNotRender = !matchedChainId || !boxId
    usePluginWrapper(!shouldNotRender)
    if (shouldNotRender) return null

    return (
        <Context initialState={{ boxId, hashRoot }}>
            <PreviewCard />
        </Context>
    )
}
