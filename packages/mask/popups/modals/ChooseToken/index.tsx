import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { Web3Helper } from '@masknet/web3-helpers'
import { memo, useState } from 'react'
import { BottomDrawer, TokenPicker, type BottomDrawerProps, type TokenPickerProps } from '../../components/index.js'
import { Trans } from '@lingui/macro'

interface ChooseTokenModalProps extends BottomDrawerProps, Omit<TokenPickerProps, 'title' | 'classes'> {}
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

export type ChooseTokenModalOpenProps = Omit<ChooseTokenModalProps, 'title' | 'open'>
export type ChooseTokenModalCloseProps = Web3Helper.FungibleAssetAll | void
export function ChooseTokenModal({ ref }: SingletonModalProps<ChooseTokenModalOpenProps, ChooseTokenModalCloseProps>) {
    const [props, setProps] = useState<ChooseTokenModalOpenProps>({})

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })

    return (
        <ChooseTokenDrawer
            {...props}
            open={open}
            title={<Trans>Choose Token</Trans>}
            onClose={() => dispatch?.close()}
            onSelect={(asset) => dispatch?.close(asset)}
        />
    )
}
