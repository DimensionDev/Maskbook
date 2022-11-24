import type { FontSize } from '@masknet/web3-shared-base'
import { useThemeSettings } from '../../components/DataSource/useActivatedUI.js'

export interface TwitterStyle {
    buttonSize: number
    iconSize: number
    fontSize: number
    lineHeight: string
    marginBottom: number
}

export const ButtonStyle: Record<FontSize, TwitterStyle> = {
    ['xSmall']: {
        buttonSize: 32,
        iconSize: 18,
        fontSize: 14,
        lineHeight: '18px',
        marginBottom: 11,
    },
    ['small']: { buttonSize: 34, iconSize: 19, fontSize: 14, lineHeight: '19px', marginBottom: 11 },
    ['normal']: { buttonSize: 36, iconSize: 20, fontSize: 15, lineHeight: '20px', marginBottom: 12 },
    ['large']: { buttonSize: 40, iconSize: 22, fontSize: 17, lineHeight: '22px', marginBottom: 13 },
    ['xLarge']: { buttonSize: 43, iconSize: 24, fontSize: 18, lineHeight: '24px', marginBottom: 14 },
}

export const useButtonStyles = () => {
    const themeSettings = useThemeSettings()
    return ButtonStyle[themeSettings.size]
}
