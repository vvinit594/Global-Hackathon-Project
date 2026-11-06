# Ethereum Name Service (ENS) Integration

## 1. Overview
Stealth Pay integrates with **ENS** to eliminate the need for copy-pasting unwieldy 141-character stealth meta-addresses. Senders can simply type `vitalik.eth` or `merchant.eth` directly in the recipient field.

---

## 2. Text Record Standard

Following the ERC-5564 specification, receivers register a standard text record on their ENS name:

- **Key:** `stealth-meta-address`
- **Value:** `st:eth:0x<spendingPubKey><viewingPubKey>`

### Example Text Record
```text
stealth-meta-address = st:eth:0x028c9fe47b9938dcb90184bba01948bc891048bce910283749bcf819028374900a03d7c54b2990f11ac891029384918293849102938491293849102938491029384b
```

---

## 3. Resolution Flow in Stealth Pay
1. The user types `vitalik.eth` in the `/send` payment input.
2. The frontend triggers `/api/v1/ens/resolve?name=vitalik.eth`.
3. Viem's ENS client:
   - Resolves the primary Ethereum address via `getEnsAddress`.
   - Resolves the avatar via `getEnsAvatar`.
   - Queries `getEnsText({ name, key: 'stealth-meta-address' })`.
4. If the text record is found, Stealth Pay immediately displays the verified ENS badge and derives the single-use one-time stealth destination address in real time.
5. If no stealth record is configured, the user is notified with instructions on how to add the text record via the official ENS manager.
