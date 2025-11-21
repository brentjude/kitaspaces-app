// Purpose: Root page - redirects to sign-in page
// Redirect: All unauthenticated users go to /auth/signin
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/auth/signin');
}