import React, { useState } from 'react'
import { TransferButton, TransferButtonProps } from '../../../components/InjectedComponents/TransferButton'
import { TransferDialogProps, TransferDialog, TransferPayload } from './TransferDialog'
import { useWallet } from '../../shared/useWallet'
import { TransferSuccessDialog, TransferFailDialog, SelectCameraDialog, QRCodeVideoScannerDialog } from './Dialogs'
import type { ValueRef } from '@holoflows/kit/es'
import type { ProfileIdentifier } from '../../../database/type'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import { EthereumTokenType } from '../../Wallet/database/types'
import BigNumber from 'bignumber.js'
import { getNetworkSettings } from '../../Wallet/UI/Developer/EthereumNetworkSettings'

export interface TransferDemoProps {
    recipientRef: ValueRef<ProfileIdentifier | null>
    TransferButtonProps?: Partial<TransferButtonProps>
    TransferDialogProps?: Partial<TransferDialogProps>
}

export function TransferDemo(props: TransferDemoProps) {
    const { recipientRef } = props
    const recipient = useValueRef(recipientRef)

    const [open, setOpen] = useState(false)
    const { data } = useWallet()
    const { wallets, tokens } = data ?? {}

    const [scannedAddress, setScannedAddress] = useState<string | undefined>(undefined)
    const [deviceId, setDeviceId] = useState('')
    const [selectCameraDialogOpen, setSelectCameraDialogOpen] = useState(false)
    const [QRCodeVideoScannerDialogOpen, setQRCodeVideoScannerDialogOpen] = useState(false)

    const [status, setStatus] = useState<'succeed' | 'failed' | 'malformed' | 'undetermined' | 'initial'>('initial')
    const loading = status === 'undetermined'
    const [transferError, setTransferError] = useState<Error | null>(null)
    const [transferPayload, setTransferPayload] = useState<TransferPayload | null>(null)

    const onTransfer = async (payload: TransferPayload) => {
        const { amount, address, recipientAddress, token, tokenType } = payload
        if (!recipientAddress) return
        const power = tokenType === EthereumTokenType.ETH ? 18 : token!.decimals
        try {
            setStatus('undetermined')
            await Services.Plugin.invokePlugin('maskbook.transfer', 'transfer', {
                recipient_address: recipientAddress,
                transfer_total: new BigNumber(amount).multipliedBy(new BigNumber(10).pow(power)),
                owner_address: address,
                network: getNetworkSettings().networkType,
                token_type: tokenType,
                token,
            })
            setOpen(false)
            setTransferPayload(payload)
            setStatus('succeed')
        } catch (e) {
            setTransferError(e)
            setStatus('failed')
        }
    }
    const onClose = () => {
        setStatus('initial')
        setScannedAddress(undefined)
    }

    const recipientState = useAsync(async () => {
        if (!recipient) return
        const profile = await Services.Identity.queryProfile(recipient)
        const profileText = profile.linkedPersona?.identifier.toText()
        if (!profileText) return
        return {
            address: await Services.Plugin.invokePlugin('maskbook.transfer', 'ethAddrFrom', profileText),
            persona: profile.linkedPersona,
            profile,
        }
    }, [recipient?.toText()])
    if (recipientState.loading || !recipientState.value?.address || !recipientState.value?.persona) return null
    const recipientNickname = scannedAddress ? undefined : recipientState.value.profile.nickname
    const recipientAddress = scannedAddress ?? recipientState.value.address
    return (
        <>
            <TransferButton onClick={() => setOpen(true)} {...props.TransferButtonProps} />
            {wallets?.length ? (
                <TransferDialog
                    open={open}
                    recipient={recipientNickname}
                    recipientAddress={recipientAddress}
                    loading={loading}
                    onTransfer={onTransfer}
                    onScan={() => setSelectCameraDialogOpen(true)}
                    onClose={() => {
                        setOpen(false)
                        if (status === 'initial') setScannedAddress(undefined)
                    }}
                    wallets={wallets}
                    tokens={tokens}
                    {...props.TransferDialogProps}
                />
            ) : null}
            <SelectCameraDialog
                open={selectCameraDialogOpen}
                onConfirm={(id: string) => {
                    setDeviceId(id)
                    setQRCodeVideoScannerDialogOpen(true)
                }}
                onClose={() => setSelectCameraDialogOpen(false)}
            />
            {deviceId ? (
                <QRCodeVideoScannerDialog
                    open={QRCodeVideoScannerDialogOpen}
                    deviceId={deviceId}
                    onScan={async (content) => {
                        const address = await Services.Plugin.invokePlugin('maskbook.transfer', 'parseEthAddr', content)
                        if (address) setScannedAddress(address)
                        else {
                            setTransferError(new Error(`${content} is not a valid ethereum address.`))
                            setStatus('malformed')
                        }
                    }}
                    onClose={() => setQRCodeVideoScannerDialogOpen(false)}
                />
            ) : null}
            <TransferSuccessDialog
                open={status === 'succeed'}
                recipient={recipientNickname}
                recipientAddress={recipientAddress}
                amount={transferPayload?.amount!}
                token={transferPayload?.token!}
                tokenType={transferPayload?.tokenType!}
                onClose={onClose}></TransferSuccessDialog>
            <TransferFailDialog
                open={status === 'failed' || status === 'malformed'}
                title={status === 'malformed' ? 'Invalid Address' : undefined}
                message={transferError?.message}
                onClose={onClose}></TransferFailDialog>
        </>
    )
}
