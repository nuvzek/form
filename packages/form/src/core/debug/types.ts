export type FormDebugKind = "request" | "model" | "share" | "locale" | "update";
export type FormDebugStatus = "pending" | "fulfilled" | "rejected" | "change";

export type FormDebugEvent = {
  id: number;
  kind: FormDebugKind;
  status: FormDebugStatus;
  path: string;
  detail?: any;
  timestamp: number;
};
