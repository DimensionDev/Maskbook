import { useMemo } from 'react'
import { Trans } from 'react-i18next'
import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { base } from '../base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURL } from '@masknet/shared-base'
import { Icon } from '@masknet/icons'
import { FurucomboView } from '../UI/FurucomboView'

const matchLink = /^https:\/\/furucombo.app\/invest\/(pool|farm)\/(137|1)\/(0x\w+)/
const isFurucomboLink = (link: string): boolean => matchLink.test(link)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isFurucomboLink)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const link = usePostInfoDetails.mentionedLinks().find(isFurucomboLink)
        if (!link) return null
        return <Renderer url={link} />
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icon type="furucombo" size={36} />
            const name = <Trans i18nKey="plugin_furucombo_dapp_name" />
            return {
                ApplicationEntryID: base.ID,
                marketListSortingPriority: 18,
                icon,
                category: 'dapp',
                name,
                description: <Trans i18nKey="plugin_furucombo_dapp_description" />,
            }
        })(),
    ],
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [, category, chainId, address] = props.url.match(matchLink) ?? []
    usePluginWrapper(true)
    return <FurucomboView category={category} address={address} chainId={Number.parseInt(chainId, 10)} />
}

export default sns
