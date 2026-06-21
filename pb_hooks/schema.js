// pb_hooks/schema.js
// PocketBase collection definitions
// Run: ./pocketbase migrate collections

const NEVER = "@request.auth.id = '' && @request.auth.id != ''";

module.exports = [
  {
    name: "campaigns",
    type: "base",
    system: false,
    fields: [
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
        cascadeDelete: true,
      },
      {
        name: "title",
        type: "text",
        required: true,
      },
      {
        name: "description",
        type: "text",
        required: false,
      },
      {
        name: "isArchived",
        type: "bool",
        required: false,
        defaultValue: false,
      },
    ],
    indexes: [
      "CREATE INDEX idx_campaigns_user ON campaigns (user)",
      "CREATE INDEX idx_campaigns_archived ON campaigns (isArchived)",
    ],
    rules: {
      list: "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      view: "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      create: "@request.auth.id != ''",
      update: "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      delete: "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
    },
  },
  {
    name: "leads",
    type: "base",
    system: false,
    fields: [
      {
        name: "campaign",
        type: "relation",
        required: true,
        collectionId: "campaigns",
        maxSelect: 1,
        cascadeDelete: true,
      },
      {
        name: "domain",
        type: "text",
        required: true,
      },
      {
        name: "foundEmail",
        type: "text",
        required: false,
      },
      {
        name: "viralRoast",
        type: "text",
        required: false,
      },
      {
        name: "outreachSubject",
        type: "text",
        required: false,
      },
      {
        name: "outreachBody",
        type: "text",
        required: false,
      },
      {
        name: "status",
        type: "select",
        required: false,
        defaultValue: "pending",
        values: ["pending", "processing", "completed", "failed"],
      },
    ],
    indexes: [
      "CREATE INDEX idx_leads_campaign ON leads (campaign)",
      "CREATE INDEX idx_leads_status ON leads (campaign, status)",
    ],
    rules: {
      list: "@request.auth.id != ''",
      view: "@request.auth.id != ''",
      create: NEVER,
      update: NEVER,
      delete: NEVER,
    },
  },
  {
    name: "analytics_events",
    type: "base",
    system: false,
    fields: [
      {
        name: "event",
        type: "text",
        required: true,
      },
      {
        name: "properties",
        type: "json",
        required: false,
      },
      {
        name: "user",
        type: "relation",
        required: false,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
        cascadeDelete: "SET NULL",
      },
    ],
    indexes: [
      "CREATE INDEX idx_analytics_event ON analytics_events (event)",
      "CREATE INDEX idx_analytics_user ON analytics_events (user)",
      "CREATE INDEX idx_analytics_created ON analytics_events (created)",
    ],
    rules: {
      list: "@request.auth.id != '' && @request.auth.role = 'admin'",
      view: "@request.auth.id != '' && @request.auth.role = 'admin'",
      create: NEVER,
      update: NEVER,
      delete: NEVER,
    },
  },
  {
    name: "subscriptions",
    type: "base",
    system: false,
    fields: [
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
        cascadeDelete: true,
      },
      {
        name: "stripeSubscriptionId",
        type: "text",
        required: false,
        unique: true,
      },
      {
        name: "stripePriceId",
        type: "text",
        required: false,
      },
      {
        name: "tier",
        type: "select",
        required: true,
        values: ["free", "growth", "scale"],
      },
      {
        name: "status",
        type: "select",
        required: false,
        defaultValue: "active",
        values: ["active", "canceled", "past_due", "incomplete"],
      },
      {
        name: "creditsPerPeriod",
        type: "number",
        required: false,
        defaultValue: 0,
      },
      {
        name: "currentPeriodStart",
        type: "date",
        required: false,
      },
      {
        name: "currentPeriodEnd",
        type: "date",
        required: false,
      },
    ],
    indexes: [
      "CREATE INDEX idx_sub_user ON subscriptions (user)",
      "CREATE INDEX idx_sub_stripe ON subscriptions (stripeSubscriptionId)",
    ],
    rules: {
      list: "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      view: "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      create: NEVER,
      update: "@request.auth.role = 'admin'",
      delete: NEVER,
    },
  },
  {
    name: "payments",
    type: "base",
    system: false,
    fields: [
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
        cascadeDelete: "SET NULL",
      },
      {
        name: "stripeSessionId",
        type: "text",
        required: false,
        unique: true,
      },
      {
        name: "stripeInvoiceId",
        type: "text",
        required: false,
      },
      {
        name: "amount",
        type: "number",
        required: true,
      },
      {
        name: "currency",
        type: "text",
        required: false,
        defaultValue: "usd",
      },
      {
        name: "tier",
        type: "select",
        required: true,
        values: ["free", "growth", "scale"],
      },
      {
        name: "creditsAdded",
        type: "number",
        required: false,
        defaultValue: 0,
      },
      {
        name: "status",
        type: "select",
        required: true,
        values: ["succeeded", "failed", "pending", "refunded"],
      },
    ],
    indexes: [
      "CREATE INDEX idx_pay_user ON payments (user)",
      "CREATE INDEX idx_pay_created ON payments (created)",
    ],
    rules: {
      list: "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      view: "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      create: NEVER,
      update: NEVER,
      delete: NEVER,
    },
  },
  {
    name: "credit_transactions",
    type: "base",
    system: false,
    fields: [
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
        cascadeDelete: "SET NULL",
      },
      {
        name: "amount",
        type: "number",
        required: true,
      },
      {
        name: "type",
        type: "select",
        required: true,
        values: ["deduction", "refund", "purchase", "signup_bonus", "promotion"],
      },
      {
        name: "referenceId",
        type: "text",
        required: false,
      },
      {
        name: "description",
        type: "text",
        required: false,
      },
    ],
    indexes: [
      "CREATE INDEX idx_credit_user ON credit_transactions (user)",
      "CREATE INDEX idx_credit_created ON credit_transactions (created)",
      "CREATE INDEX idx_credit_type ON credit_transactions (type)",
    ],
    rules: {
      list: "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      view: "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      create: NEVER,
      update: NEVER,
      delete: NEVER,
    },
  },
  {
    name: "email_logs",
    type: "base",
    system: false,
    fields: [
      {
        name: "lead",
        type: "relation",
        required: true,
        collectionId: "leads",
        maxSelect: 1,
        cascadeDelete: true,
      },
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
        cascadeDelete: "SET NULL",
      },
      {
        name: "toEmail",
        type: "text",
        required: true,
      },
      {
        name: "subject",
        type: "text",
        required: true,
      },
      {
        name: "status",
        type: "select",
        required: false,
        defaultValue: "sent",
        values: ["sent", "delivered", "bounced", "failed"],
      },
      {
        name: "resendId",
        type: "text",
        required: false,
      },
    ],
    indexes: [
      "CREATE INDEX idx_email_lead ON email_logs (lead)",
      "CREATE INDEX idx_email_user ON email_logs (user)",
      "CREATE INDEX idx_email_sent ON email_logs (created)",
    ],
    rules: {
      list: "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      view: "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      create: NEVER,
      update: NEVER,
      delete: NEVER,
    },
  },
  {
    name: "api_keys",
    type: "base",
    system: false,
    fields: [
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
        cascadeDelete: true,
      },
      {
        name: "keyHash",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "name",
        type: "text",
        required: false,
      },
      {
        name: "lastUsedAt",
        type: "date",
        required: false,
      },
      {
        name: "expiresAt",
        type: "date",
        required: false,
      },
      {
        name: "isActive",
        type: "bool",
        required: false,
        defaultValue: true,
      },
    ],
    indexes: [
      "CREATE INDEX idx_apikey_user ON api_keys (user)",
      "CREATE INDEX idx_apikey_hash ON api_keys (keyHash)",
    ],
    rules: {
      list: "@request.auth.id != '' && user = @request.auth.id",
      view: "@request.auth.id != '' && user = @request.auth.id",
      create: "@request.auth.id != ''",
      update: "@request.auth.id != '' && user = @request.auth.id",
      delete: "@request.auth.id != '' && user = @request.auth.id",
    },
  },
  {
    name: "user_settings",
    type: "base",
    system: false,
    fields: [
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
        cascadeDelete: true,
      },
      {
        name: "service",
        type: "text",
        required: true,
      },
      {
        name: "encryptedKey",
        type: "text",
        required: true,
      },
      {
        name: "keyPreview",
        type: "text",
        required: false,
      },
    ],
    indexes: [
      "CREATE INDEX idx_usersettings_user ON user_settings (user)",
      "CREATE INDEX idx_usersettings_service ON user_settings (user, service)",
    ],
    rules: {
      list: "@request.auth.id != '' && user = @request.auth.id",
      view: "@request.auth.id != '' && user = @request.auth.id",
      create: "@request.auth.id != ''",
      update: "@request.auth.id != '' && user = @request.auth.id",
      delete: "@request.auth.id != '' && user = @request.auth.id",
    },
  },
];
