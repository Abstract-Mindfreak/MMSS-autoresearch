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
        weight: 20,
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
        weight: 40,
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
        weight: 20,
        children: [
          {
            type: "tabset",
            weight: 55,
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
            weight: 45,
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
      {
        type: "row",
        weight: 20,
        children: [
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                component: "autoResearch",
                name: "Auto Research",
              },
              {
                type: "tab",
                component: "mmssModels",
                name: "MMSS Models",
              },
            ],
          },
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                component: "mmssReports",
                name: "MMSS Reports",
              },
              {
                type: "tab",
                component: "mmssCompare",
                name: "MMSS Compare",
              },
            ],
          },
        ],
      },
    ],
  },
};
