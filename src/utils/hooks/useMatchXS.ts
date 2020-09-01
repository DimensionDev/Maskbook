import { Theme, useMediaQuery } from '@material-ui/core'

export function useMatchXS() {
    return useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'), {
        defaultMatches: process.env.resolution === 'mobile' ? true : undefined,
    })
}
