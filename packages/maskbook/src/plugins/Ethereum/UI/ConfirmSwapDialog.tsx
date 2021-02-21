import { makeNumberCaptcha } from '@dimensiondev/kit'
import { css } from '@emotion/react'
import { DialogContent, Input, Button } from '@material-ui/core'
import { FC, useCallback, useState } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { EthereumMessages } from '../messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../utils/i18n-next-ui'

interface Props {}

export const ConfirSwapDialog: FC<Props> = () => {
    const { t } = useI18N()
    const [value, setValue] = useState(0)
    const [problem, setProblem] = useState(makeNumberCaptcha())

    const [operation, a, b, result] = problem
    const handleRefresh = () => setProblem(makeNumberCaptcha())

    //#region remote controlled dialog
    const [open, setOpen] = useRemoteControlledDialog(EthereumMessages.events.confirmSwapDialogUpdated)
    const handleConfirm = useCallback(() => {
        if (value !== result) return
        setOpen({
            open: false,
            result: true,
        })
    }, [value, result, setOpen])
    const handleClose = useCallback(() => setOpen({ open: false, result: false }), [setOpen])
    //#endregion

    return (
        <InjectedDialog
            open={open}
            onClose={handleClose}
            title={t('plugin_wallet_captcha')}
            DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent>
                <section>
                    <var>{a}</var>
                    <span> {operation} </span>
                    <var>{b}</var>
                    <span> = </span>
                    <Input
                        css={css`
                            width: 3ex;
                            text-align: center;
                        `}
                        type="number"
                        onChange={(event) => setValue(+event.currentTarget.value)}
                    />
                </section>
                <Button onClick={handleRefresh}>{t('plugin_wallet_captcha_refresh')}</Button>
                <Button onClick={handleConfirm}>{t('plugin_wallet_captcha_confirm')}</Button>
            </DialogContent>
        </InjectedDialog>
    )
}
