import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {

  constructor() { }

  // readonly API_VERSION: string = "v1";
  readonly API_URL: string = `${environment.apiUrl}` + '/';
  // login page, dashboard, sidebar
  readonly LOGIN_API: string = `${environment.apiUrl}` + '/jwt/authorize';
  readonly USER_MODULE_API: string = this.API_URL + 'admin/common/userModules/';
  // Role Management
  readonly GET_ROLE_BY_ID: string = this.API_URL + 'admin/role/';
  readonly GET_MODULES: string = this.API_URL + 'admin/role/modules/';
  readonly POST_ROLES_PERMISSONS: string = this.API_URL + 'admin/role/';
  // User Management
  readonly GET_ALL_USERS: string = this.API_URL + 'admin/user/';
  readonly GET_ALL_ROLES: string = this.API_URL + 'admin/user/roles/';
  readonly GET_USER_ROLES: string = this.API_URL + 'admin/user/roles/';
  readonly GET_BY_USER_ID: string = this.API_URL + 'admin/user/';
  readonly POST_USER_DATA: string = this.API_URL + 'admin/user/';
  readonly GET_ALL_BOOKING_BRANCH: string = this.API_URL + 'admin/common/branch/';//'admin/user/bookingBranch/';
  readonly GET_PRIVILEGE_BRANCH: string = this.API_URL + 'admin/user/prBranches/';
  readonly GET_BOOKING_BRANCH: string = this.API_URL + 'admin/common/branch/';//admin/user/bookingBranch/';
  readonly GET_LOOKUP: string = this.API_URL + 'admin/user/bookingLookups/';
  readonly GET_USER_DEFAULT_BRANCH: string = this.API_URL + 'admin/user/defaultBranch/';
  readonly VALIDATE_AD_SERVICE: string = this.API_URL + 'admin/user/validateADService/';
  readonly GET_USER_BRANCH: string = this.API_URL + 'admin/common/userBranch/';
  readonly GET_BROAD_CAST_MSG: string = this.API_URL + 'admin/common/broadcast/5';
  // Receipt
  readonly GET_APPLY_RECEIPTS: string = this.API_URL + 'receipt/application/getReceipts';
  readonly GET_UNAPPLY_RECEIPTS: string = this.API_URL + 'receipt/unapplication/getReceipts';
  readonly GET_APPLY_RECEIPT_ID: string = this.API_URL + 'receipt/application/getReceipt/';
  readonly GET_UNAPPLY_RECEIPT_ID: string = this.API_URL + 'receipt/unapplication/getReceipt/';
  readonly POST_RECEIPTS: string = this.API_URL + 'receipt/generation/';
  readonly GET_BILLS: string = this.API_URL + 'receipt/application/bills';
  readonly POST_RECEIPT_APPLY: string = this.API_URL + 'receipt/application';
  readonly GET_APPLIED_REPT: string = this.API_URL + 'receipt/unapplication/';
  readonly POST_RECEIPT_UNAPPLY: string = this.API_URL + 'receipt/unapplication';

  readonly GET_WMS_BILLING: string = this.API_URL + 'wms/billing/wmsBills';
  readonly GET_WMS_BILL_LINES: string = this.API_URL + 'wms/billing/billLines/';
  readonly POST_WMS_BILLING: string = this.API_URL + 'wms/billing/wmsBill';
  readonly GET_WMS_BRANCH: string = this.API_URL + 'wms/billing/branch/';
  readonly POST_EKS_TESTING_URL: string = this.API_URL + 'wms/billing/saveDate';
  //readonly GET_WMS_BILLING: string = 'http://localhost:8080/wms/billing/wmsBills';
  //readonly GET_WMS_BILL_LINES: string = 'http://localhost:8080/wms/billing/billLines/';
  //readonly POST_WMS_BILLING: string = 'http://localhost:8080/wms/billing/wmsBill';
   readonly GET_WMS_CUST_BY_NAME: string = this.API_URL + 'wms/billing/customersByName';
  
  readonly POST_PROPEL_CUSTOMER_API: string = this.API_URL + 'admin/common/customer/wms';

  // credit billing
  // hold bill
  readonly GET_CUSTOMER_HOLD: string = this.API_URL + 'credit/holdBill/autoBillCustomers';
  readonly POST_CUSTOMER_HOLD: string = this.API_URL + 'credit/holdBill';
  // discount bill
  readonly GET_BILL_DISCOUNT: string = this.API_URL + 'credit/discount/billDetails';
  readonly POST_BILL_DISCOUNT: string = this.API_URL + 'credit/discount';
  // finalize bill
  readonly GET_BILL_FINALIZE: string =  this.API_URL + 'credit/finalize/billBatches';
  readonly GET_BILL_FINALIZE_BY_ID: string = this.API_URL + 'credit/finalize/billBatches/';
  readonly POST_FINALIZE_BILL: string = this.API_URL + 'credit/finalize';
  // manual bill creation
  readonly GET_MANUAL_CUSTOMER: string = this.API_URL + 'credit/manual/customer';
  readonly GET_MANUAL_CUSTOMER_NEW: string = this.API_URL + 'credit/manual/eligibleCustomer';
  readonly POST_MANUAL_BATCH: string = this.API_URL + 'credit/manual/manualBillCCDisplay';
  readonly POST_MANUAL_BATCH_NEW: string = this.API_URL + 'credit/manual/cntr/initateBilling';
  // review bill
  readonly GET_REVIEW_BILL: string = this.API_URL + 'credit/review/reviewBatchDisplay';
  readonly POST_REVIEW_BATCH: string = this.API_URL + 'credit/review/waybills';
  readonly GET_BATCH_BLNG_LEVEL: string = this.API_URL + 'credit/review/billingLevel';
  readonly GET_BATCH_REVIEW_WAYBILLS: string = this.API_URL + 'credit/review/getWayBills';
  readonly POST_WAYBILLS_REJECT: string = this.API_URL + 'credit/review/BatchRejectWaybills';
  readonly GET_ERROR_BATCH_DETAIL_BY_BATCH_ID = this.API_URL + 'credit/review/billBatches/errors/';

  // random billing
  readonly GET_RANDOM_WAYBILLS: string = this.API_URL + 'credit/random/getWayBills';
  readonly POST_RANDOM_WAYBILLS: string = this.API_URL + 'credit/random/createBillsBatch';
  readonly GET_RANDOM_CUST_DETAILS: string= this.API_URL + 'credit/random/getCustDetails';

  // lookup service
  readonly GET_LOOKUP_SERVICE: string = this.API_URL + 'lookup/lookupType/';

  // document deviation
  readonly GET_POST_RECEIPTS_WRITEOFF: string = this.API_URL + 'misc/receiptWriteOff';
  readonly GET_POST_RECEIPT_CANCEL: string = this.API_URL + 'misc/receiptCancel';
  // invoice write off
  readonly GET_POST_CREDIT_WRITEOFF: string = this.API_URL + 'misc/invoiceWriteOff/credit';
  readonly GET_POST_ALLIED_WRITEOFF: string = this.API_URL + 'misc/invoiceWriteOff/allied';
  readonly GET_POST_WMS_WRITEOFF: string = this.API_URL + 'misc/invoiceWriteOff/wms';
  readonly POST_INV_CREDIT_WRITEOFF: string = this.API_URL + 'misc/invoiceWriteOff/credit/bulkUpload/';
  readonly POST_INV_ALLIED_WRITEOFF: string = this.API_URL + 'misc/invoiceWriteOff/allied/bulkUpload/';
  readonly POST_INV_WMS_WRITEOFF: string = this.API_URL + 'misc/invoiceWriteOff/wms/bulkUpload/';
  readonly GET_BULK_UPLOAD_TEMPLATE = this.API_URL + 'misc/invoiceWriteOff/credit/bulk/upload';

  // waybill write off
   readonly GET_DOC_DEVIATION_WAYBILLS = this.API_URL + 'misc/waybillWriteOff/getWayBills';
   readonly POST_VALIDATE_WAYBILLS = this.API_URL + 'misc/';
   readonly POST_WAYBILL_WRITEOFF = this.API_URL + 'misc/waybillWriteOff';

  // update bill branch
  readonly GET_POST_UPDATE_CREDIT_BILL_BRANCH = this.API_URL + 'misc/updateBillBranch/credit';
  readonly GET_POST_UPDATE_ALLIED_BILL_BRANCH = this.API_URL + 'misc/updateBillBranch/allied';
  readonly GET_POST_UPDATE_WMS_BILL_BRANCH = this.API_URL + 'misc/updateBillBranch/wms';

  // update submission status
  readonly GET_POST_SUBMISSION_UPDATE_CREDIT: string = this.API_URL + 'misc/submission/credit';
  readonly GET_POST_SUBMISSION_UPDATE_ALLIED: string = this.API_URL + 'misc/submission/allied';
  readonly GET_POST_SUBMISSION_UPDATE_WMS: string = this.API_URL + 'misc/submission/wms';


  // Allied Billing
  readonly GET_CREDIT_BILLS_BY_DOC_NUMBER: string = this.API_URL + 'allied/credit/getBillDetailsByDocNum';
  readonly POST_ALLIED_BILLS: string = this.API_URL + 'allied/credit';
  readonly POST_ALLIED_RETAIL_BILLS: string = this.API_URL + 'allied/retail';
  readonly GET_RETAIL_BILLS_BY_DOC_NUMBER: string = this.API_URL + 'allied/retail/getBillDetailsByDocNum';
  readonly POST_VALIDATE_WAYBILL_NUMBERS: string = this.API_URL + 'allied/credit/waybillNumber/valdtn';
  readonly GET_VALIDATE_PRC_CUST: string = this.API_URL + 'allied/retail/prc/searchContract';
  readonly POST_FETCH_CUST_BY_BILL_LVL: string = this.API_URL + 'allied/credit/cust/cntrBlng/details';
  readonly POST_VALIDATE_BILL_WAYBILL_NUMBERS: string = this.API_URL + 'allied/credit/billWaybillNumber/valdtn';

  // BIL_CMDM
  readonly CMDM_BILL: string = this.API_URL + 'misc/';
  readonly CMDM_GET_CREDIT_BILLS: string = this.API_URL + 'misc/credit/getBillDetailsByDocNum';
  readonly CMDM_GET_RETAIL_BILLS: string = this.API_URL + 'misc/retail/getBillDetailsByDocNum';
  readonly CMDM_BULK_UPLOAD: string = '/bulk/upload';
  readonly CMDM_GET_WMS_BILLS: string = this.API_URL + 'misc/wms/cmdm';
  readonly CMDM_GET_ALLIED_BILLS: string = this.API_URL + 'misc/allied/cmdm';
  readonly CMDM_GET_WAYBILLS: string = this.API_URL + 'misc/retail/cmdm/getWayBills';

  //Reports Print Bill
  readonly POST_GET_REPORT_PRINT_BILLS: string = this.API_URL + 'reports/print/bill/print/v1/search';
  readonly POST_REPORT_PRINT: string = this.API_URL + 'reports/print/bill/v1/print';
  readonly GET_REPORT_JOB_DETAILS_PRINT_BILL: string = this.API_URL  + 'reports/print/bill/job/v1/search';
  readonly GET_PRINT_BILL_REPORT_JOB_ID: string = this.API_URL + 'reports/print/bill/v1/job';
  readonly GET_BILL_REPORT: string = this.API_URL + 'reports/print/bill/v1/printBill';
  
  //Reports Email Bill
  readonly GET_REPORT_EBILL_SEARCH: string = this.API_URL + 'reports/email/bill/ebill/v1/search';
  readonly GET_REPORT_EBILL_SEARCH_DETAILS: string = this.API_URL + 'reports/email/bill/ebill/v1/search/detail';
  readonly POST_REPORT_EBILL_SEND_EMAIL_BULK: string = this.API_URL + 'reports/email/bill/v1/email/ui';
  readonly POST_REPORT_EBILL_SEND_EMAIL: string = this.API_URL + 'reports/email/bill/v1/email/reports';
  readonly GET_PINCODE_VALIDATE: string = this.API_URL + 'allied/retail/pincode';
  
  //EInvoice
  readonly GET_POST_EINVOICE_WMS: string = this.API_URL + 'wms/billing/einvoice';
	readonly GET_POST_EINVOICE_CREDIT: string = this.API_URL + 'credit/einvoice';
	readonly GET_POST_EINVOICE_CMDM: string = this.API_URL + 'misc/einvoice';
	readonly GET_POST_EINVOICE_ALLIED: string = this.API_URL + 'allied/einvoice';
}
