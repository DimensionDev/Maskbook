/* eslint @dimensiondev/unicode/specific-set: ["error", { "only": "code" }] */
import { base } from '../base'
import { ScamSnifferIcon } from '@masknet/icons'
import { EnhanceableSite } from '@masknet/shared-base'
import { PLUGIN_DESCRIPTION, PLUGIN_NAME } from '../constants'
import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import type { ScamResult } from '@scamsniffer/detector'
import ScamAlert from './ScamAlert'
import { PluginScamRPC } from '../messages'
import { useAsync } from 'react-use'
import { useState } from 'react'

function Renderer(props: React.PropsWithChildren<{ project: ScamResult }>) {
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
            links,
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
            const icon = <ScamSnifferIcon />
            return {
                ApplicationEntryID: base.ID,
                marketListSortingPriority: 19,
                icon,
                category: 'dapp',
                description: {
                    i18nKey: '__plugin_description',
                    fallback: PLUGIN_DESCRIPTION,
                },
                name: { i18nKey: '__plugin_name', fallback: PLUGIN_NAME },
                tutorialLink: 'https://scamsniffer.io/?utm_source=mask-setting',
            }
        })(),
    ],
}

export default sns
