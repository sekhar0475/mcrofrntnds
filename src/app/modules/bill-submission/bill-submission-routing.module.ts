import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchBillSubmissionComponent } from './bill-submission/pages/search-bill-submission/search-bill-submission.component';

const routes: Routes = [
  {
      path: '',
      redirectTo: '/dashboard',
      pathMatch: 'full'
  }, {
      path: 'submission',
      component: SearchBillSubmissionComponent,
      data: {
        breadcrumb: 'Update Submission Status',
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillSubmissionRoutingModule { }
