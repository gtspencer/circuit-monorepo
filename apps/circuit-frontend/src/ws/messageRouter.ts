import type { ZodSchema, infer as ZodInfer } from "zod";

/**
 * Lightweight router that:
 * - Subscribes by message `type`
 * - Validates with Zod before invoking handler
 * - Provides a `once` helper to await a single validated message
 */
export type OnFn = <T extends { type: string } = { type: string }>(
  type: T["type"],
  fn: (msg: T) => void
) => () => void;

export function createMessageRouter(on: OnFn) {
  function handle<S extends ZodSchema<any>>(
    schema: S,
    handler: (msg: ZodInfer<S>) => void
  ) {
    // Infer the literal `type` from schema if present
    // @ts-expect-error – zod types aren’t fully reflected at TS level
    const msgType: string | undefined = schema.shape?.type?._def?.value;
    if (!msgType) throw new Error("Schema must include a literal `type` field");

    const off = on(msgType, (raw: any) => {
      const parsed = schema.safeParse(raw);
      if (parsed.success) handler(parsed.data as ZodInfer<S>);
      // else: silently ignore invalid messages
    });
    return off;
  }

  function once<S extends ZodSchema<any>>(
    schema: S,
    predicate?: (msg: ZodInfer<S>) => boolean
  ): Promise<ZodInfer<S>> {
    // @ts-expect-error see above
    const msgType: string | undefined = schema.shape?.type?._def?.value;
    if (!msgType) throw new Error("Schema must include a literal `type` field");

    return new Promise((resolve) => {
      const off = on(msgType, (raw: any) => {
        const parsed = schema.safeParse(raw);
        if (!parsed.success) return;
        const ok = predicate ? predicate(parsed.data) : true;
        if (ok) {
          off();
          resolve(parsed.data as ZodInfer<S>);
        }
      });
    });
  }

  return { handle, once };
}
