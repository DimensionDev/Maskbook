import React from 'react';
/**
 * Create a typed story of a given component
 *
 * @example
 * const { meta, of } = story(Button)
 * export default meta({})
 * export const story1 = of({})
 * export const story2 = of({})
 */
export function story(Component) {
    return {
        meta(meta) {
            return { ...meta, component: Component };
        },
        of(annotations = {}) {
            const copy = (props) => React.createElement(Component, { children: annotations.children, ...props });
            Object.assign(copy, annotations);
            return copy;
        },
    };
}
//# sourceMappingURL=story-of.js.map