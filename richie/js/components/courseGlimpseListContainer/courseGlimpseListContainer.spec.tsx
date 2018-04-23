import Course from '../../types/Course';
import { mapStateToProps } from './courseGlimpseListContainer';

describe('components/courseGlimpseListContainer', () => {
  it('mapStateToProps builds a list of courses from the current state', () => {
    const course43 = {
      end_date: '2018-05-31T06:00:00.000Z',
      enrollment_end_date: '2018-03-15T06:00:00.000Z',
      enrollment_start_date: '2018-02-01T06:00:00.000Z',
      id: 43,
      language: 'fr',
      organizations: [23, 31],
      session_number: 1,
      short_description: 'Lorem ipsum dolor sit amet consectetur adipiscim elit.',
      start_date: '2018-03-01T06:00:00.000Z',
      subjects: [45],
      thumbnails: {
        about: 'https://example.com/about_43.png',
        big: 'https://example.com/big_43.png',
        facebook: 'https://example.com/facebook_43.png',
        small: 'https://example.com/small_43.png',
      },
      title: 'Python for data science',
    };

    const course44 = {
      end_date: '2018-04-30T06:00:00.000Z',
      enrollment_end_date: '2018-02-28T06:00:00.000Z',
      enrollment_start_date: '2018-02-01T06:00:00.000Z',
      id: 44,
      language: 'fr',
      organizations: [11],
      session_number: 1,
      short_description: 'Phasellus hendrerit tortor nulla, ut tristique ante aliquam sed.',
      start_date: '2018-03-01T06:00:00.000Z',
      subjects: [7, 128],
      thumbnails: {
        about: 'https://example.com/about_44.png',
        big: 'https://example.com/big_44.png',
        facebook: 'https://example.com/facebook_44.png',
        small: 'https://example.com/small_44.png',
      },
      title: 'Programming 101 in Python',
    };

    const state = {
      resources: {
        courses: {
          byId: { 43: course43, 44: course44 },
          currentQuery: {
            facets: {},
            items: { 0: 44, 1: 43 },
            params: { limit: 2, offset: 0 },
            total_count: 2,
          },
        },
      },
    };

    expect(mapStateToProps(state)).toEqual({
      courses: [ course44, course43 ],
    });
  });
});
