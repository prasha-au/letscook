import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, firstValueFrom, NEVER } from 'rxjs';
import { ParseRequest, ResolvedUrl } from '../../../../interfaces';
import { DataService } from '../data.service';

type LoadState = 'checking_for_existing' | 'requesting' | 'redirecting' | 'error';

@Component({
  selector: 'app-loader',
  template: `
    <div class="d-flex h-100 w-100 flex-column justify-content-center align-items-center">

      <div *ngIf="!resolvedUrl">
        Unable to load {{rawUrl}}
      </div>

      <div *ngIf="resolvedUrl" [ngSwitch]="loadState" class="text-center">
        <div *ngSwitchCase="'checking_for_existing'">
          <div class="spinner-border text-light" role="status" style="width: 10rem; height: 10rem;"></div>
          <p class="lead text-center mt-3">Loading</p>
        </div>
        <div *ngSwitchCase="'redirecting'">
          <div class="spinner-border text-light" role="status" style="width: 10rem; height: 10rem;"></div>
          <p class="lead text-center mt-3">Redirecting</p>
        </div>
        <div *ngSwitchCase="'requesting'">
          <div class="spinner-border text-light" role="status" style="width: 10rem; height: 10rem;"></div>
          <p class="lead text-center mt-3">Requesting your recipe</p>
        </div>
        <div *ngSwitchCase="'error'" class="text-center">
          <h2>Ooops!</h2>
          <p class="lead">
            We were unable to fetch details from the link you provided.<br />
          </p>
          <p class="lead">
            <a [routerLink]="['/']" class="btn btn-secondary border-white bg-white text-black">Back Home</a>
          </p>
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
    const processingStatus = this.dataService.getRecipeParseStatus(resolvedUrl.id);


    const existingStatus = await firstValueFrom(processingStatus);
    if (existingStatus?.status === 'done' && existingStatus.success) {
      this.loadState = 'redirecting';
      await this.router.navigate(['/recipe', resolvedUrl.id]);
      return;
    }


    this.loadState = 'requesting';
    if (existingStatus === null) {
      await this.dataService.requestParse(resolvedUrl);
    }


    const doneStatus = await firstValueFrom(processingStatus.pipe(
      filter((v): v is ParseRequest & { success: boolean } => v?.status === 'done')
    ));


    if (doneStatus.success) {
      this.loadState = 'redirecting';
      await this.router.navigate(['/recipe', resolvedUrl.id]);
    } else {
      this.loadState = 'error';
    }

  }



}
