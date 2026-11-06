# Arkiv Network Data Schemas

Stealth Pay utilizes the **Arkiv Network** as a decentralized, tamper-proof state layer for identity publication and expirable payment requests.

---

## 1. Collection: `stealth_identities`

Stores registered public profiles of Stealth Pay users and merchants.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ArkivStealthIdentity",
  "type": "object",
  "properties": {
    "entityId": {
      "type": "string",
      "description": "Unique Arkiv entity identifier"
    },
    "ownerAddress": {
      "type": "string",
      "pattern": "^0x[0-9a-fA-F]{40}$",
      "description": "Public EVM wallet address of identity creator"
    },
    "stealthMetaAddress": {
      "type": "string",
      "pattern": "^st:eth:0x[0-9a-fA-F]{132}$",
      "description": "ERC-5564 stealth meta-address (33B Ps + 33B Pv)"
    },
    "spendingPubKey": {
      "type": "string",
      "pattern": "^0x[0-9a-fA-F]{66}$",
      "description": "Compressed secp256k1 public spending key"
    },
    "viewingPubKey": {
      "type": "string",
      "pattern": "^0x[0-9a-fA-F]{66}$",
      "description": "Compressed secp256k1 public viewing key"
    },
    "displayName": {
      "type": "string",
      "maxLength": 64
    },
    "category": {
      "type": "string",
      "enum": ["Receiver", "Merchant", "Freelancer", "DAO"]
    },
    "description": {
      "type": "string",
      "maxLength": 280
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": [
    "ownerAddress",
    "stealthMetaAddress",
    "spendingPubKey",
    "viewingPubKey",
    "createdAt"
  ]
}
```

---

## 2. Collection: `payment_requests`

Stores expirable payment requests and invoices with built-in cryptographic TTL.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ArkivPaymentRequest",
  "type": "object",
  "properties": {
    "requestId": {
      "type": "string",
      "description": "Deterministic request identifier (req_...)"
    },
    "stealthMetaAddress": {
      "type": "string",
      "pattern": "^st:eth:0x[0-9a-fA-F]{132}$"
    },
    "amount": {
      "type": "number",
      "minimum": 0
    },
    "asset": {
      "type": "string",
      "enum": ["USDT", "WBT", "ETH", "USDC"]
    },
    "network": {
      "type": "string"
    },
    "memo": {
      "type": "string",
      "maxLength": 140
    },
    "ttlHours": {
      "type": "integer",
      "minimum": 1,
      "maximum": 720,
      "default": 168
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "expiresAt": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": [
    "requestId",
    "stealthMetaAddress",
    "amount",
    "asset",
    "ttlHours",
    "createdAt",
    "expiresAt"
  ]
}
```

---

## 3. Collection: `merchant_directory`

Stores public merchant profiles accepting privacy-preserving payments.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ArkivMerchantProfile",
  "type": "object",
  "properties": {
    "entityId": {
      "type": "string"
    },
    "name": {
      "type": "string",
      "maxLength": 64
    },
    "stealthMetaAddress": {
      "type": "string"
    },
    "category": {
      "type": "string"
    },
    "website": {
      "type": "string",
      "format": "uri"
    },
    "description": {
      "type": "string"
    },
    "verified": {
      "type": "boolean"
    }
  },
  "required": ["name", "stealthMetaAddress", "category", "verified"]
}
```
