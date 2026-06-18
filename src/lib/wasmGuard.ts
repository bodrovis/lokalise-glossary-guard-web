import type { ValidateResponse } from "../types/guard";
import type { GoWasmInstance } from "../types/wasm";

type ValidateRequest = {
  path?: string;
  data: string;
  langs?: string[];
  fix?: boolean;
  rerun_after_fix?: boolean;
  hard_fail_on_error?: boolean;
};

export type WasmValidateEnvelope = {
  ok: boolean;
  result?: ValidateResponse;
  error?: string;
};

let readyPromise: Promise<void> | null = null;

declare global {
  interface Window {
    Go: new () => GoWasmInstance;
    validateGlossaryGuard?: (input: ValidateRequest) => string;
  }
}

export async function initGuardWasm() {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    await loadScript("/wasm/wasm_exec.js");

    const go = new window.Go();
    const result = await WebAssembly.instantiateStreaming(
      fetch("/wasm/lokalise-glossary-guard.wasm"),
      go.importObject,
    );

    go.run(result.instance);
  })();

  return readyPromise;
}

export async function validateGlossary(
  req: ValidateRequest,
): Promise<WasmValidateEnvelope> {
  await initGuardWasm();

  if (!window.validateGlossaryGuard) {
    throw new Error("validateGlossaryGuard is not available");
  }

  return JSON.parse(window.validateGlossaryGuard(req));
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}
