import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store'
import { setPreferences, setThemeMode, setColorScheme } from '@/store/slices/uiSlice'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Save,
  RefreshCw
} from 'lucide-react'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const Settings = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { preferences, theme } = useAppSelector(state => state.ui)
  
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'system' | 'security'>('profile')
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [localPreferences, setLocalPreferences] = useState(preferences)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'system', label: 'System', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const

  const handlePreferenceChange = (key: string, value: any) => {
    setLocalPreferences(prev => ({ ...prev, [key]: value }))
    setUnsavedChanges(true)
  }

  const handleSaveSettings = () => {
    dispatch(setPreferences(localPreferences))
    setUnsavedChanges(false)
  }

  const handleResetSettings = () => {
    setLocalPreferences(preferences)
    setUnsavedChanges(false)
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch(setThemeMode(newTheme))
  }

  const handleColorSchemeChange = (scheme: 'blue' | 'green' | 'purple' | 'orange' | 'red') => {
    dispatch(setColorScheme(scheme))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
        
        {unsavedChanges && (
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={handleResetSettings}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSaveSettings}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="p-4 lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      value={user?.firstName || ''}
                      className="form-input"
                      placeholder="Enter first name"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      value={user?.lastName || ''}
                      className="form-input"
                      placeholder="Enter last name"
                      readOnly
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="form-input"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    className="form-input"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    className="form-input capitalize"
                    readOnly
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Profile information is managed by your administrator. Contact support to make changes.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Sound Notifications</h4>
                    <p className="text-sm text-gray-500">Play sounds for important notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.soundEnabled}
                    onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Auto Refresh</h4>
                    <p className="text-sm text-gray-500">Automatically refresh data at regular intervals</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.autoRefresh}
                    onChange={(e) => handlePreferenceChange('autoRefresh', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="form-label">Refresh Interval (seconds)</label>
                  <select
                    value={localPreferences.refreshInterval}
                    onChange={(e) => handlePreferenceChange('refreshInterval', Number(e.target.value))}
                    className="form-input"
                    disabled={!localPreferences.autoRefresh}
                  >
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Show Help Tips</h4>
                    <p className="text-sm text-gray-500">Display helpful tips and guidance</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.showHelpTips}
                    onChange={(e) => handlePreferenceChange('showHelpTips', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Appearance Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="form-label">Theme</label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {(['light', 'dark', 'system'] as const).map((themeOption) => (
                      <button
                        key={themeOption}
                        onClick={() => handleThemeChange(themeOption)}
                        className={`p-3 border-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                          theme.mode === themeOption
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {themeOption}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Color Scheme</label>
                  <div className="grid grid-cols-5 gap-3 mt-2">
                    {(['blue', 'green', 'purple', 'orange', 'red'] as const).map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSchemeChange(color)}
                        className={`h-12 rounded-lg border-2 transition-all ${
                          theme.colorScheme === color
                            ? 'border-gray-400 scale-110'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          backgroundColor: {
                            blue: '#3b82f6',
                            green: '#22c55e',
                            purple: '#a855f7',
                            orange: '#f97316',
                            red: '#ef4444'
                          }[color]
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Animations</h4>
                    <p className="text-sm text-gray-500">Enable smooth animations and transitions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.animationsEnabled}
                    onChange={(e) => handlePreferenceChange('animationsEnabled', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Compact Tables</h4>
                    <p className="text-sm text-gray-500">Use compact layout for data tables</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.compactTables}
                    onChange={(e) => handlePreferenceChange('compactTables', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">System Preferences</h3>
              <div className="space-y-6">
                <div>
                  <label className="form-label">Language</label>
                  <select
                    value={localPreferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="form-input"
                  >
                    <option value="en">English</option>
                    <option value="ko">한국어</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Timezone</label>
                  <select
                    value={localPreferences.timezone}
                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                    className="form-input"
                  >
                    <option value="UTC">UTC</option>
                    <option value="Asia/Seoul">Asia/Seoul (KST)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Date Format</label>
                  <select
                    value={localPreferences.dateFormat}
                    onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                    className="form-input"
                  >
                    <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                    <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                    <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                    <option value="dd MMM yyyy">dd MMM yyyy</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Time Format</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      onClick={() => handlePreferenceChange('timeFormat', '12h')}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                        localPreferences.timeFormat === '12h'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      12-hour (AM/PM)
                    </button>
                    <button
                      onClick={() => handlePreferenceChange('timeFormat', '24h')}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                        localPreferences.timeFormat === '24h'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      24-hour
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <Shield className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Security settings are managed by your system administrator. 
                        Contact support for password changes or security updates.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Current Session</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">User:</span>
                        <span className="text-gray-900">{user?.username}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Role:</span>
                        <span className="text-gray-900 capitalize">{user?.role}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Login:</span>
                        <span className="text-gray-900">
                          {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Permissions</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {user?.permissions?.map((permission, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-success-400 rounded-full mr-2"></div>
                          <span className="text-gray-700">{permission.name}</span>
                        </div>
                      )) || (
                        <div className="text-sm text-gray-500">No permissions data available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Save Changes Bar */}
      {unsavedChanges && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 flex items-center space-x-4 z-50">
          <p className="text-sm text-gray-700">You have unsaved changes</p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleResetSettings}>
              Discard
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveSettings}>
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings