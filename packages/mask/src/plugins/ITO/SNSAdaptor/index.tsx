import { Plugin, usePluginWrapper, useCurrentWeb3NetworkPluginID, NetworkPluginID } from '@masknet/plugin-infra'
import { useState } from 'react'
import { ItoLabelIcon } from '../assets/ItoLabelIcon'
import { makeStyles } from '@masknet/theme'
import {
    formatEthereumAddress,
    formatBalance,
    useFungibleTokenDetailed,
    EthereumTokenType,
    useChainId,
} from '@masknet/web3-shared-evm'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { ITO_MetaKey_1, ITO_MetaKey_2, MSG_DELIMITER } from '../constants'
import type { JSON_PayloadComposeMask } from '../types'
import { ITO_MetadataReader, payloadIntoMask } from './helpers'
import { CompositionDialog } from './CompositionDialog'
import { set } from 'lodash-unified'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { MarketsIcon } from '@masknet/icons'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { ClaimAllDialog } from './ClaimAllDialog'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
    },
    span: {
        paddingLeft: theme.spacing(1),
    },
}))

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        const payload = ITO_MetadataReader(props.message.meta)
        usePluginWrapper(payload.ok)
        if (!payload.ok) return null
        return (
            <EthereumChainBoundary chainId={payload.val.chain_id}>
                <PostInspector payload={set(payloadIntoMask(payload.val), 'token', payload.val.token)} />
            </EthereumChainBoundary>
        )
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [ITO_MetaKey_1, onAttached_ITO],
        [ITO_MetaKey_2, onAttached_ITO],
    ]),
    CompositionDialogEntry: {
        dialog({ open, onClose }) {
            return <CompositionDialog open={open} onConfirm={onClose} onClose={onClose} />
        },
        label: {
            fallback: (
                <>
                    <MarketsIcon style={{ width: 16, height: 16 }} />
                    ITO
                </>
            ),
        },
    },
    ApplicationEntries: [
        {
            RenderEntryComponent(key) {
                const currentPluginId = useCurrentWeb3NetworkPluginID()
                const chainId = useChainId()
                const isDisabled =
                    currentPluginId !== NetworkPluginID.PLUGIN_EVM ||
                    !base.enableRequirement.web3![NetworkPluginID.PLUGIN_EVM]!.supportedChainIds!.includes(chainId)
                return (
                    <div key={key}>
                        <ApplicationEntry
                            disabled={isDisabled}
                            title="ITO"
                            icon={new URL('../assets/token.png', import.meta.url).toString()}
                            onClick={() =>
                                CrossIsolationMessages.events.requestComposition.sendToLocal({
                                    reason: 'timeline',
                                    open: true,
                                    options: {
                                        startupPlugin: base.ID,
                                    },
                                })
                            }
                        />
                    </div>
                )
            },
            defaultSortingPriority: 3,
        },
        {
            RenderEntryComponent(key) {
                const currentPluginId = useCurrentWeb3NetworkPluginID()
                const chainId = useChainId()
                const [open, setOpen] = useState(false)
                const isHidden =
                    currentPluginId !== NetworkPluginID.PLUGIN_EVM ||
                    !base.enableRequirement.web3![NetworkPluginID.PLUGIN_EVM]!.supportedChainIds!.includes(chainId)
                return isHidden ? null : (
                    <div key={key}>
                        <ApplicationEntry
                            title="Claim"
                            icon={new URL('../assets/gift.png', import.meta.url).toString()}
                            onClick={() => setOpen(true)}
                        />
                        <ClaimAllDialog open={open} onClose={() => setOpen(false)} />
                    </div>
                )
            },
            defaultSortingPriority: 4,
        },
    ],
}

function onAttached_ITO(payload: JSON_PayloadComposeMask) {
    return { text: <Badge payload={payload} /> }
}
interface BadgeProps {
    payload: JSON_PayloadComposeMask
}
function Badge({ payload }: BadgeProps) {
    const { classes } = useStyles()
    const { value: tokenDetailed, loading: loadingToken } = useFungibleTokenDetailed(
        EthereumTokenType.ERC20,
        payload.token,
    )
    const balance = formatBalance(payload.total, tokenDetailed?.decimals)
    const symbol = tokenDetailed?.symbol ?? tokenDetailed?.name ?? 'Token'
    const sellerName = payload.seller.name
        ? payload.seller.name
        : payload.message.split(MSG_DELIMITER)[0] ?? formatEthereumAddress(payload.seller.address, 4)
    return loadingToken ? null : (
        <div className={classes.root}>
            <ItoLabelIcon size={14} />
            <span className={classes.span}>
                A ITO with {balance} ${symbol} from {sellerName}
            </span>
        </div>
    )
}

export default sns
