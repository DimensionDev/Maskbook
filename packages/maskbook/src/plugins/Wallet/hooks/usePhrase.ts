import { first } from 'lodash-es'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { WalletMessages, WalletRPC } from '../messages'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { PhraseRecord } from '../database/types'
import { PhrasesComparer } from '../helpers'
import { useWallet } from './useWallet'

//#region tracking wallets
const phrasesRef = new ValueRef<PhraseRecord[]>([], PhrasesComparer)
async function revalidate() {
    phrasesRef.value = await WalletRPC.getPhrases()
}
WalletMessages.events.phrasesUpdated.on(revalidate)
revalidate()
//#endregion

export function usePhrase(address?: string) {
    const wallet = useWallet(address)
    const phrases = useValueRef(phrasesRef)
    const earliestPhrase = first(phrases.sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime()))
    return (
        (wallet?.mnemonic ? phrases.find((x) => x.mnemonic.join(' ') === wallet.mnemonic.join(' ')) : earliestPhrase) ??
        earliestPhrase
    )
}

export function usePhrases() {
    const phrases = useValueRef(phrasesRef)
    return phrases
}
