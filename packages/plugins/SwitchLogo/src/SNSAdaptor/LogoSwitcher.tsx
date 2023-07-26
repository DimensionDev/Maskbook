/* cspell: disable */
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Stack } from '@mui/material'
import { startWatch } from '@masknet/shared'
import { CrossIsolationMessages, PluginID, SwitchLogoType, switchLogoSettings } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { useIsMinimalModeDashBoard } from '@masknet/plugin-infra/dashboard'

const BlueBirdHTML = `
<svg
     viewBox="0 0 24 24"
     aria-hidden="true"
     class="r-1cvl2hr r-4qtqp9 r-yyyyoo r-16y2uox r-8kz0gk r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-lrsllp"
     >
     <g>
         <path
         d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"
         />
     </g>
</svg>
`

const LetterHTML = `
<svg viewBox="0 0 24 24" aria-hidden="true" class="r-1nao33i r-4qtqp9 r-yyyyoo r-16y2uox r-8kz0gk r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-lrsllp">
  <g>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </g>
</svg>
`

const LogoSelector = new LiveSelector()
    .querySelector<HTMLElement>('h1[role="heading"] a > div > svg')
    .enableSingleMode()

function SwitchLogoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="10" fill="#1C68F3" />
            <path
                fill="#fff"
                d="M14.86 7.223 12.084 10h2.083A4.17 4.17 0 0 1 10 14.167a4.077 4.077 0 0 1-1.945-.486l-1.014 1.014a5.507 5.507 0 0 0 2.959.861 5.554 5.554 0 0 0 5.555-5.555h2.084L14.86 7.223ZM5.834 10A4.17 4.17 0 0 1 10 5.834a4.07 4.07 0 0 1 1.944.486l1.014-1.014A5.508 5.508 0 0 0 10 4.445 5.554 5.554 0 0 0 4.444 10H2.361l2.778 2.777L7.916 10H5.833Z"
            />
        </svg>
    )
}

const useStyles = makeStyles()(() => ({
    switchIcon: {
        position: 'absolute',
        display: 'flex',
        width: 14,
        height: 14,
        bottom: 5,
        right: 5,
    },
    hover: {
        display: 'none',
        '&:hover': {
            display: 'block',
        },
    },
}))

export function LogoSwitcher() {
    const { classes, cx } = useStyles()
    const current = useLastRecognizedIdentity()
    const logoType = useValueRef(switchLogoSettings[current?.identifier?.userId || ''])
    const ref = useRef<HTMLDivElement>(null)
    const disable = useIsMinimalModeDashBoard(PluginID.SwitchLogo)

    useLayoutEffect(() => {
        const node = LogoSelector.evaluate()
        if (!node) return

        node?.parentElement?.style.setProperty('position', 'relative')
        node?.parentElement?.parentElement?.parentElement?.appendChild(ref.current)

        if (logoType === SwitchLogoType.Classics && !disable) {
            // eslint-disable-next-line @masknet/browser-no-set-html
            node.innerHTML = BlueBirdHTML
        } else {
            // eslint-disable-next-line @masknet/browser-no-set-html
            node.innerHTML = LetterHTML || ''
        }
    }, [logoType, disable])

    useEffect(() => {
        const ab = new AbortController()
        const watcher = new MutationObserverWatcher(LogoSelector)

        startWatch(watcher, ab)

        return () => ab.abort()
    }, [])

    useEffect(() => {
        ref.current?.addEventListener('click', onClick)
        return ref.current?.removeEventListener('click', onClick)
    }, [ref.current])
    const onClick = useCallback(() => {
        CrossIsolationMessages.events.switchLogoUpdated.sendToLocal({ open: true })
    }, [])

    return (
        <Stack ref={ref} className={cx(classes.switchIcon, classes.hover)} onClick={onClick} style={{}}>
            {SwitchLogoIcon()}
        </Stack>
    )
}
