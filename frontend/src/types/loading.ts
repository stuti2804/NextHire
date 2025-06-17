export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
}

export const initialLoadingState: LoadingState = {
  isLoading: false,
  error: null,
};

export function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  setError: (error: Error | null) => void
): Promise<T | undefined> {
  setLoading(true);
  setError(null);
  
  return operation()
    .catch((error: Error) => {
      setError(error);
      return undefined;
    })
    .finally(() => {
      setLoading(false);
    });
}
