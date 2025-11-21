// Purpose: Sign-in page route - displays SignInForm component
// Accessible at: /auth/signin
import SignInForm from "@/app/components/forms/SignInForm";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignInForm />
    </div>
  );
}