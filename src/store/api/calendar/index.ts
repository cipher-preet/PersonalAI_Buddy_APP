import { baseApi } from '../baseApi';

export type CalendarEventTone = 'indigo' | 'violet' | 'cyan' | 'teal';

export type CalendarEventCard = {
  id: string;
  title: string;
  description: string;
  location: string;
  dateKey: string;
  dateLabel: string;
  startTimeLabel: string;
  endTimeLabel: string;
  tone: CalendarEventTone;
  aiReminder: boolean;
  aiCalling: boolean;
  notification: boolean;
  beeping: boolean;
  remindBeforeMinutes: number;
  reminderId: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CalendarEventWritePayload = {
  title: string;
  description: string;
  location: string;
  dateKey: string;
  dateLabel: string;
  startTimeLabel: string;
  endTimeLabel: string;
  aiReminder: boolean;
  aiCalling: boolean;
  notification: boolean;
  beeping: boolean;
  remindBeforeMinutes: number;
};

interface GetCalendarEventsArgs {
  from: string;
  to: string;
}

interface GetCalendarEventsResponse {
  success: boolean;
  data: {
    events: CalendarEventCard[];
    windows?: Record<string, { startHour: number; endHour: number }>;
    total?: number;
    date?: string;
  };
}

interface GetCalendarEventDateMarkersArgs {
  from: string;
  to: string;
}

interface GetCalendarEventDateMarkersResponse {
  success: boolean;
  data: {
    dates: string[];
    from: string;
    to: string;
  };
}

interface CalendarEventMutationResponse {
  success: boolean;
  data: {
    message?: string;
    event: CalendarEventCard;
  };
}

interface DeleteCalendarEventResponse {
  success: boolean;
  message?: string;
  data: {
    message?: string;
    deletedEventId?: string;
  };
}

export const calendarApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getCalendarEvents: builder.query<
      GetCalendarEventsResponse,
      GetCalendarEventsArgs
    >({
      query: ({ from, to }) => ({
        url: 'home/getCalendarEvents',
        method: 'GET',
        params: { from, to },
      }),
      providesTags: ['Calendar'],
    }),

    getCalendarEventDateMarkers: builder.query<
      GetCalendarEventDateMarkersResponse,
      GetCalendarEventDateMarkersArgs
    >({
      query: ({ from, to }) => ({
        url: 'home/getCalendarEventDateMarkers',
        method: 'GET',
        params: { from, to },
      }),
      providesTags: ['Calendar'],
    }),

    createCalendarEvent: builder.mutation<
      CalendarEventMutationResponse,
      CalendarEventWritePayload
    >({
      query: data => ({
        url: 'home/create-calendar-event',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Calendar', 'Reminders'],
    }),

    updateCalendarEvent: builder.mutation<
      CalendarEventMutationResponse,
      CalendarEventWritePayload & { eventId: string }
    >({
      query: data => ({
        url: 'home/update-calendar-event',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Calendar', 'Reminders'],
    }),

    deleteCalendarEvent: builder.mutation<
      DeleteCalendarEventResponse,
      { eventId: string }
    >({
      query: data => ({
        url: 'home/delete-calendar-event',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted({ eventId }, { dispatch, queryFulfilled, getState }) {
        const patches = calendarApi.util
          .selectInvalidatedBy(getState(), [{ type: 'Calendar' }])
          .filter(entry => entry.endpointName === 'getCalendarEvents')
          .map(entry =>
            dispatch(
              calendarApi.util.updateQueryData(
                'getCalendarEvents',
                entry.originalArgs,
                draft => {
                  if (!draft?.data?.events) {
                    return;
                  }
                  const before = draft.data.events.length;
                  draft.data.events = draft.data.events.filter(
                    event => event.id !== eventId,
                  );
                  if (
                    typeof draft.data.total === 'number' &&
                    draft.data.events.length < before
                  ) {
                    draft.data.total = Math.max(0, draft.data.total - 1);
                  }
                },
              ),
            ),
          );

        try {
          await queryFulfilled;
        } catch {
          patches.forEach(patch => patch.undo());
        }
      },
      invalidatesTags: ['Calendar', 'Reminders'],
    }),
  }),
});

export const {
  useGetCalendarEventsQuery,
  useGetCalendarEventDateMarkersQuery,
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
  useDeleteCalendarEventMutation,
} = calendarApi;
