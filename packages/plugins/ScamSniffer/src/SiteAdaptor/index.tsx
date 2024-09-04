/* eslint @masknet/unicode-specific-set: ["error", { "only": "code" }] */
import { Icons } from '@masknet/icons'
import { usePluginWrapper, usePostInfoDetails, type Plugin } from '@masknet/plugin-infra/content-script'
import { EnhanceableSite } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import type { ScamResult } from '@scamsniffer/detector'
import { useQueries, useQuery } from '@tanstack/react-query'
import { compact, first } from 'lodash-es'
import { useMemo } from 'react'
import urlcat from 'urlcat'
import { base } from '../base.js'
import { API_KEY, PLUGIN_DESCRIPTION, PLUGIN_NAME } from '../constants.js'
import { PluginScamRPC } from '../messages.js'
import ScamAlert from './ScamAlert.js'

function Renderer(
    props: React.PropsWithChildren<{
        project: ScamResult
    }>,
) {
    usePluginWrapper(true)
    return <ScamAlert result={props.project} />
}

interface CheckResult {
    url: string
    host: string | null
    status: 'PASSED' | 'BLOCKED'
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const author = usePostInfoDetails.author()
        const id = usePostInfoDetails.identifier()
        const nickname = usePostInfoDetails.nickname()
        const message = extractTextFromTypedMessage(usePostInfoDetails.rawMessage())
        const network = id?.identifier.network
        const isTwitter = network === EnhanceableSite.Twitter

        const content = message.isSome() ? message.value : null
        const postDetail = useMemo(
            () => ({
                id: id ? id.postID : undefined,
                nickname,
                userId: author?.userId,
                links,
                content,
            }),
            [id?.postID, author?.userId, nickname, links, content],
        )
        const { data: scamProject, isLoading } = useQuery({
            queryKey: ['scam-sniffer', 'check-post', id?.postID, nickname, author?.userId, links, content],
            enabled: isTwitter,
            queryFn: () => {
                return PluginScamRPC.detectScam(postDetail)
            },
        })

        const origins = links.map((link) => new URL(link).origin)
        const queries = useQueries({
            queries: origins.map((origin) => ({
                enabled: !scamProject && !isLoading,
                queryKey: ['scam-sniffer', 'check-url', origin],
                queryFn: async () => {
                    const url = urlcat('https://domain-api.scamsniffer.io/check', {
                        url: origin,
                        api_key: API_KEY,
                    })
                    const res = await fetchJSON<CheckResult>(url)
                    return res
                },
            })),
        })
        const firstHit = first(
            compact(queries.filter((x) => x.isSuccess && x.data.status === 'BLOCKED').map((x) => x.data)),
        )
        const fallbackScamProject = useMemo(() => {
            if (!firstHit) return null
            return {
                slug: '',
                name: firstHit.host!,
                twitterUsername: author?.userId || nickname,
                externalUrl: firstHit.url,
                post: postDetail,
                matchType: 'sim',
            } satisfies ScamResult
        }, [firstHit?.host, firstHit?.url, author?.userId, nickname])

        if (!isTwitter) return null
        const project = scamProject || fallbackScamProject
        if (!project) return null

        return <Renderer project={project} />
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.ScamSniffer size={36} />
            return {
                ApplicationEntryID: base.ID,
                marketListSortingPriority: 19,
                icon,
                category: 'dapp',
                description: PLUGIN_DESCRIPTION,
                name: PLUGIN_NAME,
                tutorialLink: 'https://scamsniffer.io/?utm_source=mask-setting',
            }
        })(),
    ],
}

export default site
