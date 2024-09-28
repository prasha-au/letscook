import { Component, Input, OnInit } from '@angular/core';
import { Recipe } from '../../../../interfaces';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-recipe-video',
  template: `

  <div class="container">
    <div *ngIf="video">
      <div class="youtubeframe" *ngIf="video.type === 'youtube'">
        <iframe width="100%" [src]="sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + video.id)"></iframe>
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
export class VideoComponent implements OnInit {

  @Input() video?: Recipe['video'];

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

}
