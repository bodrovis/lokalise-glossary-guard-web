<script setup lang="ts">
import GlossaryForm from "./components/GlossaryForm.vue";
import ResultPanel from "./components/ResultPanel.vue";
import { useGlossaryValidation } from "./composables/useGlossaryValidation";

const guard = useGlossaryValidation();
</script>

<template>
  <main class="page">
    <GlossaryForm
      :file="guard.file.value"
      :langs="guard.langs.value"
      :fix="guard.fix.value"
      :rerun-after-fix="guard.rerunAfterFix.value"
      :hard-fail-on-error="guard.hardFailOnError.value"
      :loading="guard.loading.value"
      :can-submit="guard.canSubmit.value"
      @file-change="guard.setFile"
      @update:langs="guard.langs.value = $event"
      @update:fix="guard.fix.value = $event"
      @update:rerun-after-fix="guard.rerunAfterFix.value = $event"
      @update:hard-fail-on-error="guard.hardFailOnError.value = $event"
      @submit="guard.validate"
    />

    <p v-if="guard.error.value" class="error">
      {{ guard.error.value }}
    </p>

    <ResultPanel
      v-if="guard.result.value"
      :result="guard.result.value"
      :can-download-fixed="guard.canDownloadFixed.value"
      @download-fixed="guard.downloadFixed"
    />
  </main>
</template>