declare const process: {
  env: Record<string, string | undefined>;
};

declare const console: {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};
