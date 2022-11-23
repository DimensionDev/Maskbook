import { useThemeSize } from '@masknet/plugin-infra'

export interface TwitterStyle {
    buttonSize: number
    iconSize: number
    fontSize: number
    lineHeight: string
}

export const ButttonStyle: Record<string, TwitterStyle> = {
    ['xSmall']: {
        buttonSize: 32,
        iconSize: 18,
        fontSize: 14,
        lineHeight: '18px',
    },
    ['small']: { buttonSize: 34, iconSize: 19, fontSize: 14, lineHeight: '19px' },
    ['normal']: { buttonSize: 36, iconSize: 20, fontSize: 15, lineHeight: '20px' },
    ['large']: { buttonSize: 40, iconSize: 22, fontSize: 17, lineHeight: '22px' },
    ['xLarge']: { buttonSize: 43, iconSize: 24, fontSize: 18, lineHeight: '24px' },
}

export const useButtonStyles = () => {
    const themeSize = useThemeSize()
    return ButttonStyle[themeSize ?? 'normal']
}
