/* cspell: disable */
import { useCallback, useLayoutEffect } from 'react'
import { CrossIsolationMessages, PluginID, SwitchLogoType } from '@masknet/shared-base'
import { useIsMinimalMode, type IdentityResolved } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { LiveSelector } from '@dimensiondev/holoflows-kit'
import { Icons } from '@masknet/icons'
import { useSwitchLogoStorage } from './storage.js'

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

const LogoSelector = new LiveSelector()
    .querySelector<HTMLElement>('h1[role="heading"] a > div > svg')
    .enableSingleMode()

const LetterHTML = LogoSelector.evaluate()?.innerHTML

const useStyles = makeStyles()(() => ({
    switchIcon: {
        position: 'absolute',
        display: 'flex',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
    },
    iconBox: {
        position: 'relative',
        flex: 1,
    },

    icon: {
        position: 'absolute',
        right: 5,
        bottom: 5,
        width: 20,
        height: 20,
    },

    hover: {
        opacity: 0,
        '&:hover': {
            opacity: 1,
        },
    },
    hidden: {
        opacity: 0,
    },
}))

interface SwitchLogoButtonProps {
    identity?: IdentityResolved
}
export function SwitchLogoButton({ identity }: SwitchLogoButtonProps) {
    const { classes, cx } = useStyles()
    const disable = useIsMinimalMode(PluginID.SwitchLogo)

    const [storage, _] = useSwitchLogoStorage()
    const logoType = storage[identity?.identifier?.userId || 'default']

    useLayoutEffect(() => {
        const node = LogoSelector.evaluate()
        if (!node) return
        node?.parentElement?.style.setProperty('position', 'relative')
        if (logoType === SwitchLogoType.Classics && !disable) {
            // eslint-disable-next-line @masknet/browser-no-set-html
            node.innerHTML = BlueBirdHTML
        } else {
            // eslint-disable-next-line @masknet/browser-no-set-html
            node.innerHTML = LetterHTML || ''
        }
    }, [logoType, disable])

    const onClick = useCallback(() => {
        if (disable) return
        CrossIsolationMessages.events.switchLogoUpdated.sendToAll({ open: true })
    }, [disable])

    return (
        <div className={classes.switchIcon}>
            <div className={cx(classes.iconBox, disable ? classes.hidden : classes.hover)}>
                <Icons.SwitchLogo className={classes.icon} onClickCapture={onClick} />
            </div>
        </div>
    )
}
