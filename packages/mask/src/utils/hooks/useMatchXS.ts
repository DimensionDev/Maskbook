// see https://github.com/import-js/eslint-plugin-import/issues/2288
import { Theme, useMediaQuery } from '@mui/material'

export function useMatchXS() {
    // see https://github.com/import-js/eslint-plugin-import/issues/2288
    return useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), {
        defaultMatches: process.env.architecture === 'app' ? true : undefined,
    })
}
