import { Icons } from '@masknet/icons'
import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { parseURLs } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { useEffect, useMemo, type JSX } from 'react'
import { base } from '../base.js'
import { PLUGIN_DESCRIPTION, PLUGIN_NAME } from '../constants.js'
import { parseEFPProfileLink } from '../helpers/url.js'
import { ProfileCard } from './ProfileCard.js'

function Renderer({ url }: { url: string }) {
    const profileLink = useMemo(() => parseEFPProfileLink(url), [url])
    const rootNode = usePostInfoDetails.rootNode()
    usePluginWrapper(!!profileLink, { name: PLUGIN_NAME })
    useHideNativeTwitterCard(rootNode, !!profileLink)

    if (!profileLink) return null
    return <ProfileCard profileLink={profileLink} />
}

function useHideNativeTwitterCard(rootNode: HTMLElement | null, enabled: boolean) {
    useEffect(() => {
        if (!rootNode || !enabled) return

        const tweet = rootNode.closest<HTMLElement>('[data-testid="tweet"]') ?? rootNode.closest('article')
        if (!tweet) return

        const hide = () => {
            for (const card of tweet.querySelectorAll<HTMLElement>('[data-testid="card.wrapper"]')) {
                if (card === rootNode || card.style.display === 'none') continue
                if (!isEFPCard(card)) continue
                card.style.display = 'none'
                card.setAttribute('aria-hidden', 'true')
            }
        }

        hide()
        const observer = new MutationObserver(hide)
        observer.observe(tweet, { childList: true, subtree: true })
        return () => observer.disconnect()
    }, [rootNode, enabled])
}

function isEFPCard(card: HTMLElement) {
    if (card.querySelector('a[href*="efp.app"], a[href*="ethfollow.xyz"]')) return true
    const text = card.textContent?.toLowerCase() ?? ''
    return text.includes('efp.app') || text.includes('ethfollow.xyz')
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    DecryptedInspector(props): JSX.Element | null {
        const link = useMemo(() => {
            const text = extractTextFromTypedMessage(props.message)
            if (text.isNone()) return null
            return parseURLs(text.value, false).find((x) => parseEFPProfileLink(x))
        }, [props.message])

        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector(): JSX.Element | null {
        const links = usePostInfoDetails.mentionedLinks()
        const link = links.find((x) => parseEFPProfileLink(x))

        if (!link) return null
        return <Renderer url={link} />
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            marketListSortingPriority: 18,
            description: PLUGIN_DESCRIPTION,
            name: PLUGIN_NAME,
            icon: <Icons.Web3Profile size={36} />,
            tutorialLink: 'https://docs.efp.app/intro',
        },
    ],
    wrapperProps: {
        icon: <Icons.Web3Profile size={24} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(255, 224, 103, 0.2) 0%, rgba(211, 234, 244, 0.2) 100%), #FFFFFF',
    },
}

export default site
