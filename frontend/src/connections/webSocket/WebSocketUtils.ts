export const PUZZLE_WS_URL_SUFFIX = 'ws/puzzle';

/**
 * Helper function to get the web socket url given the suffix for the site.
 */
export function getWsUrl(suffix: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/${suffix}`;
}
