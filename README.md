# karman

## 配置先優先權

權重由上至下、由高至低：

```bash
- runtimeOptions
- apiConfig             # 以上由 api factory 進行繼承與配置
- karmanConfig          # 到 karman layer 為止皆由 layerBuilder 進行繼承與配置
- parentKarmanConfig
  .
  .
  .
- RootKarmanConfig
```