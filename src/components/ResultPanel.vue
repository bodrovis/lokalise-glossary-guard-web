<script setup lang="ts">
import type { ValidateResponse } from "../types/guard";
import OutcomesTable from "./OutcomesTable.vue";

defineProps<{
  result: ValidateResponse;
  canDownloadFixed: boolean;
}>();

const emit = defineEmits<{
  "download-fixed": [];
}>();
</script>

<template>
  <section class="card">
    <h2>Result: {{ result.status }}</h2>

    <div class="summary">
      <span>Pass: {{ result.summary.pass }}</span>
      <span>Warn: {{ result.summary.warn }}</span>
      <span>Fail: {{ result.summary.fail }}</span>
      <span>Errors: {{ result.summary.errors }}</span>
    </div>

    <p v-if="result.error" class="error">
      {{ result.error }}
    </p>

    <button v-if="canDownloadFixed" @click="emit('download-fixed')">
      Download fixed CSV
    </button>

    <OutcomesTable
      v-if="result.summary.outcomes.length"
      :outcomes="result.summary.outcomes"
    />
  </section>
</template>