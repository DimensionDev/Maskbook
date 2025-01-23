import { createIndicator, EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, MaskLightTheme } from '@masknet/theme'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { skipToken, useInfiniteQuery } from '@tanstack/react-query'
import { first } from 'lodash-es'
import { useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { ClaimRecord } from '../components/ClaimRecord.js'
import { RedPacketRecord } from '../components/RedPacketRecord.js'
import { EmptyStatus, LoadingStatus } from '@masknet/shared'
import { Trans } from '@lingui/react/macro'
import { useEnvironmentContext } from '@masknet/web3-hooks-base'
import { ThemeProvider } from '@mui/material'
import { DURATION } from '../../constants.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
    },
    interactions: {
        flexGrow: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    status: {
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
}))

export function HistoryDetail() {
    const { classes, cx } = useStyles()
    const { pluginID } = useEnvironmentContext()
    const location = useLocation()
    const history = location.state.history as FireflyRedPacketAPI.RedPacketSentInfo
    const [params] = useSearchParams()
    const rpid = params.get('id')
    const rawChainId = params.get('chain-id')
    const chainId = rawChainId ? +rawChainId : undefined
    const isClaimed = params.get('claimed')

    const { data, isLoading } = useInfiniteQuery({
        enabled: !!rpid,
        queryKey: ['redpacket', 'claim-history', pluginID, rpid, chainId],
        initialPageParam: undefined as string | undefined,
        queryFn:
            rpid ?
                async ({ pageParam }) => {
                    return FireflyRedPacket.getClaimHistory(
                        rpid,
                        pluginID === NetworkPluginID.PLUGIN_EVM ? chainId : undefined,
                        createIndicator(undefined, pageParam),
                    )
                }
            :   skipToken,
        getNextPageParam: (lastPage) => lastPage.cursor,
    })

    const claims = useMemo(() => data?.pages.flatMap((x) => x.list) ?? EMPTY_LIST, [data?.pages])
    const info = first(data?.pages)

    const patchedHistory = useMemo(() => {
        return history ?
                {
                    ...history,
                    claim_numbers: info?.claim_numbers,
                    total_numbers: info?.total_numbers,
                    duration: DURATION,
                }
            :   null
    }, [history])
    return (
        <div className={classes.container}>
            {patchedHistory ?
                <ThemeProvider theme={MaskLightTheme}>
                    <RedPacketRecord onlyView={!!isClaimed} history={patchedHistory} showDetailLink={false} />
                </ThemeProvider>
            :   null}
            {isLoading ?
                <div className={cx(classes.interactions, classes.status)}>
                    <LoadingStatus />
                </div>
            : !claims.length ?
                <div className={cx(classes.interactions, classes.status)}>
                    <EmptyStatus>
                        <Trans>It remains unclaimed.</Trans>
                    </EmptyStatus>
                </div>
            :   <div className={classes.interactions}>
                    {claims.map((x) => {
                        return (
                            <ClaimRecord
                                key={`${x.creator}/${x.token_amounts}`}
                                record={x}
                                chainId={info?.chain_id ?? chainId!}
                            />
                        )
                    })}
                </div>
            }
        </div>
    )
}
