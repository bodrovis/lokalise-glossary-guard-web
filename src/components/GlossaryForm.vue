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
  maxFileSizeLabel: string;
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

function onLangsInput(event: Event) {
  emit("update:langs", (event.target as HTMLInputElement).value);
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

function onRerunAfterFixChange(event: Event) {
  emit("update:rerun-after-fix", (event.target as HTMLInputElement).checked);
}

function onHardFailOnErrorChange(event: Event) {
  emit("update:hard-fail-on-error", (event.target as HTMLInputElement).checked);
}
</script>

<template>
  <section class="card">
    <header class="form-header">
      <h1>Lokalise Glossary Guard</h1>

      <p>
        Select a Lokalise glossary CSV file and check it before importing it
        into Lokalise. The file is opened locally in your browser: it is not
        sent to this website, Firebase, Lokalise, or any external server.
      </p>

      <p class="help">
        Lokalise glossaries help keep translations consistent by defining
        approved terms, forbidden terms, translations, and related metadata. You
        can read more in the
        <a
          href="https://docs.lokalise.com/en/articles/1400629-glossary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Lokalise glossary documentation </a
        >.
      </p>

      <p class="help">
        <em>
          <small>
            Source code:
            <a
              href="https://github.com/bodrovis/lokalise-glossary-guard-web"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/bodrovis/lokalise-glossary-guard-web
            </a>

            CLI tool:
            <a
              href="https://github.com/bodrovis/lokalise-glossary-guard"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/bodrovis/lokalise-glossary-guard
            </a>
          </small>
        </em>
      </p>
    </header>

    <form class="form" :aria-busy="loading" @submit.prevent="emit('submit')">
      <div class="form-section">
        <label class="field">
          <span class="field-label">CSV file</span>

          <input
            ref="fileInput"
            type="file"
            accept=".csv,text/csv"
            aria-describedby="csv-help"
            :disabled="loading"
            @change="onFileChange"
          />

          <span id="csv-help" class="help">
            Choose a glossary CSV exported from or prepared for Lokalise. The
            file is read by the browser only and passed directly to the local
            WebAssembly validator. Maximum file size:
            <strong>{{ maxFileSizeLabel }}</strong
            >.
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
            :disabled="loading"
            @input="onLangsInput"
          />

          <span id="langs-help" class="help">
            Optional. Use comma-separated Lokalise language codes. The codes
            must match your Lokalise project exactly, for example
            <code>en_US</code>, <code>fr_FR</code>, <code>de_DE</code>. Leave
            empty to run checks without a language filter.
          </span>
        </label>
      </div>

      <fieldset class="form-section options" :disabled="loading">
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
            :disabled="!fix || loading"
            @change="onRerunAfterFixChange"
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
            @change="onHardFailOnErrorChange"
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
        <button type="submit" class="primary-button" :disabled="!canSubmit">
          {{ loading ? "Checking..." : "Check glossary" }}
        </button>

        <span v-if="!file" class="help">Choose a CSV file to start.</span>
      </div>
    </form>
  </section>
</template>