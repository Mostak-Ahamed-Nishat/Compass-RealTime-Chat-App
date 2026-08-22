import * as React from 'react'
import { Logo } from '@/components/ui'

const SiteFooter = () => (
  <footer className="border-t border-gray-100 bg-white py-10">
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
      <Logo variant="dark" />
      <p className="text-sm text-secondary">
        © {new Date().getFullYear()} Compass. All rights reserved.
      </p>
    </div>
  </footer>
)

export { SiteFooter }
