import { Icons } from '@masknet/icons'
import { Trans } from '@lingui/react/macro'
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
import { EFP_HOSTS, PLUGIN_NAME } from '../constants.js'
import { parseEFPProfileLink, type EFPProfileLink } from '../helpers/url.js'
import { ProfileCard } from './ProfileCard.js'

function Renderer({ profileLink }: { profileLink: EFPProfileLink }) {
    // Read rootNode/isFocusing through the context directly. The usePostInfoDetails proxy
    // also works, but trips react-compiler's hook-as-value rule at the call site for fields
    // (like rootNode) that the proxy returns as plain values rather than via a real hook.
    const postInfo = useContext(PostInfoContext)
    const rootNode = postInfo?.rootNode ?? null
    const isFocusing = postInfo?.isFocusing ?? false
    usePluginWrapper(true, { name: PLUGIN_NAME })
    useHideNativeTwitterCard(rootNode, isFocusing)

    return <ProfileCard profileLink={profileLink} />
}

function useHideNativeTwitterCard(rootNode: HTMLElement | null, isFocusing: boolean) {
    useEffect(() => {
        if (!rootNode) return

        const article = rootNode.closest<HTMLElement>('article')
        // Timeline: scope to the article so we don't hide cards in sibling tweets whose Twitter
        // preview happens to mention efp.app/ethfollow.xyz in its title or description. Detail
        // view: the post's card can live in a sibling subtree of the article (per Twitter's
        // postsContentSelector), so widen one level.
        const searchRoot = isFocusing ? article?.parentElement : article
        if (!searchRoot) return

        // Track every element we modify so the cleanup can restore the Twitter card if the plugin
        // unmounts (navigation, post leaves the viewport, plugin disabled). Without this, hidden
        // cards stay hidden forever even after the React tree is gone.
        const modified = new Map<HTMLElement, { display: string; ariaHidden: string | null }>()

        const hide = () => {
            for (const card of searchRoot.querySelectorAll<HTMLElement>('[data-testid="card.wrapper"]')) {
                if (!isEFPCard(card)) continue
                const container = getCardContainer(card)
                // For link-only tweets the rootNode IS the card.wrapper, and our React tree mounts
                // in rootElement.afterShadow — a sibling of the card. Hiding the card itself is
                // fine, but we must not hide any ancestor of rootNode or we'd take our own
                // injection down with it.
                const target = container.contains(rootNode) ? card : container
                if (modified.has(target)) continue
                modified.set(target, {
                    display: target.style.display,
                    ariaHidden: target.getAttribute('aria-hidden'),
                })
                target.style.display = 'none'
                target.setAttribute('aria-hidden', 'true')
            }
        }

        hide()
        const observer = new MutationObserver(hide)
        observer.observe(searchRoot, { childList: true, subtree: true })
        return () => {
            observer.disconnect()
            for (const [target, prev] of modified) {
                target.style.display = prev.display
                if (prev.ariaHidden === null) target.removeAttribute('aria-hidden')
                else target.setAttribute('aria-hidden', prev.ariaHidden)
            }
            modified.clear()
        }
    }, [rootNode, isFocusing])
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

// Twitter wraps external links in t.co redirects, so the card anchor's href is usually opaque.
// We identify an EFP card from two precise signals, never a substring scan (which would
// false-positive on cards whose title/description merely mentions efp.app, or on a look-alike
// host that contains it as a substring):
//   1. The href or visible text already is a valid EFP URL (direct, non-t.co links).
//   2. The card's source host — the first whitespace token of the media anchor's aria-label,
//      e.g. "efp.app vitalik.eth" — exactly equals one of the EFP hosts. That token is Twitter's
//      declared card domain, so exact equality is safe.
function isEFPCard(card: HTMLElement) {
    for (const anchor of card.querySelectorAll<HTMLAnchorElement>('a[href]')) {
        if (parseEFPProfileLink(anchor.href)) return true
        const text = anchor.textContent?.trim()
        if (text && parseEFPProfileLink(text)) return true
        const sourceHost = anchor.getAttribute('aria-label')?.trim().split(/\s+/u)[0]?.toLowerCase()
        if (sourceHost && (EFP_HOSTS as readonly string[]).includes(sourceHost)) return true
    }
    return false
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    DecryptedInspector(props): JSX.Element | null {
        const profileLink = useMemo(() => {
            const text = extractTextFromTypedMessage(props.message)
            if (text.isNone()) return null
            for (const url of parseURLs(text.value, false)) {
                const link = parseEFPProfileLink(url)
                if (link) return link
            }
            return null
        }, [props.message])

        if (!profileLink) return null
        return <Renderer profileLink={profileLink} />
    },
    PostInspector(): JSX.Element | null {
        const message = usePostInfoDetails.rawMessage()
        const mentionedLinks = usePostInfoDetails.mentionedLinks()
        const profileLink = useMemo(() => {
            // mentionedLinks carries the links Maskbook resolves from t.co redirects. That is how
            // an EFP URL surfaces when X renders it as a link-preview card (the tweet text has no
            // URL) or truncates a long address URL with an ellipsis. parseURLs(rawMessage, false)
            // additionally catches protocol-less links typed directly in the body (e.g.
            // efp.app/vitalik.eth) without waiting on that async resolution.
            const text = extractTextFromTypedMessage(message)
            const candidates =
                text.isNone() ? mentionedLinks : [...mentionedLinks, ...parseURLs(text.value, false)]
            for (const url of candidates) {
                const link = parseEFPProfileLink(url)
                if (link) return link
            }
            return null
        }, [message, mentionedLinks])

        if (!profileLink) return null
        return <Renderer profileLink={profileLink} />
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            marketListSortingPriority: 18,
            description: <Trans>A native Ethereum protocol for following and tagging Ethereum accounts.</Trans>,
            name: <Trans>Ethereum Follow Protocol</Trans>,
            icon: <Icons.EFP size={36} />,
            tutorialLink: 'https://docs.efp.app/intro',
        },
    ],
    wrapperProps: {
        icon: <Icons.EFP size={24} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(255, 224, 103, 0.2) 0%, rgba(211, 234, 244, 0.2) 100%), #FFFFFF',
    },
}

export default site
