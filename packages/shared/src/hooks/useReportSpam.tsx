import { useCustomSnackbar } from '@masknet/theme'
import { NFTSpam, SPAM_SCORE, SimpleHashEVM } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useAsyncFn } from 'react-use'
import { ConfirmDialog } from '../UI/modals/modals.js'
import { useSharedTrans } from '../locales/i18n_generated.js'

interface Options {
    address?: string
    chainId?: number
    collectionId?: string
}

/**
 * collectionId is more accurate
 */
export function useReportSpam({ address, chainId, collectionId }: Options) {
    const t = useSharedTrans()
    const { data: collectionByAddress } = useQuery({
        enabled: !collectionId,
        queryKey: ['simple-hash', 'collection', chainId, address],
        queryFn: async () => {
            if (!address || !chainId) return null
            return SimpleHashEVM.getCollectionByContractAddress(address, { chainId })
        },
    })
    const { data: collectionById } = useQuery({
        enabled: !!collectionId,
        queryKey: ['simple-hash', 'collection', collectionId],
        queryFn: async () => {
            if (!collectionId) return null
            return SimpleHashEVM.getSimpleHashCollection(collectionId)
        },
    })
    const collection = collectionById || collectionByAddress
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
            title: t.report_nft(),
            message: (
                <div style={{ wordBreak: 'keep-all' }}>
                    {t.confirm_to_report_nft({ name: collection?.name || 'this NFT' })}
                </div>
            ),
            confirmVariant: 'warning',
        })
        if (!confirmed || !colId) return
        const result = await reportSpam()
        showSnackbar(t.report_spam(), {
            variant: result ? 'success' : 'error',
            message: result ? t.report_spam_success() : t.report_spam_fail(),
        })
    }, [colId, reportSpam, collection?.name])
    const isSpam = !!collection && collection.spam_score !== null && collection?.spam_score > SPAM_SCORE

    return {
        isReporting: state.loading,
        isSpam,
        collection,
        promptReport,
    }
}
