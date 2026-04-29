import { Icons } from '@masknet/icons'
import {
    type Plugin,
    PostInfoContext,
    usePluginWrapper,
    usePostInfoDetails,
} from '@masknet/plugin-infra/content-script'
import { parseURLs } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { useContext, useEffect, useMemo, type JSX } from 'react'
import { base } from '../base.js'
import { PLUGIN_DESCRIPTION, PLUGIN_NAME } from '../constants.js'
import { parseEFPProfileLink } from '../helpers/url.js'
import { ProfileCard } from './ProfileCard.js'

function Renderer({ url }: { url: string }) {
    const profileLink = useMemo(() => parseEFPProfileLink(url), [url])
    // Read rootNode/isFocusing through the context directly. The usePostInfoDetails proxy
    // also works, but trips react-compiler's hook-as-value rule at the call site for fields
    // (like rootNode) that the proxy returns as plain values rather than via a real hook.
    const postInfo = useContext(PostInfoContext)
    const rootNode = postInfo?.rootNode ?? null
    const isFocusing = postInfo?.isFocusing ?? false
    usePluginWrapper(!!profileLink, { name: PLUGIN_NAME })
    useHideNativeTwitterCard(rootNode, !!profileLink, isFocusing)

    if (!profileLink) return null
    return <ProfileCard profileLink={profileLink} />
}

function useHideNativeTwitterCard(rootNode: HTMLElement | null, enabled: boolean, isFocusing: boolean) {
    useEffect(() => {
        if (!rootNode || !enabled) return

        const article = rootNode.closest<HTMLElement>('article')
        // Timeline: scope to the article so we don't hide cards in sibling tweets whose Twitter
        // preview happens to mention efp.app/ethfollow.xyz in its title or description. Detail
        // view: the post's card can live in a sibling subtree of the article (per Twitter's
        // postsContentSelector), so widen one level.
        const searchRoot = isFocusing ? article?.parentElement : article
        if (!searchRoot) return

        const hide = () => {
            for (const card of searchRoot.querySelectorAll<HTMLElement>('[data-testid="card.wrapper"]')) {
                if (!isEFPCard(card)) continue
                const container = getCardContainer(card)
                // For link-only tweets the rootNode IS the card.wrapper, and our React tree mounts
                // in rootElement.afterShadow — a sibling of the card. Hiding the card itself is
                // fine, but we must not hide any ancestor of rootNode or we'd take our own
                // injection down with it.
                const target = container.contains(rootNode) ? card : container
                if (target.style.display === 'none') continue
                target.style.display = 'none'
                target.setAttribute('aria-hidden', 'true')
            }
        }

        hide()
        const observer = new MutationObserver(hide)
        observer.observe(searchRoot, { childList: true, subtree: true })
        return () => observer.disconnect()
    }, [rootNode, enabled, isFocusing])
}

// Twitter renders the visible card as a parent that's `aria-labelledby` the card.wrapper id and
// also holds the "From <site>" footer as a sibling of the wrapper. Hide the parent so the footer
// goes away with the card; fall back to the wrapper when the structure doesn't match.
function getCardContainer(card: HTMLElement): HTMLElement {
    const parent = card.parentElement
    if (!parent || !card.id) return card
    const labelledBy = parent.getAttribute('aria-labelledby')
    if (labelledBy?.split(/\s+/u).includes(card.id)) return parent
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
