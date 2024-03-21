/**
 * - `true` - 可清除的任務
 * - `false` - 不可清除的任務
 */
type PopSignal = boolean;

/**
 * 排程任務
 * @param now 當前時間，由排程管理器注入
 * @returns 返回 `true` 時，排程管理器將剃除此任務
 */
export type Task = (now: number) => PopSignal;
