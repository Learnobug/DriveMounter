import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn
} from '@clerk/nextjs'
import './globals.css'
import {FilesProvider} from '../app/context/FileContext'

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