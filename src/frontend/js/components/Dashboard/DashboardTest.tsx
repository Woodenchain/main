import { createMemoryRouter } from 'react-router-dom';
import { getDashboardRoutes } from 'utils/routers/dashboard/useDashboardRouter';
import Dashboard from 'components/Dashboard/index';

interface DashboardTestProps {
  initialRoute?: string;
}

/**
 * We must use a memory router in order to test navigation with react-router v6.
 */
export const DashboardTest = ({ initialRoute }: DashboardTestProps) => {
  const router = createMemoryRouter(getDashboardRoutes(), {
    initialEntries: initialRoute ? [initialRoute] : undefined,
  });
  return <Dashboard router={router} />;
};
