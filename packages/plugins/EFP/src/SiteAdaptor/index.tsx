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

        // Search from the article (or its parent in detail view, where the card sits in a sibling
        // subtree) so we cover both timeline and detail layouts.
        const article = rootNode.closest<HTMLElement>('article')
        const searchRoot = article?.parentElement ?? rootNode.ownerDocument.body
        if (!searchRoot) return

        const hide = () => {
            for (const card of searchRoot.querySelectorAll<HTMLElement>('[data-testid="card.wrapper"]')) {
                if (card === rootNode) continue
                if (!isEFPCard(card)) continue
                const container = getCardContainer(card)
                if (container.style.display === 'none') continue
                container.style.display = 'none'
                container.setAttribute('aria-hidden', 'true')
            }
        }

        hide()
        const observer = new MutationObserver(hide)
        observer.observe(searchRoot, { childList: true, subtree: true })
        return () => observer.disconnect()
    }, [rootNode, enabled])
}

// Twitter renders the visible card as a parent that's `aria-labelledby` the card.wrapper id and
// also holds the "From <site>" footer as a sibling of the wrapper. Hide the parent so the footer
// goes away with the card; fall back to the wrapper when the structure doesn't match.
function getCardContainer(card: HTMLElement): HTMLElement {
    const parent = card.parentElement
    if (!parent || !card.id) return card
    const labelledBy = parent.getAttribute('aria-labelledby')
    if (labelledBy && labelledBy.split(/\s+/).includes(card.id)) return parent
    return card
}

function isEFPCard(card: HTMLElement) {
    if (card.querySelector('a[href*="efp.app"], a[href*="ethfollow.xyz"]')) return true
    for (const el of card.querySelectorAll<HTMLElement>('[aria-label]')) {
        const label = el.getAttribute('aria-label')?.toLowerCase() ?? ''
        if (label.includes('efp.app') || label.includes('ethfollow.xyz')) return true
    }
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
