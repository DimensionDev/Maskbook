import { Select, Trans } from '@lingui/react/macro'
import { NetworkPluginID } from '@masknet/shared-base'
import { useCustomSnackbar } from '@masknet/theme'
import { NFTScanNonFungibleTokenEVM, NFTSpam } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useAsyncFn } from 'react-use'
import { ConfirmDialog } from '../UI/modals/modals.js'

interface Options {
    address?: string
    chainId?: number
    pluginID?: NetworkPluginID
    collectionId?: string
}

/**
 * @deprecated SimpleHash is shutting down
 * collectionId is more accurate
 */
export function useReportSpam({ pluginID, chainId, address, collectionId }: Options) {
    const isSolana = pluginID === NetworkPluginID.PLUGIN_SOLANA
    const { data: collectionByAddress } = useQuery({
        enabled: !collectionId && !isSolana,
        queryKey: ['simple-hash', 'collection', chainId, address],
        queryFn: async () => {
            if (!address || !chainId) return null
            return NFTScanNonFungibleTokenEVM.getCollection(address, { chainId })
        },
    })
    const collection = collectionByAddress
    const colId = collectionId
    const [state, reportSpam] = useAsyncFn(async () => {
        if (!colId) return
        const res = await NFTSpam.report({
            collection_id: colId,
            source: 'mask-network',
            status: 'reporting',
        })
        return res.code === 200
    }, [colId])

    const { showSnackbar } = useCustomSnackbar()
    const promptReport = useCallback(async () => {
        const confirmed = await ConfirmDialog.openAndWaitForClose({
            title: <Trans>Report NFT Scam Contract?</Trans>,
            message: (
                <Trans>
                    Are you sure to report{' '}
                    <Select
                        value={collection?.name ? 'hasName' : 'noName'}
                        _hasName={collection?.name}
                        _noName="this NFT"
                    />
                    ? After confirmed, this NFT will be marked as spam.
                </Trans>
            ),
            confirmVariant: 'warning',
        })
        if (!confirmed || !colId) return
        const result = await reportSpam()
        showSnackbar(<Trans>Report Spam</Trans>, {
            variant: result ? 'success' : 'error',
            message: result ? <Trans>Spam reported.</Trans> : <Trans>Failed to report spam.</Trans>,
        })
    }, [colId, reportSpam, collection?.name])
    const isSpam = collection?.isSpam

    return {
        isReporting: state.loading,
        isSpam,
        collection,
        promptReport,
    }
}
