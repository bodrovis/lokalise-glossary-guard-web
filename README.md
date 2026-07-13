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

The validation logic comes from the [lokalise-glossary-guard](https://github.com/bodrovis/lokalise-glossary-guard) Go project, bindings are fetched from [github.com/bodrovis/lokalise-glossary-guard-wasm](https://github.com/bodrovis/lokalise-glossary-guard-wasm).

## Local development

Install dependencies:

```bash
npm i
```

Run the app locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Deployment

The app is deployed to Firebase Hosting. Deployment runs automatically when changes are pushed to the `master` branch.

## License

(c) [Elijah S. Krukowski](https://bodrovis.tech), BSD-3-Clause license