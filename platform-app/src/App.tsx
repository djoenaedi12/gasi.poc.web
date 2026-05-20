import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@gasi/core-ui';
import { AppRoutes } from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries:   { retry: 1, staleTime: 5 * 60 * 1000 },
    mutations: { retry: 0 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
