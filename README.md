# Lokalise Glossary Guard: Web version

A small browser-based UI for validating **Lokalise glossary files**.

> Live app: https://lokalise-glossary-guard.web.app/

## What it does

This app lets you upload a Lokalise glossary CSV file, run validation checks locally in the browser, and optionally download a fixed version of the file.

The original file is not uploaded anywhere. Validation runs client-side through WebAssembly.

## Built with

* Vue 3
* Vite
* TypeScript
* Go WebAssembly
* Firebase Hosting

The validation logic comes from the [lokalise-glossary-guard](https://github.com/bodrovis/lokalise-glossary-guard) Go project. The web app downloads the WASM release artifact and uses it in the browser.

## Local development

Install dependencies:

```bash
npm ci
```

Fetch WASM assets:

```bash
npm run fetch:wasm
```

Run the app locally:

```bash
npm run dev
```

Or fetch WASM and start the dev server in one command:

```bash
npm run dev:wasm
```

To use a specific guard release version:

```bash
GUARD_VERSION=v1.3.0-beta3 npm run fetch:wasm
```

## Build

```bash
npm run build
```

## Deployment

The app is deployed to Firebase Hosting. Deployment runs automatically when changes are pushed to the `master` branch.

## Notes

The app expects the WASM files to be available under:

```text
public/wasm/lokalise-glossary-guard.wasm
public/wasm/wasm_exec.js
```

These files are fetched from the `lokalise-glossary-guard` GitHub release assets.

## License

(c) [Elijah S. Krukowski](https://bodrovis.tech), BSD-3-Clause license