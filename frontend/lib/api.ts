import { notifyUnauthorized } from '@/lib/auth-events';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
  errors?: { field: string; message: string }[];
};

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function shouldHandleUnauthorized(endpoint: string) {
  return !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register');
}

async function makeRequest(endpoint: string, options: RequestInit = {}) {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await makeRequest(endpoint, options);
  } catch {
    throw new ApiError(0, 'Unable to connect to the server. Check your internet connection and try again.');
  }

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    if (!res.ok) {
      throw new ApiError(res.status, `Server error (${res.status}). Please try again later.`);
    }
    throw new ApiError(res.status, 'Received an unexpected response from the server.');
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined' && shouldHandleUnauthorized(endpoint)) {
      notifyUnauthorized();
    }
    throw new ApiError(res.status, json.message || `Request failed (${res.status})`, json.errors);
  }

  return json.data;
}

async function requestBlob(
  endpoint: string,
  options: RequestInit = {},
): Promise<Blob> {
  let res: Response;
  try {
    res = await makeRequest(endpoint, options);
  } catch {
    throw new ApiError(0, 'Unable to connect to the server. Check your internet connection and try again.');
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined' && shouldHandleUnauthorized(endpoint)) {
      notifyUnauthorized();
    }

    try {
      const json = (await res.json()) as ApiResponse<null>;
      return Promise.reject(
        new ApiError(res.status, json.message || 'Request failed.', json.errors),
      );
    } catch {
      throw new ApiError(res.status, 'Failed to export expenses. Please try again.');
    }
  }

  return res.blob();
}

export const api = {
  auth: {
    register: (body: { name: string; email: string; password: string }) =>
      request<{ user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    logout: () =>
      request<null>('/auth/logout', { method: 'POST' }),
    me: () =>
      request<{ user: User }>('/auth/me'),
  },

  expenses: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return request<{ expenses: Expense[]; pagination: Pagination }>(
        `/expenses${query}`,
      );
    },
    create: (body: CreateExpenseInput) =>
      request<{ expense: Expense }>('/expenses', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<CreateExpenseInput>) =>
      request<{ expense: Expense }>(`/expenses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    delete: (id: string) =>
      request<null>(`/expenses/${id}`, { method: 'DELETE' }),
    summary: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return request<ExpenseSummary>(`/expenses/summary${query}`);
    },
    export: async (params?: { startDate?: string; endDate?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return requestBlob(`/expenses/export${query}`);
    },
  },

  users: {
    updateProfile: (body: { name: string }) =>
      request<{ user: User }>('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    changePassword: (body: { currentPassword: string; newPassword: string; confirmNewPassword: string }) =>
      request<null>('/users/password', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    deleteAccount: (body: { password: string }) =>
      request<null>('/users/account', {
        method: 'DELETE',
        body: JSON.stringify(body),
      }),
  },
};

export { ApiError };

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type Expense = {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateExpenseInput = {
  amount: number;
  category: string;
  date: string;
  note?: string | null;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ExpenseSummary = {
  totalAmount: number;
  expenseCount: number;
  byCategory: { category: string; totalAmount: number; count: number }[];
};
