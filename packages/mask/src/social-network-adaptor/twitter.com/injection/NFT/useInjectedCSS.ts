import { rainbowBorderKeyFrames } from '@masknet/plugin-avatar'
import { useEffect, useRef } from 'react'
import { searchTwitterAvatarLinkSelector } from '../../utils/selector.js'

export function useInjectedCSS(showAvatar: boolean, updatedAvatar: boolean) {
    const rainBowElement = useRef<Element | null>()
    const borderElement = useRef<Element | null>()
    useEffect(() => {
        if (!showAvatar || !updatedAvatar) return
        const linkDom = searchTwitterAvatarLinkSelector().evaluate()

        if (linkDom?.firstElementChild && linkDom.childNodes.length === 4) {
            const linkParentDom = linkDom.closest('div')

            if (linkParentDom) linkParentDom.style.overflow = 'visible'

            // create rainbow shadow border
            if (linkDom.lastElementChild?.tagName !== 'STYLE') {
                borderElement.current = linkDom.firstElementChild
                // remove useless border
                linkDom.removeChild(linkDom.firstElementChild)
                const style = document.createElement('style')
                style.innerText = `
                ${rainbowBorderKeyFrames.styles}

                .rainbowBorder {
                    box-shadow: 0px 4px 6px rgba(0, 255, 41, 0.2);
                    border: 0 solid #00f8ff;
                }
            `
                rainBowElement.current = linkDom.firstElementChild.nextElementSibling
                linkDom.firstElementChild.nextElementSibling?.classList.add('rainbowBorder')
                linkDom.appendChild(style)
            }
        }

        return () => {
            if (linkDom?.lastElementChild?.tagName === 'STYLE') {
                linkDom.removeChild(linkDom.lastElementChild)
            }

            if (borderElement.current && linkDom?.firstElementChild !== borderElement.current) {
                linkDom?.insertBefore(borderElement.current, linkDom.firstChild)
            }
            if (rainBowElement.current) {
                rainBowElement.current.classList.remove('rainbowBorder')
            }
        }
    }, [location.pathname, showAvatar, updatedAvatar])
}
