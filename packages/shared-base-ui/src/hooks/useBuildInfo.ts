/// <reference types="react/experimental" />
import { env } from '@masknet/flags'

/** @internal */
// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix
export function useBuildInfo_raw() {
    return env
}
