/**
 * Sentry error tracking initialization
 * Monitors exceptions, performance, and health metrics
 */

import * as Sentry from "@sentry/node";
import * as fs from "fs";
import * as path from "path";

export function initSentry(app: any) {
  // Only initialize in production
  if (process.env.NODE_ENV !== "production") {
    console.log("⏭️  Sentry skipped (not in production)");
    return;
  }

  if (!process.env.SENTRY_DSN) {
    console.warn("⚠️  SENTRY_DSN not set, error tracking disabled");
    return;
  }

  // Initialize Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Performance monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    profilesSampleRate: 0.1,
    
    // Request filtering
    beforeSend(event, hint) {
      // Don't send 4xx errors (client errors)
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error && error.message.includes("404")) {
          return null;
        }
      }
      return event;
    },
    
    // Integrations
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
  });

  // Attach middleware
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  // Error handler (must be last)
  app.use(Sentry.Handlers.errorHandler());

  // Capture unhandled errors
  process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    Sentry.captureException(error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection:", reason);
    Sentry.captureException(reason);
  });

  console.log("✅ Sentry initialized for error tracking");
}

/**
 * Manually capture exceptions in try-catch blocks
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  } else {
    console.error("Error:", error, context);
  }
}

/**
 * Capture custom events (e.g., payment success/failure)
 */
export function captureEvent(message: string, level: "info" | "warning" | "error" = "info", context?: Record<string, any>) {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureMessage(message, {
      level,
      contexts: {
        custom: context,
      },
    });
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
}

/**
 * Start performance monitoring for critical operations
 */
export function startSpan(operation: string, fn: () => Promise<any>) {
  const transaction = Sentry.startTransaction({
    op: operation,
    name: operation,
  });

  return async () => {
    try {
      const result = await fn();
      transaction.finish();
      return result;
    } catch (error) {
      transaction.setStatus("error");
      transaction.finish();
      throw error;
    }
  };
}
