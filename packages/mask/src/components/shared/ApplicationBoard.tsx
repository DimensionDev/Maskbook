import { Fragment } from 'react'
import { makeStyles } from '@masknet/theme'
import { useChainId } from '@masknet/plugin-infra/web3'
import { useActivatedPluginsSNSAdaptor, Plugin } from '@masknet/plugin-infra/content-script'
import { useCurrentWeb3NetworkPluginID, useAccount } from '@masknet/plugin-infra/web3'
import { getCurrentSNSNetwork } from '../../social-network-adaptor/utils'
import { activatedSocialNetworkUI } from '../../social-network'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        applicationWrapper: {
            marginTop: theme.spacing(0.5),
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: '100px',
            gridGap: theme.spacing(1.5),
            justifyContent: 'space-between',
            height: 324,
            [smallQuery]: {
                overflow: 'auto',
                overscrollBehavior: 'contain',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridGap: theme.spacing(1),
            },
        },
    }
})

export function ApplicationBoard() {
    const { classes } = useStyles()
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    const currentWeb3Network = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()
    const account = useAccount()
    const currentSNSNetwork = getCurrentSNSNetwork(activatedSocialNetworkUI.networkIdentifier)

    return (
        <>
            <section className={classes.applicationWrapper}>
                {snsAdaptorPlugins
                    .reduce<{ entry: Plugin.SNSAdaptor.ApplicationEntry; enabled: boolean; pluginId: string }[]>(
                        (acc, cur) => {
                            if (!cur.ApplicationEntries) return acc
                            const currentWeb3NetworkSupportedChainIds = cur.enableRequirement.web3?.[currentWeb3Network]
                            const isWeb3Enabled = Boolean(
                                currentWeb3NetworkSupportedChainIds === undefined ||
                                    currentWeb3NetworkSupportedChainIds.supportedChainIds?.includes(chainId),
                            )
                            const isWalletConnectedRequired = currentWeb3NetworkSupportedChainIds !== undefined
                            const currentSNSIsSupportedNetwork =
                                cur.enableRequirement.networks.networks[currentSNSNetwork]
                            const isSNSEnabled =
                                currentSNSIsSupportedNetwork === undefined || currentSNSIsSupportedNetwork

                            return acc.concat(
                                cur.ApplicationEntries.map((x) => {
                                    return {
                                        entry: x,
                                        enabled: isSNSEnabled && (account ? isWeb3Enabled : !isWalletConnectedRequired),
                                        pluginId: cur.ID,
                                    }
                                }) ?? [],
                            )
                        },
                        [],
                    )
                    .sort((a, b) => a.entry.defaultSortingPriority - b.entry.defaultSortingPriority)
                    .map(({ entry, enabled }, index) => (
                        <Fragment key={index}>
                            <entry.RenderEntryComponent disabled={!enabled} />
                        </Fragment>
                    ))}
            </section>
        </>
    )
}
