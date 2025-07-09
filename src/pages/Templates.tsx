import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store'
import { 
  fetchTemplates,
  createTemplate,
  deleteTemplate,
  duplicateTemplate,
  setFilters
} from '@/store/slices/templateSlice'
import { 
  FileText, 
  Search, 
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  Edit,
  Play
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/Loading'
import SearchBar from '@/components/common/SearchBar'

const Templates = () => {
  const dispatch = useAppDispatch()
  const { 
    templates, 
    isLoading, 
    error,
    filters
  } = useAppSelector(state => state.templates)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')

  // 안전한 배열 처리
  const safeTemplates = templates || []

  useEffect(() => {
    dispatch(fetchTemplates())
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(fetchTemplates())
  }

  const handleCreateTemplate = async () => {
    if (newTemplateName.trim()) {
      try {
        await dispatch(createTemplate({
          name: newTemplateName.trim(),
          description: newTemplateDescription.trim() || undefined
        })).unwrap()
        setShowCreateModal(false)
        setNewTemplateName('')
        setNewTemplateDescription('')
      } catch (error) {
        console.error('Failed to create template:', error)
      }
    }
  }

  const handleDuplicateTemplate = async (templateId: number, originalName: string) => {
    const newName = prompt(`Enter name for duplicated template:`, `Copy of ${originalName}`)
    if (newName) {
      try {
        await dispatch(duplicateTemplate({ templateId, newName })).unwrap()
      } catch (error) {
        console.error('Failed to duplicate template:', error)
      }
    }
  }

  const handleDeleteTemplate = async (templateId: number, templateName: string) => {
    if (window.confirm(`Are you sure you want to delete template "${templateName}"? This action cannot be undone.`)) {
      try {
        await dispatch(deleteTemplate(templateId)).unwrap()
      } catch (error) {
        console.error('Failed to delete template:', error)
      }
    }
  }

  const handleSearchChange = (search: string) => {
    dispatch(setFilters({ search }))
  }

  const handleSortChange = (sortBy: 'name' | 'createdAt' | 'updatedAt') => {
    const sortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    dispatch(setFilters({ sortBy, sortOrder }))
  }

  // Filter and sort templates with safety checks
  const filteredTemplates = safeTemplates
    .filter(template => {
      if (filters.search &&
          !template.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !(template.description?.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      const direction = filters.sortOrder === 'asc' ? 1 : -1
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * direction
        case 'updatedAt':
          return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * direction
        case 'createdAt':
        default:
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction
      }
    })

  if (isLoading && safeTemplates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading templates..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Templates</h1>
          <p className="text-gray-600">
            Create and manage reusable order templates
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Template
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Template Overview</h3>
            <p className="text-sm text-gray-600">
              {safeTemplates.length} template{safeTemplates.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{safeTemplates.length}</p>
              <p className="text-sm text-gray-500">Total Templates</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Search and Sort */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <SearchBar
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search templates by name or description..."
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">Sort by:</span>
            <button
              onClick={() => handleSortChange('name')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filters.sortBy === 'name'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Name {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('createdAt')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filters.sortBy === 'createdAt'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Created {filters.sortBy === 'createdAt' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('updatedAt')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filters.sortBy === 'updatedAt'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Updated {filters.sortBy === 'updatedAt' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-6">
          <div className="flex items-center text-error-600">
            <FileText className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {safeTemplates.length === 0 ? 'No templates found' : 'No templates match your search'}
          </h3>
          <p className="text-gray-500 mb-6">
            {safeTemplates.length === 0 
              ? 'Create your first template to get started.'
              : 'Try adjusting your search criteria.'
            }
          </p>
          {safeTemplates.length === 0 && (
            <Button 
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Template
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500">ID: {template.id}</p>
                  </div>
                </div>
              </div>

              {template.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {template.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>
                  Created {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                </span>
                <span>
                  Updated {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Link to={`/templates/${template.id}`}>
                  <Button variant="outline" size="sm" leftIcon={<Edit className="w-3 h-3" />}>
                    Edit
                  </Button>
                </Link>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Copy className="w-3 h-3" />}
                    onClick={() => handleDuplicateTemplate(template.id, template.name)}
                    title="Duplicate template"
                  >
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 className="w-3 h-3" />}
                    onClick={() => handleDeleteTemplate(template.id, template.name)}
                    className="text-error-600 hover:text-error-700"
                    title="Delete template"
                  >
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Template</h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Template Name *</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="form-input"
                  placeholder="Enter template name..."
                />
              </div>
              
              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="Enter template description..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  setNewTemplateName('')
                  setNewTemplateDescription('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateTemplate}
                disabled={!newTemplateName.trim()}
                loading={isLoading}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      {filteredTemplates.length > 0 && safeTemplates.length > filteredTemplates.length && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredTemplates.length} of {safeTemplates.length} templates
        </div>
      )}
    </div>
  )
}

export default Templates