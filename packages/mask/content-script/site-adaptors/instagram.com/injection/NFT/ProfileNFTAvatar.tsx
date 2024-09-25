import { useCallback, useLayoutEffect, useState } from 'react'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { MaskMessages } from '@masknet/shared-base'
import { useLocationChange } from '@masknet/shared-base-ui'
import { startWatch } from '../../../../utils/startWatch.js'
import { searchInstagramAvatarEditPageSettingDialog, searchInstagramAvatarListSelector } from '../../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root.js'
import { NFTAvatarSettingDialog } from './NFTAvatarSettingDialog.js'
import { Trans } from '@lingui/macro'

export async function injectProfileNFTAvatarInInstagram(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchInstagramAvatarListSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarButtonInDialog />)

    const dialogWatcher = new MutationObserverWatcher(searchInstagramAvatarEditPageSettingDialog())
    startWatch(dialogWatcher, signal)
    attachReactTreeWithContainer(dialogWatcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarSettingDialog />)
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

function NFTAvatarButtonInDialog() {
    const [style, setStyle] = useState<StyleProps>({
        fontSize: 12,
        minHeight: 48,
        // Instagram css var
        borderTop: '1px solid rgba(var(--b6a,219,219,219),1)',
    })
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
            &#x1F525; <Trans>Use NFT</Trans>
        </div>
    )
}
