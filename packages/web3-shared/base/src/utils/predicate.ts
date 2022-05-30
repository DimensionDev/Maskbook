export function createPredicate<T, P extends T>(candidates: T[]) {
    return (candidate: T): candidate is P => candidates.includes(candidate)
}
