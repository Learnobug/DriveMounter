import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  RedirectToSignIn
} from '@clerk/nextjs'
import './globals.css'
import {FilesProvider} from '../app/context/FileContext'
import Navbar from './components/Navbar'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
       <FilesProvider>
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
      </FilesProvider>
    </ClerkProvider>
  )
}