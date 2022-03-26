import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, NEVER, Observable } from 'rxjs';
import { ParseRequest, ResolvedUrl } from '../../../../interfaces';
import { DataService } from '../data.service';



type LoadState = 'initializing' | 'checking_for_existing' | 'requesting' | 'processing' | 'redirecting';


@Component({
  selector: 'app-loader',
  template: `
    <div class="d-flex w-100 h-100">
      <div class="container mt-5">
        <div *ngIf="!resolvedUrl">
          Unable to load {{rawUrl}}
        </div>

        <div *ngIf="resolvedUrl" [ngSwitch]="loadState">
          <div *ngSwitchCase="'checking_for_existing'">
            Loading...
          </div>
          <div *ngSwitchCase="'redirecting'">
            Redirecting...
          </div>
          <div *ngSwitchCase="'requesting'">
            Redirecting...
          </div>


          <div *ngSwitchCase="'processing'">

            <div>We are gathering information from {{resolvedUrl.url}}</div>

            <div *ngIf="processingStatus | async; let status">

              <div [ngSwitch]="status.status">

                <span *ngSwitchCase="'pending'">pending...</span>
                <span *ngSwitchCase="'active'">Active...</span>
                <span *ngSwitchCase="'done'">
                  <span *ngIf="status.success">Done!</span>
                  <span *ngIf="!status.success">Failed!</span>
                </span>
              </div>

            </div>

          </div>
        </div>



      </div>
    </div>
  `,
  styles: [
  ]
})
export class LoaderComponent implements OnInit {

  public rawUrl?: string;
  public resolvedUrl?: ResolvedUrl;

  public loadState?: LoadState;


  public processingStatus: Observable<ParseRequest | null> = NEVER;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
  ) { }

  async ngOnInit(): Promise<void> {
    const query = this.route.snapshot.queryParamMap.get('url');
    if (!query) {
      return;
    }
    this.rawUrl = query;
    const resolvedUrl = this.dataService.resolveUrl(query);
    if (resolvedUrl == null) {
      return;
    }
    this.resolvedUrl = resolvedUrl;


    this.loadState = 'checking_for_existing';
    this.processingStatus = this.dataService.getRecipeParseStatus(resolvedUrl.id);


    const existingStatus = await firstValueFrom(this.processingStatus);
    if (existingStatus?.status === 'done' && existingStatus.success) {
      this.loadState = 'redirecting';
      await this.router.navigate(['/recipe', resolvedUrl.id]);
      return;
    }

    if (existingStatus === null) {
      this.loadState = 'requesting';
      await this.dataService.requestParse(resolvedUrl.id);
    }

    this.loadState = 'processing';





  }



}
