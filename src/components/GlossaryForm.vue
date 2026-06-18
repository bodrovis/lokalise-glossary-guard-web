<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  file: File | null;
  langs: string;
  fix: boolean;
  rerunAfterFix: boolean;
  hardFailOnError: boolean;
  loading: boolean;
  canSubmit: boolean;
}>();

const emit = defineEmits<{
  "file-change": [file: File | null];
  "update:langs": [value: string];
  "update:fix": [value: boolean];
  "update:rerun-after-fix": [value: boolean];
  "update:hard-fail-on-error": [value: boolean];
  submit: [];
}>();

const fileInput = ref<HTMLInputElement | null>(null);

watch(
  () => props.file,
  (file) => {
    if (!file && fileInput.value) {
      fileInput.value.value = "";
    }
  },
);

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  emit("file-change", input.files?.[0] ?? null);
}

function onFixChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;

  emit("update:fix", checked);

  // Re-run only makes sense when fixes are enabled.
  // Keep it enabled by default when user enables fixes.
  if (checked && !props.rerunAfterFix) {
    emit("update:rerun-after-fix", true);
  }
}
</script>

<template>
  <section class="card">
    <header class="form-header">
      <h1>Lokalise Glossary Guard</h1>
      <p>
        Validate a Lokalise glossary CSV directly in your browser. Your file is
        not uploaded anywhere.
      </p>
    </header>

    <form class="form" @submit.prevent="emit('submit')">
      <div class="form-section">
        <label class="field">
          <span class="field-label">CSV file</span>

          <input
            ref="fileInput"
            type="file"
            accept=".csv,text/csv"
            aria-describedby="csv-help"
            @change="onFileChange"
          />

          <span id="csv-help" class="help">
            Choose the glossary CSV file you want to validate. Maximum file
            size: <strong>25 MB</strong>.
          </span>
        </label>

        <p v-if="file" class="selected-file">
          Selected file: <strong>{{ file.name }}</strong>
        </p>
      </div>

      <div class="form-section">
        <label class="field">
          <span class="field-label">Languages</span>

          <input
            :value="langs"
            placeholder="en_US,fr_FR,de_DE"
            aria-describedby="langs-help"
            @input="
              emit(
                'update:langs',
                ($event.target as HTMLInputElement).value,
              )
            "
          />

          <span id="langs-help" class="help">
            Optional. Use comma-separated Lokalise language codes. The codes
            must match your Lokalise project exactly, for example
            <code>en_US</code>, <code>fr_FR</code>, <code>de_DE</code>. Leave
            empty to run checks without a language filter.
          </span>
        </label>
      </div>

      <fieldset class="form-section options">
        <legend>Validation options</legend>

        <label class="option-card">
          <input type="checkbox" :checked="fix" @change="onFixChange" />

          <span class="option-body">
            <span class="option-title">Apply fixes</span>
            <span class="help">
              Try to fix detected issues automatically. The original file will
              not be changed. If fixes are applied, you will be able to download
              a new CSV file.
            </span>
          </span>
        </label>

        <label class="option-card" :class="{ disabled: !fix }">
          <input
            type="checkbox"
            :checked="rerunAfterFix"
            :disabled="!fix"
            @change="
              emit(
                'update:rerun-after-fix',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />

          <span class="option-body">
            <span class="option-title">Re-run after fix</span>
            <span class="help">
              After a problem is found and fixed, validate the updated file
              again to confirm that the issue is actually gone.
            </span>
          </span>
        </label>

        <label class="option-card">
          <input
            type="checkbox"
            :checked="hardFailOnError"
            @change="
              emit(
                'update:hard-fail-on-error',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />

          <span class="option-body">
            <span class="option-title">Hard fail on error</span>
            <span class="help">
              Treat check errors as fatal validation errors. Usually you can
              leave this off unless you want stricter CI-like behavior.
            </span>
          </span>
        </label>
      </fieldset>

      <div class="form-actions">
        <button class="primary-button" :disabled="!canSubmit">
          {{ loading ? "Checking..." : "Check glossary" }}
        </button>

        <span v-if="!file" class="help">Choose a CSV file to start.</span>
      </div>
    </form>
  </section>
</template>