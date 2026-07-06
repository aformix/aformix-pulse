import { useRouteError, isRouteErrorResponse } from "react-router-dom"
import { AlertCircle } from "lucide-react"

export function ErrorBoundary() {
  const error = useRouteError()

  let errorMessage = "An unexpected error occurred."
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-destructive/50 bg-destructive/10 p-8 text-center m-6">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-destructive">Oops! Something went wrong.</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          {errorMessage}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
