import { memoizePromise } from '@dimensiondev/kit'
import { downloadUrl } from '../../../utils/utils'

export const steganographyDownloadImage = memoizePromise(
    async (url: string) => (await downloadUrl(url)).arrayBuffer(),
    void 0,
)
