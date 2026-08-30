import { baseApi } from '../baseApi';
import type {
  ReminderItem,
  ReminderRepeat,
  ReminderSource,
} from '../../../screens/RemindersScreen/components/mockReminders';

export type ReminderCard = Omit<ReminderItem, 'emoji'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ReminderWritePayload = {
  title: string;
  description: string;
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
  repeat: ReminderRepeat;
  aiCalling: boolean;
  notification: boolean;
  beeping: boolean;
  source?: ReminderSource;
};

interface GetRemindersArgs {
  limit?: number;
  cursor?: string;
  source?: ReminderSource | 'all';
  dateFilter?: 'all' | 'today' | 'tomorrow' | 'week';
  anchorDate?: string;
}

interface GetRemindersResponse {
  success: boolean;
  data: {
    reminders: ReminderCard[];
    nextCursor: string | null;
  };
}

interface ReminderMutationResponse {
  success: boolean;
  data: {
    message?: string;
    reminder: ReminderCard;
  };
}

interface DeleteReminderResponse {
  success: boolean;
  message?: string;
  data: {
    message?: string;
    data?: {
      deletedReminderId?: string;
    };
  };
}

export const remindersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getReminders: builder.query<GetRemindersResponse, GetRemindersArgs>({
      query: ({
        limit = 20,
        cursor = '',
        source = 'all',
        dateFilter = 'all',
        anchorDate = '',
      }) => ({
        url: 'home/getReminders',
        method: 'GET',
        params: {
          limit,
          cursor,
          source,
          dateFilter,
          anchorDate,
        },
      }),
      providesTags: ['Reminders'],
    }),

    createReminder: builder.mutation<
      ReminderMutationResponse,
      ReminderWritePayload
    >({
      query: data => ({
        url: 'home/create-reminder',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reminders'],
    }),

    updateReminder: builder.mutation<
      ReminderMutationResponse,
      ReminderWritePayload & { reminderId: string }
    >({
      query: data => ({
        url: 'home/update-reminder',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reminders'],
    }),

    deleteReminder: builder.mutation<
      DeleteReminderResponse,
      { reminderId: string }
    >({
      query: data => ({
        url: 'home/delete-reminder',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reminders'],
    }),
  }),
});

export const {
  useGetRemindersQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
} = remindersApi;
