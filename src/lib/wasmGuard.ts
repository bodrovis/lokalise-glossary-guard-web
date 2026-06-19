import type {
  ValidateRequest,
  WasmValidateEnvelope,
} from "../types/guard";
import type { GoWasmInstance } from "../types/wasm";

let readyPromise: Promise<void> | null = null;

declare global {
  interface Window {
    Go: new () => GoWasmInstance;
    validateGlossaryGuard?: (input: ValidateRequest) => string;
  }
}

export function initGuardWasm(): Promise<void> {
  if (readyPromise) return readyPromise;

  readyPromise = initGuardWasmOnce().catch((err) => {
    readyPromise = null;
    throw err;
  });

  return readyPromise;
}

async function initGuardWasmOnce(): Promise<void> {
  await loadScript("/wasm/wasm_exec.js");

  if (!window.Go) {
    throw new Error("Go WASM runtime is not available");
  }

  const go = new window.Go();
  const instance = await instantiateWasm(
    "/wasm/lokalise-glossary-guard.wasm",
    go.importObject,
  );

  const runResult = go.run(instance);

  if (runResult instanceof Promise) {
    runResult.catch((err) => {
      console.error("Go WASM runtime failed:", err);
    });
  }

  if (!window.validateGlossaryGuard) {
    throw new Error("validateGlossaryGuard was not registered by WASM");
  }
}

export async function validateGlossary(
  req: ValidateRequest,
): Promise<WasmValidateEnvelope> {
  await initGuardWasm();

  if (!window.validateGlossaryGuard) {
    throw new Error("validateGlossaryGuard is not available");
  }

  const raw = window.validateGlossaryGuard(req);

  try {
    return JSON.parse(raw) as WasmValidateEnvelope;
  } catch (err) {
    throw new Error(`Invalid WASM response JSON: ${err}`);
  }
}

async function instantiateWasm(
  src: string,
  importObject: WebAssembly.Imports,
): Promise<WebAssembly.Instance> {
  const response = await fetch(src);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${src}: ${response.status} ${response.statusText}`);
  }

  const fallbackResponse = response.clone();

  try {
    const result = await WebAssembly.instantiateStreaming(response, importObject);
    return result.instance;
  } catch {
    const bytes = await fallbackResponse.arrayBuffer();
    const result = await WebAssembly.instantiate(bytes, importObject);
    return result.instance;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

    if (existing) {
      if (window.Go) {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed to load ${src}`)),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}