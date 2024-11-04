import { useCallback, useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { produce } from 'immer'
import { range, shuffle, remove, clone } from 'lodash-es'
import { EMPTY_LIST } from '@masknet/shared-base'
import Services from '#services'

const PUZZLE_SIZE = 3

const TOTAL_SIZE = 12

export interface PuzzleWord {
    index: number
    rightAnswer: string
    options: string[]
}

export function useMnemonicWordsPuzzle() {
    const { value: words = EMPTY_LIST, retry: wordsRetry } = useAsyncRetry(
        () => Services.Wallet.createMnemonicWords(),
        [],
    )

    const indexes = useMemo(
        () =>
            shuffle(range(TOTAL_SIZE))
                .slice(0, PUZZLE_SIZE)
                .sort((a, b) => a - b),
        [words],
    )

    const [puzzleAnswer, setPuzzleAnswer] = useState<{ [key: number]: string }>({})

    const [isMatched, setIsMatch] = useState<boolean | undefined>()

    const puzzleWordList: PuzzleWord[] = useMemo(() => {
        let restWords = remove(clone(words), (_word, index) => !indexes.includes(index))

        return indexes.map((index) => {
            const randomWords = shuffle(restWords).slice(0, 2)
            const result = {
                index,
                rightAnswer: words[index],
                options: shuffle(randomWords.concat(words[index])),
            }
            // eslint-disable-next-line react-compiler/react-compiler
            restWords = remove(clone(restWords), (word) => !randomWords.includes(word))

            return result
        })
    }, [words, indexes])

    const answerCallback = useCallback((index: number, word: string) => {
        setPuzzleAnswer(
            produce((draft) => {
                draft[index] = word
            }),
        )
    }, [])

    const verifyAnswerCallback = useCallback(
        (callback?: () => void) => {
            const puzzleAnswerEntries = Object.entries(puzzleAnswer)
            const matched =
                puzzleAnswerEntries.length === 3 &&
                puzzleAnswerEntries.every((entry) => {
                    return words[Number(entry[0])] === entry[1]
                })
            setIsMatch(matched)

            if (matched) callback?.()
        },
        [puzzleAnswer, words, setIsMatch],
    )

    const refreshCallback = useCallback(() => {
        wordsRetry()
        setIsMatch(undefined)
        setPuzzleAnswer({})
    }, [wordsRetry])

    return {
        words,
        refreshCallback,
        puzzleWordList,
        answerCallback,
        puzzleAnswer,
        verifyAnswerCallback,
        isMatched,
    } as const
}
