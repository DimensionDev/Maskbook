import { range, shuffle } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { PluginServices } from '../API.js'

// How many fields should be filled by the user?
const PUZZLE_SIZE = 5

// The total count of mnemonic words.
const TOTAL_SIZE = 12

export function useMnemonicWordsPuzzle() {
    const [answerWords, setAnswerWords] = useState<string[]>([])
    const { value: words = [], retry: wordsRetry } = useAsyncRetry(
        () => PluginServices.Wallet.createMnemonicWords(),
        [],
    )

    // #region generate some mask indexes randomly which should be filled by the user
    const [tick, setTick] = useState(0)
    const indexes = useMemo(() => shuffle(range(TOTAL_SIZE)).slice(0, PUZZLE_SIZE), [tick, words])
    // #endregion

    // #region a serial of words and the user gonna complete those empty ones
    const puzzleWords = useMemo(() => {
        const words_ = words.slice(0)
        for (let i = 0; i < indexes.length; i += 1) words_[indexes[i]] = answerWords[i] ?? ''
        return words_
    }, [answerWords, indexes, words])
    // #endregion

    const answerCallback = useCallback(
        (word: string, index: number) => {
            setAnswerWords((x) => {
                const words_ = x.slice(0)
                words_[index] = word
                return words_
            })
        },
        [answerWords],
    )

    const resetCallback = useCallback(() => {
        setAnswerWords([])
        setTick((x) => x + 1)
    }, [])

    const refreshCallback = wordsRetry

    return { words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback } as const
}
