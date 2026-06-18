import { computed, ref } from "vue";
import { MAX_CSV_FILE_SIZE_BYTES, MAX_CSV_FILE_SIZE_LABEL } from "../constants/files";
import { validateGlossary } from "../lib/wasmGuard";
import type { ValidateResponse } from "../types/guard";

export function useGlossaryValidation() {
  const file = ref<File | null>(null);
  const langs = ref("");

  const fix = ref(false);
  const rerunAfterFix = ref(true);
  const hardFailOnError = ref(false);

  const loading = ref(false);
  const error = ref("");
  const result = ref<ValidateResponse | null>(null);

  const canSubmit = computed(() => Boolean(file.value) && !loading.value);

  const canDownloadFixed = computed(() => {
    return Boolean(result.value?.fixed && result.value.fixed_text && file.value);
  });

  function setFile(nextFile: File | null) {
    result.value = null;
    error.value = "";

    if (!nextFile) {
      file.value = null;
      return;
    }

    if (nextFile.size > MAX_CSV_FILE_SIZE_BYTES) {
      file.value = null;
      error.value = `File is too large. Maximum allowed size is ${MAX_CSV_FILE_SIZE_LABEL}.`;
      return;
    }

    file.value = nextFile;
  }

  async function validate() {
    if (!file.value) return;

    loading.value = true;
    error.value = "";
    result.value = null;

    try {
      const data = await file.value.text();

      const envelope = await validateGlossary({
        path: file.value.name,
        data,
        langs: langs.value
          .split(",")
          .map((lang) => lang.trim())
          .filter(Boolean),
        fix: fix.value,
        rerun_after_fix: rerunAfterFix.value,
        hard_fail_on_error: hardFailOnError.value,
      });

      if (!envelope.ok) {
        error.value = envelope.error || "WASM validation failed";
        return;
      }

      const nextResult = envelope.result;

      if (!nextResult) {
        error.value = "WASM returned empty result";
        return;
      }

      if (envelope.error && !nextResult.error) {
        nextResult.error = envelope.error;
      }

      result.value = nextResult;
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  function downloadFixed() {
    if (!result.value?.fixed_text || !file.value) return;

    const blob = new Blob([result.value.fixed_text], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const originalName = file.value.name.replace(/\.csv$/i, "");

    a.href = url;
    a.download = `${originalName}.fixed.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  return {
    file,
    langs,
    fix,
    rerunAfterFix,
    hardFailOnError,
    loading,
    error,
    result,
    canSubmit,
    canDownloadFixed,
    setFile,
    validate,
    downloadFixed,
    maxFileSizeLabel: MAX_CSV_FILE_SIZE_LABEL,
  };
}
