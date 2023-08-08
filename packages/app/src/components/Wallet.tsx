import { SelectProviderModal, WalletStatusModal } from '@masknet/shared'
import { useChainContext, useWeb3Others } from '@masknet/web3-hooks-base'
import { memo } from 'react'

export const WalletItem = memo(() => {
    const { account } = useChainContext()
    const Others = useWeb3Others()
    return (
        <a
            href="#"
            className="flex items-center gap-x-4  py-3 text-sm font-semibold leading-6 text-white hover:text-white"
            onClick={(ev) => {
                ev.preventDefault()
                ev.stopPropagation()

                if (account) WalletStatusModal.open()
                else SelectProviderModal.open()
            }}>
            <img
                className="h-8 w-8 rounded-full bg-gray-800"
                src="https://github.com/DimensionDev/Mask-VI/raw/master/assets/Logo/MB--Logo--Geo--ForceCircle--Blue.svg"
                alt=""
            />
            <span className="sr-only">Your profile</span>
            <span className="dark:text-white  text-black" aria-hidden="true">
                {account ? Others.formatAddress(account, 4) : 'Connect Wallet'}
            </span>
        </a>
    )
})
