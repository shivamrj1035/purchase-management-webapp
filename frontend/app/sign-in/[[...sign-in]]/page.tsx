import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Purchase Manager
          </h1>
          <p className="text-slate-400">
            Sign in to manage your purchases & finances
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-slate-900 border-slate-800 shadow-2xl w-full",
            },
          }}
        />
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Your data is stored securely in your own Google Spreadsheet
          </p>
        </div>
      </div>
    </div>
  );
}
