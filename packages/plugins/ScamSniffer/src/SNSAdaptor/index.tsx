/* eslint @dimensiondev/unicode/specific-set: ["error", { "only": "code" }] */
import { base } from '../base'
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
        const postDetail = {
            id: id ? id.postID : undefined,
            nickname,
            userId: author?.userId,
            links,
            content: message.some ? message.val : null,
        }
        const [scamProject, setScamProject] = useState<ScamResult | null>(null)
        useAsync(async () => {
            const scamProject = await PluginScamRPC.detectScam(postDetail)
            if (scamProject) {
                setScamProject(scamProject)
            }
        }, [])
        return scamProject ? <Renderer project={scamProject} /> : null
    },
}

export default sns
