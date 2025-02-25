import { QueryClientProvider } from '@tanstack/react-query';
import fetchMock from 'fetch-mock';
import { PropsWithChildren } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { ContextFactory as mockContextFactory } from 'utils/test/factories';
import BaseSessionProvider from 'data/SessionProvider/BaseSessionProvider';
import { checkStatus } from 'utils/api/joanie';
import { useSession } from 'data/SessionProvider';
import { createTestQueryClient } from 'utils/test/createTestQueryClient';
import { useSessionQuery } from '.';

jest.mock('utils/context', () => ({
  __esModule: true,
  default: mockContextFactory({
    authentication: {
      endpoint: 'https://endpoint.test',
      backend: 'openedx-hawthorn',
    },
  }).generate(),
}));

describe('useSessionQuery', () => {
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={createTestQueryClient({ user: { username: 'John Doe' } })}>
      <BaseSessionProvider>{children}</BaseSessionProvider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    jest.resetModules();
    fetchMock.restore();
  });

  it('should invalidate user queries if it fails with a 401 response status', async () => {
    fetchMock.get('http://api.endpoint/orders/', 401);
    fetchMock.get('https://endpoint.test/api/user/v1/me', 401);
    const handleError = jest.fn();

    const useHooks = () => {
      const session = useSession();
      useSessionQuery(['orders'], () => fetch('http://api.endpoint/orders/').then(checkStatus), {
        onError: handleError,
      });

      return session;
    };

    const { result } = renderHook(() => useHooks(), {
      wrapper,
    });

    // - At the first render, query state should be retrieved from the sessionStorage
    expect(fetchMock.calls().length).toEqual(1);
    expect(fetchMock.lastCall()![0]).toEqual('http://api.endpoint/orders/');
    expect(result.current.user).toStrictEqual({ username: 'John Doe' });

    // - As the order query failed with a 401 error,
    //   we can await that user query has been invalidated
    await waitFor(() => expect(result.current.user).toBeNull());
    await waitFor(() => expect(fetchMock.calls().length).toEqual(2));

    // - The first request should be the mutation to create an order

    // - The second request should be the query to get the user
    expect(fetchMock.calls()[1][0]).toEqual('https://endpoint.test/api/user/v1/me');
    // - Finally the provided onError should have been executed
    expect(handleError).toHaveBeenCalledTimes(1);
  });
});
