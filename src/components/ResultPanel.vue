<script setup lang="ts">
import { computed } from "vue";
import type { ValidateResponse } from "lokalise-glossary-guard-wasm";
import OutcomesTable from "./OutcomesTable.vue";

const props = defineProps<{
  result: ValidateResponse;
  canDownloadFixed: boolean;
}>();

const emit = defineEmits<{
  "download-fixed": [];
}>();

const statusLabel = computed(() => {
  switch (props.result.status) {
    case "passed":
      return "Passed";
    case "passed_with_warnings":
      return "Passed with warnings";
    case "failed":
      return "Failed";
    default:
      return props.result.status;
  }
});

const statusClass = computed(() => {
  return {
    "is-passed": props.result.passed,
    "is-warned": props.result.warned,
    "is-failed": props.result.failed,
    "is-errored": props.result.errored,
  };
});
</script>

<template>
  <section class="card">
    <header class="result-header">
      <h2>
        Result:
        <span class="result-status" :class="statusClass">
          {{ statusLabel }}
        </span>
      </h2>

      <p v-if="result.path" class="help">
        File: <strong>{{ result.path }}</strong>
      </p>
    </header>

    <div class="summary">
      <span>Pass: {{ result.summary.pass }}</span>
      <span>Warn: {{ result.summary.warn }}</span>
      <span>Fail: {{ result.summary.fail }}</span>
      <span>Errors: {{ result.summary.errors }}</span>
    </div>

    <p v-if="result.error" class="error">
      {{ result.error }}
    </p>

    <p v-if="result.summary.applied_fixes" class="help">
      Fixes were applied to the validated data.
    </p>

    <p v-if="result.summary.early_exit" class="help">
      Validation stopped early after
      <strong>{{ result.summary.early_check || "a check" }}</strong>
      returned
      <strong>{{ result.summary.early_status || "a fail-fast result" }}</strong
      >.
    </p>

    <button
      v-if="canDownloadFixed"
      type="button"
      class="primary-button"
      @click="emit('download-fixed')"
    >
      Download fixed CSV
    </button>

    <OutcomesTable
      v-if="result.summary.outcomes.length"
      :outcomes="result.summary.outcomes"
    />

    <p v-else class="help">
      No detailed check outcomes were returned.
    </p>
  </section>
</template>