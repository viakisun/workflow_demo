# Agri-Workflow Studio

This is a visual editor and simulator for building complex, multi-robot workflows for agricultural applications. It features a node-based graph editor, a dynamic rules engine, and an observability and timeline suite.

## Quick Start

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000) with your browser. The studio will load with an example project.

## Features

-   **Visual Graph Editor:** Build workflows by dragging nodes from the palette onto the canvas and connecting them.
-   **Dynamic Rules Engine:** Define complex logic using a powerful rules engine that reacts to the state of the simulation.
-   **Deterministic Simulator:** Run deterministic simulations of your robots and resources.
-   **Observability Suite:** A detailed event log, KPI dashboard, and timeline replayer to debug and analyze your workflows.
-   **Plugin API:** Extend the studio with your own custom nodes and rules.

## How to...

### Add a Plugin
1. Create a new file in `src/plugins`, e.g., `my_plugin.ts`.
2. Use the `registerNode` and `registerAction` functions from `@/lib/plugins/api` to define your custom logic.
3. Import your new plugin file in `src/plugins/index.ts`.

### Write a Rule
Rules are defined in JSON. See `public/seeds/ruleset.orchestration.v1.json` for an example. The rules engine supports state-based triggers, conditions, and a variety of actions.

### Record & Replay
Use the "Record" button in the top bar to start and stop recording a simulation. The "Timeline" tab in the inspector can be used to scrub through the recorded session.

## Keyboard Shortcuts

-   **Delete:** Delete selected nodes/edges.
-   (More to be added)

---
*This project was bootstrapped with [Next.js](https://nextjs.org).*
