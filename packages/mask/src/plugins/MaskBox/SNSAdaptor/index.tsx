import { useMemo } from 'react'
import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { base } from '../base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { Trans } from 'react-i18next'
import { parseURL } from '@masknet/shared-base'
import { PreviewCard } from './components/PreviewCard'
import { Context } from '../hooks/useContext'
import { ApplicationEntry } from '@masknet/shared'
import { openWindow } from '@masknet/shared-base-ui'
import { Icon } from '@masknet/icons'
import { RootContext } from '../contexts'
import type { ChainId } from '@masknet/web3-shared-evm'

const isMaskBox = (x: string) => x.startsWith('https://box-beta.mask.io') || x.startsWith('https://box.mask.io')

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isMaskBox)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = links.find(isMaskBox)
        if (!link) return null
        return <Renderer url={link} />
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icon type="maskBox" size={36} />
            const name = <Trans i18nKey="plugin_mask_box_name" />
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
                appBoardSortingDefaultPriority: 7,
                marketListSortingPriority: 4,
                icon,
                tutorialLink: 'https://realmasknetwork.notion.site/d0941687649a4ef7a38d71f23ecbe4da',
                description: <Trans i18nKey="plugin_mask_box_description" />,
                category: 'dapp',
                iconFilterColor,
                name,
            }
        })(),
    ],
}

export default sns

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [, matchedChainId] = props.url.match(/chain=(\d+)/i) ?? []
    const [, boxId] = props.url.match(/box=(\d+)/i) ?? []
    const [, hashRoot] = props.url.match(/rootHash=([\dA-Za-z]+)/) ?? []

    const shouldNotRender = !matchedChainId || !boxId
    usePluginWrapper(!shouldNotRender)
    if (shouldNotRender) return null

    return (
        <RootContext chainId={Number.parseInt(matchedChainId, 10) as ChainId.Mainnet}>
            <Context.Provider initialState={{ boxId, hashRoot }}>
                <PreviewCard />
            </Context.Provider>
        </RootContext>
    )
}
