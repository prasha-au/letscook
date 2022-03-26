import {ResolvedUrl} from '../../interfaces';


export const EXTRA_PAGE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36',
  'upgrade-insecure-requests': '1',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'en-US,en;q=0.9,en;q=0.8',
} as const;


export function resolveUrl(query: string): ResolvedUrl | null {
  let url: URL;
  try {
    url = new URL(query);
  } catch (e) {
    return null;
  }
  return {
    id: url.hostname.replace(/^www\./, '').replace(/\./g, '_') + url.pathname.replace(/\/$/, '').replace(/\//g, '_'),
    url: `${url.origin}${url.pathname}`,
  };
}

