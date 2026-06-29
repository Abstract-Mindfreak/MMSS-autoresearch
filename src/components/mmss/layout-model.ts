import type { IJsonModel } from "flexlayout-react";

export const defaultLayoutModel: IJsonModel = {
  global: {
    tabEnableClose: false,
    tabSetEnableMaximize: true,
    tabEnableFloat: false,
  },
  borders: [],
  layout: {
    type: "row",
    children: [
      {
        type: "tabset",
        weight: 22,
        children: [
          {
            type: "tab",
            component: "navigation",
            name: "Navigation",
          },
        ],
      },
      {
        type: "row",
        weight: 50,
        children: [
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                component: "pfr",
                name: "PFR - Fractal Reassembly",
              },
              {
                type: "tab",
                component: "frp",
                name: "FRP - Temporal Navigator",
              },
              {
                type: "tab",
                component: "ammss",
                name: "A-MMSS - Context Weaver",
              },
            ],
          },
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                component: "orchestrator",
                name: "Orchestrator",
              },
              {
                type: "tab",
                component: "game",
                name: "MMSS Game",
              },
            ],
          },
        ],
      },
      {
        type: "row",
        weight: 28,
        children: [
          {
            type: "tabset",
            weight: 60,
            children: [
              {
                type: "tab",
                component: "aiAssistant",
                name: "AI Assistant",
              },
              {
                type: "tab",
                component: "promptGenerator",
                name: "Prompt Generator",
              },
            ],
          },
          {
            type: "tabset",
            weight: 40,
            children: [
              {
                type: "tab",
                component: "metrics",
                name: "System Metrics",
              },
              {
                type: "tab",
                component: "console",
                name: "Console Output",
              },
            ],
          },
        ],
      },
    ],
  },
};
