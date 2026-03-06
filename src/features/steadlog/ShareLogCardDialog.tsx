import { format } from 'date-fns';
import { Copy, Download, Loader2, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  buildActionShareLink,
  buildActionShareText,
  generateLogCardImageBlob,
  toLogCardPayload,
} from '@/features/steadlog/shareLogCard';
import type { TimelineEntry } from '@/features/steadlog/types';

interface ShareLogCardDialogProps {
  entry: TimelineEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getShareErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return '';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Unable to share this log right now.';
}

export function ShareLogCardDialog({ entry, open, onOpenChange }: ShareLogCardDialogProps) {
  const [sharing, setSharing] = useState(false);
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const payload = useMemo(() => (entry ? toLogCardPayload(entry) : null), [entry]);
  const shareLink = useMemo(() => (payload ? buildActionShareLink(payload.actionId) : ''), [payload]);
  const shareText = useMemo(() => (payload ? buildActionShareText(payload) : ''), [payload]);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const canCopyLink = typeof navigator !== 'undefined' && !!navigator.clipboard;

  const buildImageFile = async () => {
    if (!payload) {
      throw new Error('No action selected.');
    }

    const imageBlob = await generateLogCardImageBlob(payload);
    return new File([imageBlob], `steadlog-log-${payload.actionId.slice(0, 8)}.png`, {
      type: 'image/png',
    });
  };

  const onNativeShare = async () => {
    if (!payload || !canNativeShare) {
      toast.error('Native sharing is unavailable on this device.');
      return;
    }

    setSharing(true);
    try {
      const imageFile = await buildImageFile();
      const shareData: ShareData = {
        title: 'SteadLog',
        text: shareText,
        url: shareLink,
      };

      if (navigator.canShare?.({ files: [imageFile] })) {
        await navigator.share({
          ...shareData,
          files: [imageFile],
        });
      } else {
        await navigator.share(shareData);
      }

      toast.success('Log shared.');
    } catch (error) {
      const message = getShareErrorMessage(error);
      if (message) {
        toast.error(message);
      }
    } finally {
      setSharing(false);
    }
  };

  const onCopyLink = async () => {
    if (!payload || !canCopyLink) {
      toast.error('Clipboard access is unavailable.');
      return;
    }

    setCopying(true);
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied.');
    } catch (error) {
      toast.error(getShareErrorMessage(error));
    } finally {
      setCopying(false);
    }
  };

  const onDownloadImage = async () => {
    if (!payload) {
      return;
    }

    setDownloading(true);
    try {
      const imageBlob = await generateLogCardImageBlob(payload);
      const objectUrl = URL.createObjectURL(imageBlob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `steadlog-${format(new Date(payload.timestamp), 'yyyyMMdd-HHmm')}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success('Share card downloaded.');
    } catch (error) {
      toast.error(getShareErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Log Card</DialogTitle>
          <DialogDescription>
            Share this homestead record as a simple card. No social feed, just useful information.
          </DialogDescription>
        </DialogHeader>

        {!payload ? (
          <p className="text-sm text-muted-foreground">Only synced action logs can be shared.</p>
        ) : (
          <>
            <div className="rounded-md border bg-[#f4f8ef] p-5 space-y-4">
              <p className="text-xs font-semibold tracking-[0.25em] text-[#3f5f2f]">STEADLOG</p>
              <h3 className="text-2xl font-semibold leading-tight text-[#1c2d12]">{payload.title}</h3>
              {payload.subtitle && <p className="text-sm whitespace-pre-wrap text-[#2f4030]">{payload.subtitle}</p>}
              <p className="text-sm text-[#435343]">Logged {format(new Date(payload.timestamp), 'MMMM d, yyyy')}</p>
              <p className="text-sm font-semibold text-[#3f5f2f]">steadlog.app</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void onNativeShare()} disabled={!canNativeShare || sharing || downloading || copying}>
                {sharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                Share
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void onCopyLink()}
                disabled={!canCopyLink || copying || sharing || downloading}
              >
                {copying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
                Copy Link
              </Button>
              <Button type="button" variant="outline" onClick={() => void onDownloadImage()} disabled={downloading || sharing || copying}>
                {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download Image
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
