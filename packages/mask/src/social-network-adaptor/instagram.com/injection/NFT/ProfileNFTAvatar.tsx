import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchInstagramAvatarEditPageSettingDialog, searchInstagramAvatarListSelector } from '../../utils/selector'
import { createReactRootShadowed, MaskMessages, startWatch, useI18N, useLocationChange } from '../../../../utils'
import { makeStyles } from '@masknet/theme'
import { useCallback, useLayoutEffect, useState } from 'react'
import { useLocation } from 'react-use'
import { NFTAvatarSettingDialog } from './NFTAvatarSettingDialog'

export async function injectProfileNFTAvatarInInstagram(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchInstagramAvatarListSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarButtonInDialog />)

    const dialogWatcher = new MutationObserverWatcher(searchInstagramAvatarEditPageSettingDialog())
    startWatch(dialogWatcher, signal)
    createReactRootShadowed(dialogWatcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarSettingDialog />)
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        width: '100%',
        fontSize: props.fontSize,
        lineHeight: 1.5,
        minHeight: props.minHeight,
        borderTop: props.borderTop,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ED4956',
        fontWeight: 600,
        cursor: 'pointer',
    },
}))

interface StyleProps {
    fontSize: number
    minHeight: number
    color?: string
    borderTop?: string
}

export function NFTAvatarButtonInDialog() {
    const { t } = useI18N()
    const [style, setStyle] = useState<StyleProps>({
        fontSize: 12,
        minHeight: 48,
        // Instagram css var
        borderTop: '1px solid rgba(var(--b6a,219,219,219),1)',
    })
    const location = useLocation()
    const { classes } = useStyles(style)

    const setStyleWithSelector = useCallback(() => {
        const dom = searchInstagramAvatarListSelector().evaluate()
        if (!dom) return
        const css = window.getComputedStyle(dom)
        setStyle({
            minHeight: Number(css.minHeight.replace('px', '')),
            fontSize: Number(css.fontSize.replace('px', '')),
            color: css.color,
            borderTop: css.borderTop,
        })
    }, [])

    const onClick = useCallback(() => {
        MaskMessages.events.nftAvatarSettingDialogUpdated.sendToLocal({ open: true })
    }, [])

    useLayoutEffect(setStyleWithSelector, [])

    useLocationChange(setStyleWithSelector)

    return (
        <div className={classes.root} onClick={onClick}>
            &#x1F525; {t('use_nft')}
        </div>
    )
}
