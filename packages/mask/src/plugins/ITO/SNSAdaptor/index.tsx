import { Plugin, usePluginWrapper } from '@masknet/plugin-infra'
import { useState } from 'react'
import { ItoLabelIcon } from '../assets/ItoLabelIcon'
import { makeStyles } from '@masknet/theme'
import {
    formatEthereumAddress,
    formatBalance,
    useFungibleTokenDetailed,
    EthereumTokenType,
} from '@masknet/web3-shared-evm'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { ITO_MetaKey_1, ITO_MetaKey_2, MSG_DELIMITER } from '../constants'
import type { JSON_PayloadComposeMask } from '../types'
import { ITO_MetadataReader, payloadIntoMask } from './helpers'
import { CompositionDialog } from './CompositionDialog'
import { set } from 'lodash-unified'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { MarketsIcon, MarketsClaimIcon } from '@masknet/icons'
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
            RenderEntryComponent({ disabled, AppIcon }) {
                return (
                    <ApplicationEntry
                        disabled={disabled}
                        title="ITO"
                        AppIcon={AppIcon}
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
                )
            },
            appBoardSortingDefaultPriority: 3,
            marketListSortingPriority: 3,
            AppIcon: <MarketsIcon />,
            description: 'Launch decentralized asset freely and participate in token launch directly on Twitter.',
            isInDappList: true,
            name: 'ITO',
            tutorialLink:
                'https://realmasknetwork.notion.site/Launch-an-ITO-Initial-Twitter-Offering-Support-ETH-BSC-Polygon-Arbitrum-d84c60903f974f4880d2085a13906d55',
        },
        {
            RenderEntryComponent({ disabled, AppIcon }) {
                const [open, setOpen] = useState(false)
                return (
                    <>
                        <ApplicationEntry
                            title="Claim"
                            AppIcon={AppIcon}
                            disabled={disabled}
                            onClick={() => setOpen(true)}
                        />
                        <ClaimAllDialog open={open} onClose={() => setOpen(false)} />
                    </>
                )
            },
            appBoardSortingDefaultPriority: 4,
            AppIcon: <MarketsClaimIcon />,
            name: 'Claim',
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
