import { rainbowBorderKeyFrames } from '@masknet/plugin-avatar'
import { useEffect, useRef } from 'react'
import { searchTwitterAvatarLinkSelector } from '../../utils/selector.js'

export function useInjectedCSS(showAvatar: boolean, updatedAvatar: boolean) {
    const rainbowElement = useRef<Element | null>(null)
    const borderElement = useRef<Element | null>(null)
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
                    animation: ${rainbowBorderKeyFrames.name} 6s linear infinite;
                    box-shadow: 0 5px 15px rgba(0, 248, 255, 0.4), 0 10px 30px rgba(37, 41, 46, 0.2);
                    transition: none;
                    border: 0 solid #00f8ff;
                }

            `

                rainbowElement.current = linkDom.firstElementChild.nextElementSibling
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
            if (rainbowElement.current) {
                rainbowElement.current.classList.remove('rainbowBorder')
            }
        }
    }, [location.pathname, showAvatar, updatedAvatar])
}
