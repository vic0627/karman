type PopSignal = boolean;

export type Task = (now: number) => PopSignal;
