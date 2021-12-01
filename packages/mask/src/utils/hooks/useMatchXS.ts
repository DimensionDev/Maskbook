// see https://github.com/import-js/eslint-plugin-import/issues/2288
// eslint-disable-next-line import/no-deprecated
import { Theme, useMediaQuery } from '@mui/material'

export function useMatchXS() {
    // see https://github.com/import-js/eslint-plugin-import/issues/2288
    // eslint-disable-next-line import/no-deprecated
    return useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), {
        defaultMatches: process.env.architecture === 'app' ? true : undefined,
    })
}
