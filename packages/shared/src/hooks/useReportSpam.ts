import { useCustomSnackbar } from '@masknet/theme'
import { NFTSpam, SPAM_SCORE, SimpleHashEVM } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useAsyncFn } from 'react-use'
import { ConfirmDialog } from '../UI/modals/modals.js'
import { useSharedTrans } from '../locales/i18n_generated.js'

export function useReportSpam(address?: string, chainId?: number) {
    const t = useSharedTrans()
    const { data: collection, isLoading } = useQuery({
        queryKey: ['simple-hash', 'collection', chainId, address],
        queryFn: async () => {
            if (!address || !chainId) return null
            return SimpleHashEVM.getCollectionByContractAddress(address, { chainId })
        },
    })
    const collectionId = collection?.collection_id
    const [state, reportSpam] = useAsyncFn(async () => {
        if (!collectionId) return
        const res = await NFTSpam.report({
            collection_id: collectionId,
            source: 'mask-network',
            status: 'reporting',
        })
        return res.code === 200
    }, [collectionId])

    const { showSnackbar } = useCustomSnackbar()
    const promptReport = useCallback(async () => {
        const confirmed = await ConfirmDialog.openAndWaitForClose({
            title: t.report_nft(),
            message: t.confirm_to_report_nft(),
            confirmVariant: 'warning',
        })
        if (!confirmed || !collectionId) return
        const result = await reportSpam()
        showSnackbar(t.report_spam(), {
            variant: result ? 'success' : 'error',
            message: result ? t.report_spam_success() : t.report_spam_fail(),
        })
    }, [collectionId, reportSpam])
    const isSpam = !!collection && collection.spam_score !== null && collection?.spam_score > SPAM_SCORE
    const isReliable = isLoading || !isSpam
    // Is surely not spam
    const isUndetermined = !!collection && collection.spam_score === null

    return {
        isReporting: state.loading,
        isReliable,
        isSpam,
        isUndetermined,
        collection,
        promptReport,
    }
}
