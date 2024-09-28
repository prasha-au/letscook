import { Component, Input } from '@angular/core';
import { Recipe } from '../../../../interfaces';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-recipe-video',
  template: `

  <div class="container">
    <div *ngIf="video">
      <div class="youtubeframe" *ngIf="video.type === 'youtube'">
        <iframe width="100%" [src]="getSafeUrl('https://www.youtube.com/embed/'+ video.id)"></iframe>
      </div>
    </div>
  </div>

  `,
  styles: [
    `.youtubeframe {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
    }`,
    `.youtubeframe iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }`
  ]
})
export class VideoComponent {

  @Input() video?: Recipe['video'];

  private cachedUrl?: { rawUrl: string; safeUrl: SafeResourceUrl };

  constructor(private readonly sanitizer: DomSanitizer) { }

  public getSafeUrl(url: string): SafeResourceUrl {
    if (this.cachedUrl?.rawUrl !== url) {
      this.cachedUrl = { rawUrl: url, safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url) };
    }
    return this.cachedUrl.safeUrl;
  }

}
