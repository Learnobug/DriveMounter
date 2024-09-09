import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  RedirectToSignIn
} from '@clerk/nextjs'
import './globals.css'
import Navbar from './components/Navbar'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          <SignedIn>
          {children}
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  )
}