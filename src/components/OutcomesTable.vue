<script setup lang="ts">
import type { Outcome } from "../types/guard";

defineProps<{
  outcomes: Outcome[];
}>();

function statusClass(status: Outcome["status"]) {
  switch (status.toLowerCase()) {
    case "pass":
    case "passed":
      return "status-pass";

    case "warn":
    case "warning":
    case "passed_with_warnings":
      return "status-warn";

    case "fail":
    case "failed":
      return "status-fail";

    case "error":
    case "errored":
      return "status-error";

    default:
      return "status-neutral";
  }
}

function statusLabel(status: Outcome["status"]) {
  switch (status.toLowerCase()) {
    case "pass":
    case "passed":
      return "Passed";

    case "warn":
    case "warning":
    case "passed_with_warnings":
      return "Warning";

    case "fail":
    case "failed":
      return "Failed";

    case "error":
    case "errored":
      return "Error";

    default:
      return status || "Unknown";
  }
}

function messageText(outcome: Outcome) {
  const message = outcome.message?.trim();
  const note = outcome.note?.trim();

  if (message && note) {
    return `${message} Note: ${note}`;
  }

  return message || note || "—";
}
</script>

<template>
  <div class="table-wrap">
    <table class="outcomes-table">
      <thead>
        <tr>
          <th class="index-col">#</th>
          <th>Check</th>
          <th>Status</th>
          <th>Changed</th>
          <th>Message</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(outcome, index) in outcomes"
          :key="`${outcome.name}-${index}`"
          :class="statusClass(outcome.status)"
        >
          <td class="index-col">
            {{ index + 1 }}
          </td>

          <td>
            <div class="check-name">
              <strong>{{ outcome.name }}</strong>
              <span v-if="outcome.critical" class="critical-badge">
                critical
              </span>
            </div>
          </td>

          <td>
            <span class="status-badge" :class="statusClass(outcome.status)">
              {{ statusLabel(outcome.status) }}
            </span>
          </td>

          <td>
            <span
              class="changed-badge"
              :class="outcome.changed ? 'changed-yes' : 'changed-no'"
            >
              {{ outcome.changed ? "Changed" : "No" }}
            </span>
          </td>

          <td class="message-cell">
            {{ messageText(outcome) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>