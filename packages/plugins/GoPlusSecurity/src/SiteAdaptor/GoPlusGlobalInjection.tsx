import { memo, useEffect, useState } from 'react'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import CheckSecurityConfirmDialog from './components/CheckSecurityConfirmDialog.js'
import { RiskWarningDialog, type Token } from './components/RiskWarningDialog.js'
import { CheckSecurityDialog } from './CheckSecurityDialog.js'
import { PluginGoPlusSecurityMessages } from '../messages.js'

export const GoPlusGlobalInjection = memo(function GoPlusGlobalInjection() {
    const [confirmOpen, setConfirmOpen] = useState(false)

    useEffect(() => {
        return CrossIsolationMessages.events.checkSecurityConfirmationDialogEvent.on(({ open }) => {
            setConfirmOpen(open)
        })
    }, [])

    const [mainDialogOpen, setMainDialogOpen] = useState(false)
    const [searchHidden, setSearchHidden] = useState(false)
    const [chainId, setChainId] = useState(ChainId.Mainnet)
    const [tokenAddress, setTokenAddress] = useState<string>()
    useEffect(() => {
        return CrossIsolationMessages.events.checkSecurityDialogEvent.on((env) => {
            if (!env.open) return
            setMainDialogOpen(env.open)
            setSearchHidden(env.searchHidden)
            setChainId(env.chainId ?? ChainId.Mainnet)
            setTokenAddress(env.tokenAddress)
        })
    }, [])

    const [token, setToken] = useState<Token>()
    const { open: riskWarningOpen, setDialog: setRiskWarningDialog } = useRemoteControlledDialog(
        PluginGoPlusSecurityMessages.tokenRiskWarningDialogEvent,
        (env) => {
            if (!env.open) return
            setToken(env.token)
        },
    )

    return (
        <>
            {confirmOpen ?
                <CheckSecurityConfirmDialog open onClose={() => setConfirmOpen(false)} />
            :   null}
            {mainDialogOpen ?
                <CheckSecurityDialog
                    open
                    onClose={() => setMainDialogOpen(false)}
                    searchHidden={searchHidden}
                    chainId={chainId}
                    tokenAddress={tokenAddress ?? ZERO_ADDRESS}
                />
            :   null}
            {riskWarningOpen ?
                <RiskWarningDialog open onSetDialog={setRiskWarningDialog} token={token} />
            :   null}
        </>
    )
})
