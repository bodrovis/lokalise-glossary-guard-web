export type ValidateRequest = {
  path?: string;
  data: string;
  langs?: string[];
  fix?: boolean;
  rerun_after_fix?: boolean;
  hard_fail_on_error?: boolean;
};

export type ValidateStatus = "passed" | "passed_with_warnings" | "failed";

export type Outcome = {
  name: string;
  status: string;
  message?: string;
  critical: boolean;
  changed: boolean;
  note?: string;
};

export type Summary = {
  file_path: string;
  pass: number;
  warn: number;
  fail: number;
  errors: number;
  applied_fixes: boolean;
  early_exit: boolean;
  early_check?: string;
  early_status?: string;
  final_path?: string;
  outcomes: Outcome[];
};

export type ValidateResponse = {
  path?: string;
  status: ValidateStatus;

  passed: boolean;
  warned: boolean;
  failed: boolean;
  errored: boolean;

  error?: string;

  fixed: boolean;
  fixed_text?: string;

  summary: Summary;
};

export type WasmValidateEnvelope = {
  ok: boolean;
  result?: ValidateResponse;
  error?: string;
};
