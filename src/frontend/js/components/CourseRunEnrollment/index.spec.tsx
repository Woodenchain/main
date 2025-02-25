import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from 'react-intl';

import { CourseRun } from 'types';
import { Deferred } from 'utils/test/deferred';
import * as mockFactories from 'utils/test/factories';
import { UserFactory } from 'utils/test/factories';
import { handle } from 'utils/errors/handle';
import context from 'utils/context';
import { SessionProvider } from 'data/SessionProvider';
import { createTestQueryClient } from 'utils/test/createTestQueryClient';
import { User } from 'types/User';
import CourseRunEnrollment from '.';

jest.mock('utils/errors/handle');
jest.mock('utils/context', () => ({
  __esModule: true,
  default: mockFactories
    .ContextFactory({
      authentication: {
        endpoint: 'https://demo.endpoint',
        backend: 'openedx-hawthorn',
      },
      lms_backends: [
        {
          backend: 'openedx-hawthorn',
          course_regexp: '(?<course_id>.*)',
          endpoint: 'https://demo.endpoint',
        },
      ],
    })
    .generate(),
}));

const mockHandle = handle as jest.MockedFunction<typeof handle>;

describe('<CourseRunEnrollment />', () => {
  const endpoint = 'https://demo.endpoint';

  const getCourseRunProp = (courseRun: CourseRun) => ({
    id: courseRun.id,
    resource_link: courseRun.resource_link,
    priority: courseRun.state.priority,
    starts_in_message: courseRun.starts_in_message,
    dashboard_link: courseRun.dashboard_link,
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('shows an "Enroll" button and allows the user to enroll', async () => {
    const user: User = UserFactory.generate();
    const courseRun: CourseRun = mockFactories.CourseRunFactory.generate();
    courseRun.state.priority = 0;

    const enrollmentsDeferred = new Deferred();
    fetchMock.get(
      `${endpoint}/api/enrollment/v1/enrollment/${user.username},${courseRun.resource_link}`,
      enrollmentsDeferred.promise,
    );

    await act(async () => {
      render(
        <QueryClientProvider client={createTestQueryClient({ user })}>
          <IntlProvider locale="en">
            <SessionProvider>
              <CourseRunEnrollment context={context} courseRun={getCourseRunProp(courseRun)} />
            </SessionProvider>
          </IntlProvider>
        </QueryClientProvider>,
      );
    });
    screen.getByRole('status', { name: 'Loading enrollment information...' });

    await act(async () => {
      enrollmentsDeferred.resolve({});
    });

    const button = await screen.findByRole('button', { name: 'Enroll now' });

    const enrollActionDeferred = new Deferred();
    fetchMock.post(`${endpoint}/api/enrollment/v1/enrollment`, enrollActionDeferred.promise);
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      enrollActionDeferred.resolve({ is_active: true });
    });

    screen.getByRole('link', { name: 'Go to course' });
    screen.getByText('You are enrolled in this course run');
  });

  it('shows an error message and the enrollment button when the enrollment fails', async () => {
    const user: User = UserFactory.generate();
    const courseRun: CourseRun = mockFactories.CourseRunFactory.generate();
    courseRun.state.priority = 0;

    const enrollmentDeferred = new Deferred();
    fetchMock.get(
      `${endpoint}/api/enrollment/v1/enrollment/${user.username},${courseRun.resource_link}`,
      enrollmentDeferred.promise,
    );

    await act(async () => {
      render(
        <QueryClientProvider client={createTestQueryClient({ user })}>
          <IntlProvider locale="en">
            <SessionProvider>
              <CourseRunEnrollment context={context} courseRun={getCourseRunProp(courseRun)} />
            </SessionProvider>
          </IntlProvider>
        </QueryClientProvider>,
      );
    });

    screen.getByRole('status', { name: 'Loading enrollment information...' });

    await act(async () => {
      enrollmentDeferred.resolve({});
    });

    const button = await screen.findByRole('button', { name: 'Enroll now' });

    // const enrollmentAction = new Deferred();
    fetchMock.post(`${endpoint}/api/enrollment/v1/enrollment`, 500);

    await act(async () => {
      expect(() => fireEvent.click(button)).not.toThrow();
      // enrollmentAction.reject('500 - Internal Server Error');
    });

    screen.getByRole('button', { name: 'Enroll now' });
    screen.getByText('Your enrollment request failed.');
    expect(mockHandle).toHaveBeenCalledWith(
      new Error('[SET - Enrollment] > 500 - Internal Server Error'),
    );
  });

  it('shows a link to the course if the user is already enrolled', async () => {
    const user: User = UserFactory.generate();
    const courseRun: CourseRun = mockFactories.CourseRunFactory.generate();
    courseRun.state.priority = 0;

    const enrollmentsDeferred = new Deferred();
    fetchMock.get(
      `${endpoint}/api/enrollment/v1/enrollment/${user.username},${courseRun.resource_link}`,
      enrollmentsDeferred.promise,
    );

    await act(async () => {
      render(
        <QueryClientProvider client={createTestQueryClient({ user })}>
          <IntlProvider locale="en">
            <SessionProvider>
              <CourseRunEnrollment context={context} courseRun={getCourseRunProp(courseRun)} />
            </SessionProvider>
          </IntlProvider>
        </QueryClientProvider>,
      );
    });

    screen.getByRole('status', { name: 'Loading enrollment information...' });

    await act(async () => {
      enrollmentsDeferred.resolve({ is_active: true });
    });

    await screen.findByRole('link', { name: 'Go to course' });
    screen.getByText('You are enrolled in this course run');
  });

  it("shows remaining course opening time and a link to the lms dashboard if the user is already enrolled and if the course hasn't started yet", async () => {
    const user: User = UserFactory.generate();
    const courseRun: CourseRun = mockFactories.CourseRunFactory.generate();
    courseRun.state.priority = 0;
    courseRun.starts_in_message = 'The course will start in 3 days';
    courseRun.dashboard_link = 'https://edx.local.dev:8073/dashboard';

    const enrollmentsDeferred = new Deferred();
    fetchMock.get(
      `${endpoint}/api/enrollment/v1/enrollment/${user.username},${courseRun.resource_link}`,
      enrollmentsDeferred.promise,
    );

    await act(async () => {
      render(
        <QueryClientProvider client={createTestQueryClient({ user })}>
          <IntlProvider locale="en">
            <SessionProvider>
              <CourseRunEnrollment context={context} courseRun={getCourseRunProp(courseRun)} />
            </SessionProvider>
          </IntlProvider>
        </QueryClientProvider>,
      );
    });

    screen.getByRole('status', { name: 'Loading enrollment information...' });

    await act(async () => {
      enrollmentsDeferred.resolve({ is_active: true });
    });

    expect(screen.queryByRole('link', { name: 'Go to course' })).toBeNull();
    await waitFor(() =>
      expect(screen.getByText('You are enrolled in this course run')).toHaveAttribute(
        'href',
        'https://edx.local.dev:8073/dashboard',
      ),
    );
    screen.getByText('The course will start in 3 days');
  });

  it('shows a helpful message if the course run is closed', async () => {
    const courseRun: CourseRun = mockFactories.CourseRunFactory.generate();
    courseRun.state.priority = 4;

    await act(async () => {
      render(
        <QueryClientProvider client={createTestQueryClient({ user: null })}>
          <IntlProvider locale="en">
            <SessionProvider>
              <CourseRunEnrollment context={context} courseRun={getCourseRunProp(courseRun)} />
            </SessionProvider>
          </IntlProvider>
        </QueryClientProvider>,
      );
    });

    screen.getByText('Enrollment in this course run is closed at the moment');
    expect(screen.queryByRole('button', { name: 'Enroll now' })).toBeNull();
  });

  it('prompts anonymous users to log in', async () => {
    const courseRun: CourseRun = mockFactories.CourseRunFactory.generate();
    courseRun.state.priority = 0;

    await act(async () => {
      render(
        <QueryClientProvider client={createTestQueryClient({ user: null })}>
          <IntlProvider locale="en">
            <SessionProvider>
              <CourseRunEnrollment context={context} courseRun={getCourseRunProp(courseRun)} />
            </SessionProvider>
          </IntlProvider>
        </QueryClientProvider>,
      );
    });

    screen.getByRole('button', { name: 'Log in to enroll' });
  });
});
