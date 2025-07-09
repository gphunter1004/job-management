import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'
import Button from '@/components/ui/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 text-primary-600">
            <svg fill="currentColor" viewBox="0 0 24 24" className="h-full w-full">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you might have entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
                Go to Dashboard
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>

          {/* Search suggestion */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Looking for something specific?</span>
            </div>
            <div className="space-y-2 text-sm">
              <Link to="/robots" className="block text-primary-600 hover:text-primary-700">
                → View all robots
              </Link>
              <Link to="/orders" className="block text-primary-600 hover:text-primary-700">
                → Check order status
              </Link>
              <Link to="/templates" className="block text-primary-600 hover:text-primary-700">
                → Browse templates
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Still having trouble? {' '}
            <a 
              href="mailto:support@robotdashboard.com" 
              className="text-primary-600 hover:text-primary-700"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound