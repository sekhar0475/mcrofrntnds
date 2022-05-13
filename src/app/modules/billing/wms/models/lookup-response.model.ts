import { LookupType } from './lookup-type.model';

export class LookupResponse{
    message : string;
    status : string;
    data : LookupType[];
}