import { memo, useCallback, useState } from 'react'
import { useTraderTrans } from '../../locales/i18n_generated.js'
import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { Web3Provider } from '@ethersproject/providers'
import { EVMWeb3 } from '@masknet/web3-providers'
import { makeStyles } from '@masknet/theme'
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId } from '@masknet/web3-shared-evm'
import { noop } from 'lodash-es'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(3, 2),
        '.routeCard': {
            padding: theme.spacing(2, 1.5),
        },
        '::-webkit-scrollbar': {
            display: 'none',
            scrollbarColor: 'unset!important',
            backgroundColor: 'unset!important',
        },
        "& [id*='widget-route-expanded-container']": {
            width: 284,
        },
        '& .widget-token-list-item': {
            padding: 0,
        },
        '& .chainCard': {
            height: 52,
        },
    },
}))
export interface ExchangeDialogProps {
    open: boolean
    onClose: () => void
    toAddress?: string
    toChainId?: number
}

export const ExchangeDialog = memo<ExchangeDialogProps>(function ExchangeDialog({
    open,
    onClose,
    toChainId,
    toAddress,
}) {
    const t = useTraderTrans()

    const { Provider } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { providerType, chainId, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { theme, classes } = useStyles()

    const [containerRef, setContainerRef] = useState<HTMLElement>()

    const [showActions, setShowActions] = useState(true)
    const [showDelete, setShowDelete] = useState(false)

    const getSigner = useCallback(
        (requiredChainId?: ChainId) => {
            const providerType = Provider?.providerType?.getCurrentValue()
            const provider = EVMWeb3.getWeb3Provider({ providerType, chainId: requiredChainId ?? chainId, account })

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const signer = new Web3Provider(provider, 'any').getSigner()
            return signer
        },
        [Provider, chainId, account],
    )

    return (
        <InjectedDialog open={open} onClose={noop} title={t.plugin_trader_tab_exchange()}>
            <DialogContent
                className={classes.content}
                style={{ scrollbarColor: 'initial' }}
                sx={{ p: 3 }}
                ref={(_: HTMLElement) => {
                    setContainerRef(_)
                }}></DialogContent>
        </InjectedDialog>
    )
})
