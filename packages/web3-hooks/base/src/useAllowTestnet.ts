export function useAllowTestnet(): boolean {
    return process.env.NODE_ENV === 'development'
}
