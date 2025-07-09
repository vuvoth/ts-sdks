---
'@mysten/enoki': minor
---

Split the `enoki:getMetadata` feature into `enoki:getMetadata` and `enoki:getSession`.

`getWalletMetadata` now only returns the authentication provider, while `getSession` returns the zkLogin session data.
