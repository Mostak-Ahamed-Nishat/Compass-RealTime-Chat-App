import * as React from 'react'
import { LogoLink } from '@/components/ui'

const SiteFooter = () => (
  <footer className="border-t border-white/10 bg-[#0b0b12] py-10 text-white">
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
      <LogoLink variant="light" />
      <p className="text-sm text-white/40">
        © {new Date().getFullYear()} Compass. All rights reserved.
      </p>
    </div>
  </footer>
)

export { SiteFooter }
