import React, { useState } from 'react'
import { TransferButton, TransferButtonProps } from './TransferButton'
import { TransferDialogProps, TransferDialog, TransferPayload } from './TransferDialog'
import { useWallet } from '../../plugins/shared/useWallet'
import { TransferSuccessDialog, TransferFailDialog } from './TransferDialogs'
import type { ValueRef } from '@holoflows/kit/es'
import type { ProfileIdentifier, ECKeyIdentifier } from '../../database/type'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { useAsync } from 'react-use'
import Services from '../../extension/service'
import { ec as EC } from 'elliptic'
import { decompressSecp256k1Key, compressSecp256k1Point } from '../../utils/type-transform/SECP256k1-Compression'
import { decodeArrayBuffer } from '../../utils/type-transform/String-ArrayBuffer'
import { EthereumAddress } from 'wallet.ts'

export interface TransferDemoProps {
    recipientRef: ValueRef<ProfileIdentifier | null>
    TransferButtonProps?: Partial<TransferButtonProps>
    TransferDialogProps?: Partial<TransferDialogProps>
}

export function TransferDemo(props: TransferDemoProps) {
    const { recipientRef } = props
    const recipient = useValueRef(recipientRef)

    console.log(`DEBUG: recipient`)
    console.log(recipient)

    const recipientState = useAsync(async () => {
        if (!recipient) return null
        return Services.Identity.queryProfile(recipient)
    }, [recipient?.toText()])

    const [open, setOpen] = useState(false)
    const { data } = useWallet()
    const { wallets, tokens } = data ?? {}

    const [status, setStatus] = useState<'succeed' | 'failed' | 'undetermined' | 'initial'>('initial')
    const loading = status === 'undetermined'
    const [transferError, setTransferError] = useState<Error | null>(null)
    const [transferPayload, setTransferPayload] = useState<TransferPayload | null>(null)

    const onTransfer = async (payload: TransferPayload) => {}
    const onClose = () => setStatus('initial')

    if (recipientState.loading) return null
    if (!recipientState.value?.linkedPersona?.identifier) return null

    // convert secp256k1 public key to eth address
    const eckey = recipientState.value.linkedPersona.identifier as ECKeyIdentifier
    const ec_jwk = decompressSecp256k1Key(eckey.compressedPoint, 'public')
    const ec = new EC('secp256k1')
    const key = ec.keyFromPublic(compressSecp256k1Point(ec_jwk.x!, ec_jwk.y!), 'array')
    const address = EthereumAddress.from(key.getPublic().encode('array', false) as any).address

    return (
        <>
            <TransferButton onClick={() => setOpen(true)} {...props.TransferButtonProps} />
            {wallets?.length ? (
                <TransferDialog
                    open={open}
                    address={address}
                    nickname={recipientState.value.nickname}
                    loading={loading}
                    onTransfer={onTransfer}
                    onClose={() => setOpen(false)}
                    wallets={wallets}
                    tokens={tokens}
                    {...props.TransferDialogProps}
                />
            ) : null}
            <TransferSuccessDialog
                open={status === 'succeed'}
                title={'hello?'}
                url={'permalink' ?? ''}
                amount={transferPayload?.amount!}
                token={transferPayload?.token!}
                tokenType={transferPayload?.tokenType!}
                onClose={onClose}></TransferSuccessDialog>
            <TransferFailDialog
                open={status === 'failed'}
                message={transferError?.message}
                onClose={onClose}></TransferFailDialog>
        </>
    )
}
