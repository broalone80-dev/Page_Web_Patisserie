/**
 * Comprehensive environment configuration
 * Validates all required env vars at startup
 */

import * as path from "path";

// List of required environment variables
const REQUIRED_ENV_VARS = {
  // Server
  NODE_ENV: ["development", "production"],
  PORT: "number",

  // Database
  DATABASE_URL: "string",

  // JWT
  JWT_SECRET: "string",
  JWT_REFRESH_SECRET: "string",

  // Payment providers
  FLUTTERWAVE_API_KEY: "string",
  FLUTTERWAVE_SECRET_KEY: "string",
  CINETPAY_API_KEY: "string",
  CINETPAY_SITE_ID: "string",

  // URLs
  API_BASE_URL: "string",
  FRONTEND_URL: "string",
  CORS_ORIGIN: "string",

  // Optional but recommended
  SENTRY_DSN: "optional",
  LOG_LEVEL: ["debug", "info", "warn", "error"],
};

interface AppConfig {
  env: "development" | "production";
  port: number;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiration: string;
    refreshExpiration: string;
  };
  server: {
    apiUrl: string;
    frontendUrl: string;
    corsOrigin: string;
  };
  payment: {
    flutterwave: {
      apiKey: string;
      secretKey: string;
      baseUrl: string;
    };
    cinetpay: {
      apiKey: string;
      siteId: string;
      baseUrl: string;
    };
  };
  sentry: {
    dsn: string | undefined;
  };
  logging: {
    level: "debug" | "info" | "warn" | "error";
  };
}

/**
 * Validate environment variables
 */
function validateEnv(): void {
  const missing: string[] = [];

  Object.entries(REQUIRED_ENV_VARS).forEach(([key, allowed]) => {
    const value = process.env[key];

    // Check if variable exists (except optional)
    if (!value && allowed !== "optional") {
      missing.push(key);
      return;
    }

    // Validate enum values
    if (typeof allowed === "object" && value) {
      if (!allowed.includes(value)) {
        throw new Error(
          `${key} must be one of: ${allowed.join(", ")}, got "${value}"`
        );
      }
    }
  });

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error("\n📋 Create .env file based on .env.example");
    process.exit(1);
  }

  console.log("✅ Environment variables validated");
}

/**
 * Get configuration object
 */
export function getConfig(): AppConfig {
  return {
    env: (process.env.NODE_ENV as "development" | "production") || "development",
    port: parseInt(process.env.PORT || "4000", 10),
    database: {
      url: process.env.DATABASE_URL!,
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      refreshSecret: process.env.JWT_REFRESH_SECRET!,
      expiration: process.env.JWT_EXPIRATION || "15m",
      refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7d",
    },
    server: {
      apiUrl: process.env.API_BASE_URL!,
      frontendUrl: process.env.FRONTEND_URL!,
      corsOrigin: process.env.CORS_ORIGIN!,
    },
    payment: {
      flutterwave: {
        apiKey: process.env.FLUTTERWAVE_API_KEY!,
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
        baseUrl: process.env.NODE_ENV === "production"
          ? "https://api.flutterwave.com/v3"
          : "https://api.flutterwave.com/v3",
      },
      cinetpay: {
        apiKey: process.env.CINETPAY_API_KEY!,
        siteId: process.env.CINETPAY_SITE_ID!,
        baseUrl: process.env.NODE_ENV === "production"
          ? "https://api.cinetpay.com/v1"
          : "https://api.cinetpay.com/v1",
      },
    },
    sentry: {
      dsn: process.env.SENTRY_DSN,
    },
    logging: {
      level: (process.env.LOG_LEVEL as "debug" | "info" | "warn" | "error") || "info",
    },
  };
}

/**
 * Initialize and validate configuration
 */
let config: AppConfig | null = null;

export function initConfig(): AppConfig {
  console.log("🔧 Initializing application configuration...");

  // Validate env vars
  validateEnv();

  // Create config object
  config = getConfig();

  // Display summary
  console.log(`
📊 Configuration Summary:
  Environment: ${config.env}
  Server: ${config.server.apiUrl}
  Frontend: ${config.server.frontendUrl}
  Database: ${config.database.url.substring(0, 40)}...
  Payment Providers: Flutterwave + CinetPay
  Sentry: ${config.sentry.dsn ? "✅ Enabled" : "⏭️  Disabled"}
  Log Level: ${config.logging.level}
  `);

  return config;
}

/**
 * Get current configuration (must call initConfig first)
 */
export function config_get(): AppConfig {
  if (!config) {
    throw new Error("Configuration not initialized. Call initConfig() first.");
  }
  return config;
}

// For backwards compatibility
export const config = {
  getConfig,
  initConfig,
  validateEnv,
};
