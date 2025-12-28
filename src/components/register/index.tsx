'use client';

import { useReducer, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import { userApi } from '@/api/user';
import { ApiError } from '@/api/client';
import { validationApi } from '@/api/validation';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/common/Input/index';
import PrivateInput from '@/components/common/Input/PrivateInput';
import Button from '@/components/common/Button';
import AuthFormContainer from '@/components/auth/AuthFormContainer';

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthday: string;
}

interface State {
  formData: FormData;
  loading: boolean;
  error: string;
  hasAttemptedSubmit: boolean;
}

type Action =
  | { type: 'UPDATE_FIELD'; field: keyof FormData; value: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESET_FORM' }
  | { type: 'SET_ATTEMPTED_SUBMIT'; attempted: boolean };

// Initial state
const initialState: State = {
  formData: {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthday: '',
  },
  loading: false,
  error: '',
  hasAttemptedSubmit: false,
};

// Reducer function
const registrationReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
        error: '', // Clear error when user starts typing
        hasAttemptedSubmit: false, // Reset submit attempt when user types
      };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false };
    case 'RESET_FORM':
      return initialState;
    case 'SET_ATTEMPTED_SUBMIT':
      return { ...state, hasAttemptedSubmit: action.attempted };
    default:
      return state;
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const { setTokens } = useAuth();
  const [state, dispatch] = useReducer(registrationReducer, initialState);

  // Availability state
  const [usernameAvailability, setUsernameAvailability] = useState<
    boolean | null
  >(null);

  // Debounced username check function
  const checkUsernameAvailability = useMemo(
    () =>
      debounce(async (username: string) => {
        if (!username || username.length < 2) {
          setUsernameAvailability(null);
          return;
        }

        try {
          const result =
            await validationApi.checkUsernameAvailability(username);
          setUsernameAvailability(result.available);
        } catch (error) {
          console.error('Username check failed:', error);
          setUsernameAvailability(null);
        }
      }, 500),
    []
  );

  // Clear availability immediately when username changes (before debounce)
  useEffect(() => {
    setUsernameAvailability(null);
  }, [state.formData.username]);

  // Trigger debounced check when username changes
  useEffect(() => {
    checkUsernameAvailability(state.formData.username);
  }, [state.formData.username, checkUsernameAvailability]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      checkUsernameAvailability.cancel();
    };
  }, [checkUsernameAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_ATTEMPTED_SUBMIT', attempted: true });
    dispatch({ type: 'SET_LOADING', loading: true });

    try {
      // Check if username is available
      if (usernameAvailability === false) {
        dispatch({
          type: 'SET_ERROR',
          error: 'Username is already taken.',
        });
        return;
      }

      // Validate first/last name contain only letters
      const namePattern = /^[A-Za-z]{2,30}$/;
      if (
        !namePattern.test(state.formData.firstName) ||
        !namePattern.test(state.formData.lastName)
      ) {
        dispatch({
          type: 'SET_ERROR',
          error: 'First and last name must only contain letters.',
        });
        return;
      }

      // Validate username
      const usernamePattern = /^[a-z0-9]{2,20}$/;
      if (!usernamePattern.test(state.formData.username)) {
        dispatch({
          type: 'SET_ERROR',
          error: 'Username must only contain lowercase letters and numbers.',
        });
        return;
      }

      // Check if passwords match
      if (state.formData.password !== state.formData.confirmPassword) {
        dispatch({ type: 'SET_ERROR', error: 'Passwords do not match' });
        return;
      }

      // Remove confirmPassword from the data sent to API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _, ...registrationData } = state.formData;

      // Register and auto-login the user (backend validates age requirement)
      const loginResponse = await userApi.registerAndLogin(registrationData);
      console.log('User registered and logged in successfully');

      // Set the tokens in auth context
      setTokens(loginResponse.accessToken, loginResponse.refreshToken);

      // Redirect to dashboard
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError) {
        dispatch({ type: 'SET_ERROR', error: err.message });
      } else {
        dispatch({
          type: 'SET_ERROR',
          error: err instanceof Error ? err.message : 'Registration failed',
        });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  };

  return (
    <AuthFormContainer
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      {state.error && (
        <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
          {state.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="your@email.com"
          value={state.formData.email || ''}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_FIELD',
              field: 'email',
              value: e.target.value,
            })
          }
          required
        />

        <div>
          <PrivateInput
            id="password"
            label="Password"
            placeholder="Create a secure password"
            value={state.formData.password || ''}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                field: 'password',
                value: e.target.value,
              })
            }
            required
            minLength={8}
          />
          <p className="text-text-col/60 text-xs mt-1">
            Minimum 8 characters with complexity requirements
          </p>
        </div>

        <PrivateInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={state.formData.confirmPassword || ''}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_FIELD',
              field: 'confirmPassword',
              value: e.target.value,
            })
          }
          required
          minLength={8}
          error={
            state.hasAttemptedSubmit &&
            state.formData.confirmPassword &&
            state.formData.password !== state.formData.confirmPassword
              ? 'Passwords do not match'
              : undefined
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="firstName"
            type="text"
            label="First Name"
            placeholder="First name"
            value={state.formData.firstName || ''}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                field: 'firstName',
                value: e.target.value,
              })
            }
            required
            minLength={2}
            maxLength={30}
          />
          <Input
            id="lastName"
            type="text"
            label="Last Name"
            placeholder="Last name"
            value={state.formData.lastName || ''}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                field: 'lastName',
                value: e.target.value,
              })
            }
            required
            minLength={2}
            maxLength={30}
          />
        </div>

        <div>
          <Input
            id="username"
            type="text"
            label="Username"
            placeholder="username123"
            value={state.formData.username || ''}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                field: 'username',
                value: e.target.value.toLowerCase(),
              })
            }
            required
            minLength={2}
            maxLength={20}
          />
          {usernameAvailability === true && state.formData.username && (
            <p className="text-green-500 text-xs mt-1">
              {state.formData.username} is available
            </p>
          )}
          {usernameAvailability === false && state.formData.username && (
            <p className="text-red-500 text-xs mt-1">
              {state.formData.username} is already taken
            </p>
          )}
          {!state.formData.username && (
            <p className="text-text-col/60 text-xs mt-1">
              Lowercase letters and numbers only (2-20 characters)
            </p>
          )}
        </div>

        <div>
          <Input
            id="birthday"
            type="date"
            label="Birthday"
            value={state.formData.birthday || ''}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                field: 'birthday',
                value: e.target.value,
              })
            }
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              target.setCustomValidity('');
            }}
            onInvalid={(e) => {
              const target = e.target as HTMLInputElement;
              if (
                target.validity.rangeOverflow ||
                target.validity.rangeUnderflow
              ) {
                target.setCustomValidity('Must be 13 years old to join');
              } else if (target.validity.valueMissing) {
                target.setCustomValidity('Birthday is required');
              }
            }}
            max={
              new Date(
                new Date().getFullYear() - 13,
                new Date().getMonth(),
                new Date().getDate()
              )
                .toISOString()
                .split('T')[0]
            }
            required
          />
          <p className="text-text-col/60 text-xs mt-1">
            You must be at least 13 years old to register
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={state.loading}
          loadingText="Creating Account..."
          className="w-full"
        >
          Create Account
        </Button>
      </form>
    </AuthFormContainer>
  );
}
