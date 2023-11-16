import { PluginWalletStatusBar } from '@masknet/shared'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useAccount } from '@masknet/web3-hooks-base'
import { EVMContract } from '@masknet/web3-providers'
import { ChainId } from '@masknet/web3-shared-evm'
import { useMatch, useNavigate, useSearchParams } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import urlcat from 'urlcat'
import { FRIEND_TECH_CONTRACT_ADDRESS, RoutePaths } from '../constants.js'
import { useI18N } from '../locales/i18n_generated.js'
import { useOwnKeys } from './hooks/useOwnKeys.js'

const useStyles = makeStyles()((theme) => ({
    button: {
        backgroundColor: theme.palette.maskColor.danger,
        width: 205.5,
        color: theme.palette.maskColor.bottom,
        marginLeft: 'auto',
        '&:hover': {
            backgroundColor: theme.palette.maskColor.danger,
        },
    },
}))

export function ActionsContent() {
    const { classes } = useStyles()
    const t = useI18N()
    const account = useAccount()
    const matchDetail = !!useMatch(RoutePaths.Detail)
    const matchOrder = !!useMatch(RoutePaths.Order)
    const [params] = useSearchParams()
    const address = params.get('address')!
    const count = params.get('count') // We store trading amount in url
    const navigate = useNavigate()
    const [state, handleClick] = useAsyncFn(async () => {
        if (matchDetail) {
            const url = urlcat(RoutePaths.Order, { address })
            navigate(url)
        } else if (matchOrder) {
            const contract = EVMContract.getFriendTech(FRIEND_TECH_CONTRACT_ADDRESS, {
                chainId: ChainId.Base,
                account,
            })
            await contract?.methods.sellShares(address, count).send({
                from: account,
                to: FRIEND_TECH_CONTRACT_ADDRESS,
            })
        }
    }, [account, address, navigate, matchDetail, matchOrder, count])

    const { data: own } = useOwnKeys(address, account)

    return (
        <PluginWalletStatusBar>
            {matchDetail || matchOrder ?
                <ActionButton
                    variant="contained"
                    size="large"
                    className={classes.button}
                    onClick={handleClick}
                    disabled={!own}
                    loading={state.loading}>
                    {t.sell()}
                </ActionButton>
            :   null}
        </PluginWalletStatusBar>
    )
}

export function MainActionsContent() {
    const matchMain = !!useMatch(RoutePaths.Main)

    return matchMain ? <PluginWalletStatusBar /> : null
}
