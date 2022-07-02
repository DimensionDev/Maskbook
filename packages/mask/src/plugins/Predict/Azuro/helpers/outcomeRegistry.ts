import type { AzuroGame } from '@azuro-protocol/sdk'

const shortenCompetitorName = (name: string) => {
    const wordCount = name.split(' ').length

    if (wordCount === 3) {
        const words = name.split(' ')

        return words.map((word) => word.charAt(0)).join('')
    }

    if (wordCount === 2) {
        const [name1, name2] = name.split(' ')

        return name1.slice(0, 3) + name2.charAt(0)
    }

    return name.slice(0, 3)
}

type Props = AzuroGame

const shortenedOutcomeDisplay = {
    W1: ({ participants }: Props) => `${shortenCompetitorName(participants[0].name)} win`,
    W2: ({ participants }: Props) => `${shortenCompetitorName(participants[1].name)} win`,
    Draw: (props: Props) => 'Draw',
    '1X': ({ participants }: Props) => `${shortenCompetitorName(participants[0].name)} win or draw`,
    '12': ({ participants }: Props) =>
        `${shortenCompetitorName(participants[0].name)} win or ${shortenCompetitorName(participants[1].name)} win`,
    '2X': ({ participants }: Props) => `${shortenCompetitorName(participants[1].name)} win or draw`,
}

const outcomeRegistry: Record<number, (props: Props) => string> = {
    1: shortenedOutcomeDisplay.W1,
    2: (props: Props) => 'Draw',
    3: shortenedOutcomeDisplay.W2,
    4: shortenedOutcomeDisplay['1X'],
    5: shortenedOutcomeDisplay['12'],
    6: shortenedOutcomeDisplay['2X'],
    7: (props: Props) => 'Handicap 1',
    8: (props: Props) => 'Handicap 2',
    9: (props: Props) => 'Over',
    10: (props: Props) => 'Under',
    11: (props: Props) => 'Over',
    12: (props: Props) => 'Under',
    13: (props: Props) => 'Over',
    14: (props: Props) => 'Under',
    180: (props: Props) => 'Yes',
    181: (props: Props) => 'No',
    182: (props: Props) => 'Yes',
    183: (props: Props) => 'No',
    184: (props: Props) => 'Yes',
    185: (props: Props) => 'No',
    186: (props: Props) => 'Yes',
    187: (props: Props) => 'No',
    424: shortenedOutcomeDisplay.W1,
    425: (props: Props) => 'Draw',
    426: shortenedOutcomeDisplay.W2,
    731: (props: Props) => 'Correct Score',
    10000: (props: Props) => 'W1/W1',
    10001: (props: Props) => 'W1/X',
    10002: (props: Props) => 'W1/W2',
    10003: (props: Props) => 'X/W1',
    10004: (props: Props) => 'X/X',
    10005: (props: Props) => 'X/W2',
    10006: (props: Props) => 'W2/W1',
    10007: (props: Props) => 'W2/X',
    10008: (props: Props) => 'W2/W2',
    10009: shortenedOutcomeDisplay.W1,
    10010: shortenedOutcomeDisplay.W2,
}

export default outcomeRegistry
