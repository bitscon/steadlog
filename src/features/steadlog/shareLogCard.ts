import { format } from 'date-fns';

import type { TimelineEntry } from '@/features/steadlog/types';

const SHARE_CARD_WIDTH = 1200;
const SHARE_CARD_HEIGHT = 630;
const SHARE_CARD_PADDING = 72;

export type LogCardPayload = {
  title: string;
  subtitle?: string;
  timestamp: string;
  actionId: string;
};

function trimLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function splitIntoLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const clean = trimLine(text);
  if (!clean) return [];

  const words = clean.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word);
      current = '';
    }

    if (lines.length === maxLines) {
      break;
    }
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }

  if (lines.length === maxLines && words.length > 0) {
    const consumed = lines.join(' ').split(' ').length;
    if (consumed < words.length) {
      const last = lines[maxLines - 1] ?? '';
      let ellipsized = `${last}...`;
      while (ctx.measureText(ellipsized).width > maxWidth && ellipsized.length > 3) {
        ellipsized = `${ellipsized.slice(0, -4)}...`;
      }
      lines[maxLines - 1] = ellipsized;
    }
  }

  return lines;
}

function drawCard(payload: LogCardPayload): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to generate share card.');
  }

  const gradient = ctx.createLinearGradient(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
  gradient.addColorStop(0, '#f4f8ef');
  gradient.addColorStop(1, '#e8f0e0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

  ctx.fillStyle = '#3f5f2f';
  ctx.font = '700 34px Georgia, serif';
  ctx.fillText('STEADLOG', SHARE_CARD_PADDING, 88);

  const contentMaxWidth = SHARE_CARD_WIDTH - SHARE_CARD_PADDING * 2;
  let y = 178;

  ctx.fillStyle = '#1c2d12';
  ctx.font = '700 68px "Trebuchet MS", sans-serif';
  const titleLines = splitIntoLines(ctx, payload.title, contentMaxWidth, 2);
  for (const line of titleLines) {
    ctx.fillText(line, SHARE_CARD_PADDING, y);
    y += 84;
  }

  if (payload.subtitle) {
    y += 10;
    ctx.fillStyle = '#2f4030';
    ctx.font = '500 42px "Trebuchet MS", sans-serif';
    const subtitleLines = splitIntoLines(ctx, payload.subtitle, contentMaxWidth, 2);
    for (const line of subtitleLines) {
      ctx.fillText(line, SHARE_CARD_PADDING, y);
      y += 56;
    }
  }

  const loggedAt = format(new Date(payload.timestamp), 'MMMM d, yyyy');
  ctx.fillStyle = '#435343';
  ctx.font = '500 36px "Trebuchet MS", sans-serif';
  ctx.fillText(`Logged ${loggedAt}`, SHARE_CARD_PADDING, SHARE_CARD_HEIGHT - 110);

  ctx.fillStyle = '#3f5f2f';
  ctx.font = '700 30px "Trebuchet MS", sans-serif';
  ctx.fillText('steadlog.app', SHARE_CARD_PADDING, SHARE_CARD_HEIGHT - 56);

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to build image blob.'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}

export function buildActionShareLink(actionId: string): string {
  const url = new URL('/timeline', window.location.origin);
  url.searchParams.set('action', actionId);
  return url.toString();
}

export function buildActionShareText(payload: LogCardPayload): string {
  const loggedAt = format(new Date(payload.timestamp), 'MMMM d, yyyy');
  const detail = payload.subtitle ? `\n${payload.subtitle}` : '';
  return `STEADLOG\n${payload.title}${detail}\n\nLogged ${loggedAt}`;
}

export async function generateLogCardImageBlob(payload: LogCardPayload): Promise<Blob> {
  const canvas = drawCard(payload);
  return canvasToBlob(canvas);
}

export function toLogCardPayload(entry: TimelineEntry): LogCardPayload | null {
  if (entry.entryType !== 'action' || !entry.action || entry.syncState === 'pending') {
    return null;
  }

  return {
    title: entry.title,
    subtitle: entry.subtitle,
    timestamp: entry.timestamp,
    actionId: entry.action.id,
  };
}
