import { Button, TextField } from '@material-ui/core'
import ImageIcon from '@material-ui/icons/Image'
import type { FC } from 'react'
import { useState } from 'react'
import { Send as SendIcon } from 'react-feather'
import { Image } from '../../../../components/shared/Image'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../../DashboardDialogs/Base'

export interface TransferDialogProps {
    url?: string
    onTransfer?: (address: string) => void
}

export const TransferDialog: FC<WrappedDialogProps<TransferDialogProps>> = ({ ComponentProps, open, onClose }) => {
    const { t } = useI18N()
    return (
        <DashboardDialogCore fullScreen={false} open={open} onClose={onClose}>
            <DashboardDialogWrapper
                primary={t('wallet_transfer_title')}
                icon={<SendIcon />}
                iconColor="#4EE0BC"
                size="medium"
                content={<Transfer url={ComponentProps?.url} onTransfer={ComponentProps?.onTransfer} />}
            />
        </DashboardDialogCore>
    )
}

interface TransferProps {
    url?: string
    onTransfer?(address: string | undefined): void
}

const Transfer: FC<TransferProps> = (props) => {
    const { t } = useI18N()
    const [address, setAddress] = useState<string>()
    const [memo, setMemo] = useState<string>()
    const onTransfer = () => {
        props.onTransfer?.(address)
    }
    return (
        <div>
            {props.url ? <Image component="img" width={160} height={220} src={props.url} /> : <ImageIcon />}
            <TextField
                required
                label={t('wallet_transfer_to_address')}
                placeholder={t('wallet_transfer_to_address')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <TextField
                label={t('wallet_transfer_memo')}
                placeholder={t('wallet_transfer_memo_placeholder')}
                value={memo}
                disabled={/* TODO: disabled control */ false}
                onChange={(e) => setMemo(e.target.value)}
            />
            <Button
                variant="contained"
                color="primary"
                disabled={/* TODO: disabled control */ false}
                onClick={onTransfer}>
                {t('wallet_transfer_send')}
            </Button>
        </div>
    )
}
