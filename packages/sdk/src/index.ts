// Configuration
export { configureSDK, type SDKConfig } from "./custom-instance";

// Generated React Query hooks
export {
  usePostDashboardV1AuthLogin,
  useGetDashboardV1AuthMe,
  usePostDashboardV1AuthLogout,
  useGetDashboardV1Payments,
  getGetDashboardV1AuthMeQueryKey,
  getGetDashboardV1PaymentsQueryKey,
  getGetDashboardV1AuthMeQueryOptions,
  getGetDashboardV1PaymentsQueryOptions,
} from "./generated/api/default/default";

// Generated types
export type {
  Payment,
  PaymentListResponse,
  PaymentListResponseResponse,
  PostDashboardV1AuthLoginBody,
  LoginResponseResponse,
  GetDashboardV1AuthMe200,
  GetDashboardV1PaymentsParams,
  UnauthorizedErrorResponse,
  User,
  Error,
} from "./generated/models";
