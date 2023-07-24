/* eslint @masknet/unicode-specific-set: ["error", { "only": "code" }] */
import { base } from '../base.js'
import { Icons } from '@masknet/icons'
import { EnhanceableSite } from '@masknet/shared-base'
import { PLUGIN_DESCRIPTION, PLUGIN_NAME } from '../constants.js'
import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import type { ScamResult } from '@scamsniffer/detector'
import ScamAlert from './ScamAlert.js'
import { PluginScamRPC } from '../messages.js'
import { useAsync } from 'react-use'
import { useState } from 'react'
import { Trans } from 'react-i18next'

function Renderer(
    props: React.PropsWithChildren<{
        project: ScamResult
    }>,
) {
    usePluginWrapper(true)
    return <ScamAlert result={props.project} />
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const author = usePostInfoDetails.author()
        const id = usePostInfoDetails.identifier()
        const nickname = usePostInfoDetails.nickname()
        const message = extractTextFromTypedMessage(usePostInfoDetails.rawMessage())
        const network = id?.identifier.network
        const isTwitter = network === EnhanceableSite.Twitter
        const postDetail = {
            id: id ? id.postID : undefined,
            nickname,
            userId: author?.userId,
            links: [...links],
            content: message.some ? message.val : null,
        }
        const [scamProject, setScamProject] = useState<ScamResult | null>(null)
        useAsync(async () => {
            if (!isTwitter) return
            const scamProject = await PluginScamRPC.detectScam(postDetail)
            if (scamProject) {
                setScamProject(scamProject)
            }
        }, [])

        return isTwitter && scamProject ? <Renderer project={scamProject} /> : null
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.ScamSniffer size={36} />
            return {
                ApplicationEntryID: base.ID,
                marketListSortingPriority: 19,
                icon,
                category: 'dapp',
                description: <Trans i18nKey="__plugin_description" defaults={PLUGIN_DESCRIPTION} ns={base.ID} />,
                name: <Trans i18nKey="__plugin_name" defaults={PLUGIN_NAME} ns={base.ID} />,
                tutorialLink: 'https://scamsniffer.io/?utm_source=mask-setting',
            }
        })(),
    ],
}

export default sns
