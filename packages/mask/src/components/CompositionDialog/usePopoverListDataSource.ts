export function usePopoverListDataSource() {
    return {
        visibilityPopperList: [
            { type: 'all', title: 'All', subTitle: 'Everyone', personaRequired: false, event: null },
            { type: 'private', title: 'Private', subTitle: 'Just Me', personaRequired: true, event: null },
            {
                type: 'share',
                title: 'Share with',
                subTitle: 'Just Selected Contacts',
                personaRequired: true,
                event: null,
            },
        ],
        methodsPopperList: [
            { type: 'text', title: 'Text', subTitle: 'Use text encryption', personaRequired: false, event: null },
            {
                type: 'image',
                title: 'Image',
                subTitle: 'Encrypt messages in images',
                personaRequired: false,
                event: null,
            },
        ],
    }
}
