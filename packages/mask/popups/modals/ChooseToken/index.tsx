import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { Web3Helper } from '@masknet/web3-helpers'
import { memo, useState } from 'react'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'
import { BottomDrawer, TokenPicker, type BottomDrawerProps, type TokenPickerProps } from '../../components/index.js'

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
export type ChooseTokenModalCloseProps = Web3Helper.FungibleAssetAll | Web3Helper.FungibleTokenAll | void
export function ChooseTokenModal({ ref }: SingletonModalProps<ChooseTokenModalOpenProps, ChooseTokenModalCloseProps>) {
    const t = useMaskSharedTrans()
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
            title={t.popups_wallet_choose_token()}
            onClose={() => dispatch?.close()}
            onSelect={(asset) => dispatch?.close(asset)}
        />
    )
}
