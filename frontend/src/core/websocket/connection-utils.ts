/* Copyright 2026 Marimo. All rights reserved. */
import { WebSocketState } from "./types";

/**
 * Check if the app is in a closed/disconnected state
 */
export function isAppClosed(state: WebSocketState): boolean {
  return state === WebSocketState.CLOSED;
}

/**
 * Check if the app is in a connecting state
 */
export function isAppConnecting(state: WebSocketState): boolean {
  return state === WebSocketState.CONNECTING;
}

/**
 * Check if the app is in an open/connected state
 */
export function isAppConnected(state: WebSocketState): boolean {
  return state === WebSocketState.OPEN;
}

/**
 * Check if the app is in a closing state
 */
export function isAppClosing(state: WebSocketState): boolean {
  return state === WebSocketState.CLOSING;
}

/**
 * Check if the app is in a not started state
 */
export function isAppNotStarted(state: WebSocketState): boolean {
  return state === WebSocketState.NOT_STARTED;
}

/**
 * Check if the app is in a state where user interactions should be disabled
 */
export function isAppInteractionDisabled(state: WebSocketState): boolean {
  return (
    state === WebSocketState.CLOSED ||
    state === WebSocketState.CLOSING ||
    state === WebSocketState.CONNECTING
  );
}

/**
 * Get a human-readable tooltip message for the connection state
 */
export function getConnectionTooltip(state: WebSocketState): string {
  switch (state) {
    case WebSocketState.CLOSED:
      return "应用已断开连接";
    case WebSocketState.CONNECTING:
      return "正在连接运行时...";
    case WebSocketState.CLOSING:
      return "应用正在断开连接...";
    case WebSocketState.OPEN:
      return "";
    case WebSocketState.NOT_STARTED:
      return "点击连接到运行时";
    default:
      return "";
  }
}
