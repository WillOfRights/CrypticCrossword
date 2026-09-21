/**
 * Helper function to join class names that are not a falsy value.
 */
export default function joinClass(
    ...classNames: (string | false | null | undefined | 0)[]
): string {
    return classNames.filter(Boolean).join(' ');
}