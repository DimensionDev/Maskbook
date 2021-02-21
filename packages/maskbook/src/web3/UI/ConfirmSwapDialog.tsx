import { makeNumberCaptcha } from '@dimensiondev/kit'
import { css } from '@emotion/react'
import { DialogContent, Input, Button } from '@material-ui/core'
import { FC, useCallback, useState } from 'react'
import { InjectedDialog } from '../../components/shared/InjectedDialog'
import { EthereumMessages } from '../../plugins/Ethereum/messages'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../utils/i18n-next-ui'

interface Props {
    onConfirm(): void
}

export const NumberCaptchaDialog: FC<Props> = ({ onConfirm }) => {
    const { t } = useI18N()
    const [value, setValue] = useState(0)
    const [problem, setProblem] = useState(makeNumberCaptcha())
    const [open, setOpen] = useRemoteControlledDialog(EthereumMessages.events.confirmSwap)
    const onClose = useCallback(() => setOpen({ open: false }), [setOpen])
    const [operation, a, b, result] = problem
    const handleRefresh = () => setProblem(makeNumberCaptcha())
    const handleConfirm = () => {
        if (value === result) {
            onConfirm()
        } else {
            // TODO: error handler
        }
    }
    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
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
