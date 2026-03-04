export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const handleAsyncError = (fn: Function) => {
  return (...args: any[]) => {
    Promise.resolve(fn(...args)).catch(args[args.length - 1]);
  };
};
