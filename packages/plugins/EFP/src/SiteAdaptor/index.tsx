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
    usePluginWrapper(!!profileLink, { name: PLUGIN_NAME })

    if (!profileLink) return null
    return <ProfileCard profileLink={profileLink} />
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
    GlobalInjection(): JSX.Element | null {
        return <NativeTwitterCardCleaner />
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

function NativeTwitterCardCleaner(): null {
    useEffect(() => {
        if (!isTwitterHost()) return
        const root = document.body
        if (!root) return

        const hiddenCards = new Map<HTMLElement, { ariaHidden: string | null; display: string; visibility: string }>()
        let scheduled = false

        const hideCards = () => {
            scheduled = false
            for (const card of findNativeEFPCards(root)) {
                if (!hiddenCards.has(card)) {
                    hiddenCards.set(card, {
                        ariaHidden: card.getAttribute('aria-hidden'),
                        display: card.style.display,
                        visibility: card.style.visibility,
                    })
                }
                card.style.display = 'none'
                card.style.visibility = 'hidden'
                card.setAttribute('aria-hidden', 'true')
            }
        }
        const scheduleHideCards = () => {
            if (scheduled) return
            scheduled = true
            requestAnimationFrame(hideCards)
        }

        hideCards()
        const observer = new MutationObserver(scheduleHideCards)
        observer.observe(root, {
            childList: true,
            subtree: true,
            characterData: true,
        })

        return () => {
            observer.disconnect()
            for (const [card, previous] of hiddenCards) {
                card.style.display = previous.display
                card.style.visibility = previous.visibility
                if (previous.ariaHidden === null) card.removeAttribute('aria-hidden')
                else card.setAttribute('aria-hidden', previous.ariaHidden)
            }
        }
    }, [])

    return null
}

function isTwitterHost() {
    return location.hostname === 'x.com' || location.hostname.endsWith('.x.com') || location.hostname === 'twitter.com'
}

function findNativeEFPCards(root: ParentNode) {
    const cards = new Set<HTMLElement>()

    for (const card of root.querySelectorAll<HTMLElement>('article [data-testid="card.wrapper"]')) {
        if (hasEFPHostMetadata(card)) cards.add(card)
    }

    for (const link of root.querySelectorAll<HTMLAnchorElement>(
        'article a[href*="efp.app"], article a[href*="ethfollow.xyz"]',
    )) {
        const card = getNativeCardContainer(link)
        if (card) cards.add(card)
    }

    for (const marker of root.querySelectorAll<HTMLElement>('article span, article a, article div[dir]')) {
        if (marker.closest('[data-testid="tweetText"]')) continue
        if (!hasNativeEFPText(marker)) continue
        const card = getNativeCardContainer(marker)
        if (card) cards.add(card)
    }

    return cards
}

function getNativeCardContainer(node: HTMLElement) {
    if (node.closest('[data-testid="tweetText"]')) return null

    const article = node.closest('article')
    if (!article) return null

    const cardWrapper = node.closest<HTMLElement>('[data-testid="card.wrapper"]')
    if (cardWrapper && article.contains(cardWrapper)) return cardWrapper

    const roleLink = node.closest<HTMLElement>('[role="link"]')
    if (roleLink && article.contains(roleLink) && !roleLink.closest('[data-testid="tweetText"]')) return roleLink

    const anchor = node.closest<HTMLElement>('a[href]')
    if (anchor && article.contains(anchor) && !anchor.closest('[data-testid="tweetText"]')) return anchor

    let current: HTMLElement | null = node
    let card: HTMLElement | null = null
    while (current && current !== article) {
        if (current.querySelector('img') && hasNativeEFPText(current)) card = current
        current = current.parentElement
    }

    return card
}

function hasEFPHostMetadata(element: HTMLElement) {
    if (hasNativeEFPText(element)) return true

    for (const item of element.querySelectorAll<HTMLElement>('a[href], img, [title], [aria-label]')) {
        const haystacks = [
            item.getAttribute('href'),
            item.getAttribute('title'),
            item.getAttribute('aria-label'),
            item.getAttribute('alt'),
        ]
        if (haystacks.some(isEFPHostMetadata)) return true
    }

    return isEFPHostMetadata(element.getAttribute('title')) || isEFPHostMetadata(element.getAttribute('aria-label'))
}

function hasNativeEFPText(element: HTMLElement) {
    const text = element.textContent?.toLowerCase() ?? ''
    return text.includes('efp.app') || text.includes('ethfollow.xyz')
}

function isEFPHostMetadata(value: string | null) {
    if (!value) return false
    const lowerValue = value.toLowerCase()
    if (lowerValue.includes('efp.app') || lowerValue.includes('ethfollow.xyz')) return true
    try {
        const url = new URL(value, location.href)
        return url.hostname === 'efp.app' || url.hostname === 'ethfollow.xyz'
    } catch {
        return false
    }
}
