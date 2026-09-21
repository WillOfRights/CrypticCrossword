/**
 * Inevitable helper function to join class names that are not empty.
 */
export default function joinClass(...classNames: String[]) {
    return classNames.filter(Boolean).join(' ');
}