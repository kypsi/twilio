import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col text-center bg-gray-100 px-4">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/">
        <span className="text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition">
          Go back home
        </span>
      </Link>
    </div>
  )
}
