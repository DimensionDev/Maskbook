const calculateOdd = (kef: number, marginality: number): number => {
    const obr_kef = 1 / (1 - 1 / kef)
    const margin_eur = 1 + marginality
    const a = (margin_eur * (obr_kef - 1)) / (kef - 1)
    const b = ((obr_kef - 1) / (kef - 1) + 1) * (margin_eur - 1)
    const c = 2 - margin_eur
    const result = (-1 * b + (b ** 2 + 4 * a * c) ** (1 / 2)) / (2 * a) + 1
    console.log('kef: ', kef)
    console.log('marginality: ', marginality)
    console.log('obr_kef: ', obr_kef)
    console.log('margin_eur: ', margin_eur)
    console.log('a: ', a)
    console.log('b: ', b)
    console.log('c: ', c)
    console.log('result: ', result)

    return result
}

// calculate odds based on fetched conditions data. Note that "fundBank" values change over time.
// to calculate actual odds use "calculateActualOdds" method
const calculateInitialOdds = (funds: number[], marginality: number): [number, number] => {
    console.log('funds inside: ', funds)
    console.log('marginality inside: ', marginality)
    console.log('typeof funds 0 inside: ', typeof funds[0])
    console.log('typeof funds 1 inside: ', typeof funds[1])
    console.log('typeof marginality inside: ', typeof marginality)
    console.log('calculateOdd(funds[0], marginality) ', calculateOdd(funds[0], marginality))
    console.log('calculateOdd(funds[1], marginality) ', calculateOdd(funds[1], marginality))

    return [calculateOdd(funds[0], marginality), calculateOdd(funds[1], marginality)]
}
export default calculateInitialOdds
