import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from 'src/app/shared/services/constant-service/constants.service';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class BranchService {

    constructor(private client: HttpClient,
                private constants: ConstantsService) { }

    getUserBranches(id: string) {
        const url = this.constants.GET_USER_BRANCH;
        return this.client
            .get<any>(url + id)
            .pipe(
                map(res => res)
            );
    }

}
