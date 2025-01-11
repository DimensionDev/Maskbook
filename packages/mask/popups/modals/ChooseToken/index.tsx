import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { Web3Helper } from '@masknet/web3-helpers'
import { memo, useState, type ReactNode } from 'react'
import { BottomDrawer, TokenPicker, type BottomDrawerProps, type TokenPickerProps } from '../../components/index.js'
import { Trans } from '@lingui/react/macro'

interface ChooseTokenModalProps extends Omit<BottomDrawerProps, 'title'>, Omit<TokenPickerProps, 'title' | 'classes'> {
    title?: ReactNode
}
const ChooseTokenDrawer = memo(function ChooseTokenDrawer({ title, open, onClose, ...others }: ChooseTokenModalProps) {
    return (
        <BottomDrawer title={title} open={open} onClose={onClose}>
            <TokenPicker
                key={`${others.chainId}.${others.address}`}
                {...others}
                defaultChainId={others.chainId}
                mt={2}
                height={455}
            />
        </BottomDrawer>
    )
})

export type ChooseTokenModalOpenProps = Omit<ChooseTokenModalProps, 'open'>
export type ChooseTokenModalCloseProps = Web3Helper.FungibleAssetAll | Web3Helper.FungibleTokenAll | void
export function ChooseTokenModal({ ref }: SingletonModalProps<ChooseTokenModalOpenProps, ChooseTokenModalCloseProps>) {
    const [props, setProps] = useState<ChooseTokenModalOpenProps>({})

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })

    return (
        <ChooseTokenDrawer
            title={<Trans>Choose Token</Trans>}
            {...props}
            open={open}
            onClose={() => dispatch?.close()}
            onSelect={(asset) => dispatch?.close(asset)}
        />
    )
}
