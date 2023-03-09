import { type Theme, useMediaQuery } from '@mui/material'

export function useMatchXS() {
    return useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
}
