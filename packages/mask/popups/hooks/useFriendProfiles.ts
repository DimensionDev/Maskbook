import { EMPTY_LIST, type ProfileIdentifier } from '@masknet/shared-base'
import { useMemo } from 'react'
import type { Profile } from '../pages/Friends/common.js'

export function useFriendProfiles(_seen: boolean, _nextId?: string, profile?: ProfileIdentifier): Profile[] {
    return useMemo(() => EMPTY_LIST as Profile[], [profile])
}
