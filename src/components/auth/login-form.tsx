import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Phone, User as UserIcon } from 'lucide-react'
import { Button, Input, Logo } from '@/components/ui'
import { auth as authApi } from '@/lib/api'
import { auth as tokenStore } from '@/lib/auth'
import { CommunityAvatars } from './community-avatars'
import type { User } from '@/types'

interface LoginFormValues {
  phone: string
  name: string
}

export interface LoginFormProps {
  onSuccess: (user: User) => void
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const router = useRouter()
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { phone: '', name: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setApiError('')
    try {
      const { token, user } = (await authApi.login(
        values.phone.trim(),
        values.name.trim()
      )) as { token: string; user: User }
      tokenStore.setToken(token)
      onSuccess(user)
      router.push('/chat')
    } catch (err: any) {
      setApiError(err?.error?.message || 'Failed to log in. Please try again.')
    }
  }

  return (
    <div className="flex w-full flex-1 items-center justify-center px-6 py-12 md:min-h-screen md:w-1/2 sm:px-10 lg:w-[45%]">
      <div className="w-full max-w-sm">
        <Logo variant="dark" className="mb-8 md:hidden" />

        <h2 className="text-3xl font-extrabold text-gray-900">
          Welcome <span aria-hidden>👋</span>
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Enter your phone number to get started — we&apos;ll sign you in or
          create your account automatically.
        </p>

        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {apiError}
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-8 space-y-5"
        >
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 415 555 0100"
            icon={<Phone className="h-4 w-4" />}
            rightElement={
              <span className="flex h-7 items-center rounded-lg bg-gray-100 px-2 text-xs font-medium text-gray-500">
                🇺🇸 +1
              </span>
            }
            disabled={isSubmitting}
            error={errors.phone?.message}
            {...register('phone', {
              required: 'Phone number is required',
              validate: (value) => {
                if (!/^\d+$/.test(value.replace(/\s/g, ''))) {
                  return 'Phone number must contain only digits'
                }
                const digits = value.replace(/\D/g, '')
                if (digits.length < 10)
                  return 'Phone number must be at least 10 digits'
                return true
              },
            })}
          />

          <Input
            label="Your Name"
            type="text"
            placeholder="Alex Johnson"
            icon={<UserIcon className="h-4 w-4" />}
            disabled={isSubmitting}
            error={errors.name?.message}
            {...register('name', {
              validate: (value) => {
                const trimmed = value.trim()
                if (!trimmed) return 'Name is required'
                if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
                  return 'Name must contain only letters and spaces'
                }
                if (trimmed.length < 3)
                  return 'Name must be at least 3 characters'
                return true
              },
            })}
          />

          <p className="text-xs leading-relaxed text-gray-400">
            By continuing, you agree to our Terms of Service. We&apos;ll send
            you a verification code — standard rates apply.
          </p>

          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="group w-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary-hover"
          >
            Continue
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </form>

        <div className="mt-8">
          <CommunityAvatars />
        </div>
      </div>
    </div>
  )
}

export { LoginForm }
