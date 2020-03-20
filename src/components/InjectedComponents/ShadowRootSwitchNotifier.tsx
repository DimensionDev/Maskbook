import { sideEffect } from '../../utils/side-effects'
import { renderInShadowRootSettings } from '../shared-settings/settings'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { DOMProxy, GetContext } from '@holoflows/kit/es'
import React from 'react'
import { useSnackbar } from 'notistack'
import { Button } from '@material-ui/core'
import { useI18N } from '../../utils/i18n-next-ui'

sideEffect
    .then(() => renderInShadowRootSettings.readyPromise)
    .then(() => {
        const unListen = renderInShadowRootSettings.addListener(() => {
            if (GetContext() !== 'content') return
            if (window !== window.top) return
            unListen()

            const any = DOMProxy()
            any.realCurrent = document.body.children[0] as HTMLElement
            renderInShadowRoot(<Notifier />, {
                normal: () => any.after,
                shadow: () => any.afterShadow,
            })
        })
    })
function Notifier() {
    const { t } = useI18N()
    useSnackbar().enqueueSnackbar(t('reload_to_switch_shadow_root_rendering_mode'), {
        persist: true,
        key: 'shadow',
        preventDuplicate: true,
        variant: 'info',
        anchorOrigin: {
            horizontal: 'center',
            vertical: 'bottom',
        },
        action: () => (
            <Button style={{ color: 'white' }} onClick={() => location.reload()}>
                {t('reload')}
            </Button>
        ),
    })
    return null
}
