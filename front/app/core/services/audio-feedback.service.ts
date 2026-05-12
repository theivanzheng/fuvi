import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioFeedbackService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly clickPath = '/assets/audio/click.wav';
  private readonly celebrationPath = '/assets/audio/winning.wav';

  playClick(): void {
    this.playAudio(this.clickPath, 0.45);
  }

  playCelebration(): void {
    this.playAudio(this.celebrationPath, 0.7);
  }

  private playAudio(path: string, volume: number): void {
    if (!this.isBrowser) {
      return;
    }

    const audio = new Audio(path);
    audio.volume = volume;
    audio.preload = 'auto';
    void audio.play().catch(() => undefined);
  }
}
