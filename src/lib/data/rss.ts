import RSSParser from 'rss-parser';
import { Sport, InjuryNews, TradeNews } from '@/types';

const parser = new RSSParser();

// RotoWire RSS feeds for injury/transaction news
const ROTOWIRE_FEEDS: Record<string, string> = {
  nfl: 'https://www.rotowire.com/rss/news.php?sport=NFL',
  nba: 'https://www.rotowire.com/rss/news.php?sport=NBA',
  mlb: 'https://www.rotowire.com/rss/news.php?sport=MLB',
  nhl: 'https://www.rotowire.com/rss/news.php?sport=NHL',
};

interface RSSItem {
  title?: string;
  contentSnippet?: string;
  content?: string;
  pubDate?: string;
  link?: string;
}

export async function fetchInjuryNews(sport: Sport): Promise<InjuryNews[]> {
  const feedUrl = ROTOWIRE_FEEDS[sport];
  if (!feedUrl) return [];

  try {
    const feed = await parser.parseURL(feedUrl);
    const injuries: InjuryNews[] = [];

    for (const item of feed.items.slice(0, 10)) {
      const rssItem = item as RSSItem;
      const title = rssItem.title || '';
      const description = rssItem.contentSnippet || rssItem.content || '';

      // Filter for injury-related items
      const injuryKeywords = ['injury', 'injured', 'out', 'questionable', 'doubtful', 'day-to-day', 'IL', 'IR', 'concussion', 'hamstring', 'knee', 'ankle', 'surgery'];
      const isInjury = injuryKeywords.some((kw) =>
        title.toLowerCase().includes(kw) || description.toLowerCase().includes(kw)
      );

      if (isInjury) {
        injuries.push({
          sport,
          playerName: title.split(':')[0]?.trim() || title,
          team: '', // extracted by AI later
          status: extractStatus(description),
          description: description.slice(0, 200),
          timestamp: rssItem.pubDate || new Date().toISOString(),
        });
      }
    }

    return injuries;
  } catch (error) {
    console.error(`Failed to fetch RSS for ${sport}:`, error);
    return [];
  }
}

export async function fetchTradeNews(sport: Sport): Promise<TradeNews[]> {
  const feedUrl = ROTOWIRE_FEEDS[sport];
  if (!feedUrl) return [];

  try {
    const feed = await parser.parseURL(feedUrl);
    const trades: TradeNews[] = [];

    for (const item of feed.items.slice(0, 10)) {
      const rssItem = item as RSSItem;
      const title = rssItem.title || '';
      const description = rssItem.contentSnippet || rssItem.content || '';

      const tradeKeywords = ['trade', 'traded', 'signs', 'signed', 'waived', 'released', 'acquired', 'deal', 'free agent', 'contract'];
      const isTrade = tradeKeywords.some((kw) =>
        title.toLowerCase().includes(kw) || description.toLowerCase().includes(kw)
      );

      if (isTrade) {
        trades.push({
          sport,
          headline: title,
          description: description.slice(0, 300),
          teams: [], // extracted by AI later
          timestamp: rssItem.pubDate || new Date().toISOString(),
        });
      }
    }

    return trades;
  } catch (error) {
    console.error(`Failed to fetch trade news for ${sport}:`, error);
    return [];
  }
}

function extractStatus(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('out for season') || lower.includes('season-ending')) return 'out for season';
  if (lower.includes('out')) return 'out';
  if (lower.includes('doubtful')) return 'doubtful';
  if (lower.includes('questionable')) return 'questionable';
  if (lower.includes('day-to-day')) return 'day-to-day';
  if (lower.includes('ir') || lower.includes('injured reserve')) return 'IR';
  return 'unknown';
}

export async function fetchAllNews(sports: Sport[]) {
  const results = await Promise.all(
    sports.map(async (sport) => {
      const [injuries, trades] = await Promise.all([
        fetchInjuryNews(sport),
        fetchTradeNews(sport),
      ]);
      return { sport, injuries, trades };
    })
  );

  return {
    injuries: results.flatMap((r) => r.injuries),
    trades: results.flatMap((r) => r.trades),
  };
}
