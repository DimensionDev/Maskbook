import { NetworkPluginID } from '@masknet/shared-base'
import { useCustomSnackbar } from '@masknet/theme'
import { NFTSpam, SPAM_SCORE, SimpleHashEVM, SimpleHashSolana } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useAsyncFn } from 'react-use'
import { ConfirmDialog } from '../UI/modals/modals.js'
import { Select, Trans } from '@lingui/macro'

interface Options {
    address?: string
    chainId?: number
    pluginID?: NetworkPluginID
    collectionId?: string
}

/**
 * collectionId is more accurate
 */
export function useReportSpam({ pluginID, chainId, address, collectionId }: Options) {
    const isSolana = pluginID === NetworkPluginID.PLUGIN_SOLANA
    const { data: collectionByAddress } = useQuery({
        enabled: !collectionId && !isSolana,
        queryKey: ['simple-hash', 'collection', chainId, address],
        queryFn: async () => {
            if (!address || !chainId) return null
            return SimpleHashEVM.getCollectionByContractAddress(address, { chainId })
        },
    })
    const { data: collectionById } = useQuery({
        enabled: !!collectionId && !isSolana,
        queryKey: ['simple-hash', 'collection', collectionId],
        queryFn: async () => {
            if (!collectionId) return null
            return SimpleHashEVM.getSimpleHashCollection(collectionId)
        },
    })
    const { data: solanaCollection } = useQuery({
        enabled: isSolana,
        queryKey: ['simple-hash', 'solana-collection', 'by-mint-address', address],
        queryFn: async () => {
            if (!address) return null
            const asset = await SimpleHashSolana.getAsset(address, address)
            if (!asset?.collection?.id) return null
            return SimpleHashEVM.getSimpleHashCollection(asset.collection.id)
        },
    })
    const collection = isSolana ? solanaCollection : collectionById || collectionByAddress
    const colId = collectionId || collection?.collection_id
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
    const isSpam = !!collection && collection.spam_score !== null && collection.spam_score > SPAM_SCORE

    return {
        isReporting: state.loading,
        isSpam,
        collection,
        promptReport,
    }
}
