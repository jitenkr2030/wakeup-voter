'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Calendar, 
  MapPin, 
  User, 
  Building, 
  FileVideo, 
  FileImage, 
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface ReportPromiseFormProps {
  onSubmit?: (data: any) => void
  onCancel?: () => void
}

export function ReportPromiseForm({ onSubmit, onCancel }: ReportPromiseFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    partyId: '',
    leaderId: '',
    electionYear: new Date().getFullYear(),
    state: '',
    constituency: '',
    promiseDate: '',
    promiseLocation: '',
    sourceUrl: '',
    sourceType: 'speech',
    evidenceUrl: '',
    evidenceType: 'video',
    tags: ''
  })

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const categories = [
    { value: 'women', label: 'महिलाएं' },
    { value: 'farmers', label: 'किसान' },
    { value: 'youth', label: 'युवा' },
    { value: 'economy', label: 'अर्थव्यवस्था' },
    { value: 'jobs', label: 'रोजगार' },
    { value: 'infrastructure', label: 'बुनियादी ढांचा' },
    { value: 'education', label: 'शिक्षा' },
    { value: 'health', label: 'स्वास्थ्य' },
    { value: 'environment', label: 'पर्यावरण' }
  ]

  const sourceTypes = [
    { value: 'speech', label: 'भाषण' },
    { value: 'interview', label: 'इंटरव्यू' },
    { value: 'manifesto', label: 'घोषणा पत्र' },
    { value: 'rally', label: 'रैली' },
    { value: 'press_conference', label: 'प्रेस कॉन्फ्रेंस' },
    { value: 'social_media', label: 'सोशल मीडिया' }
  ]

  const evidenceTypes = [
    { value: 'video', label: 'वीडियो' },
    { value: 'audio', label: 'ऑडियो' },
    { value: 'image', label: 'इमेज' },
    { value: 'document', label: 'दस्तावेज़' }
  ]

  const parties = [
    { value: '1', label: 'भारतीय जनता पार्टी (BJP)' },
    { value: '2', label: 'भारतीय राष्ट्रीय कांग्रेस (INC)' },
    { value: '3', label: 'आम आदमी पार्टी (AAP)' },
    { value: '4', label: 'समाजवादी पार्टी (SP)' },
    { value: '5', label: 'बहुजन समाज पार्टी (BSP)' },
    { value: '6', label: 'तृणमूल कांग्रेस (TMC)' },
    { value: '7', label: 'द्रविड़ मुनेत्र कड़गम (DMK)' },
    { value: '8', label: 'शिवसेना (SHS)' },
    { value: '9', label: 'जनता दल (यू) (JD(U))' },
    { value: '10', label: 'राष्ट्रीय जनता दल (RJD)' }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('फाइल साइज़ 50MB से कम होना चाहिए')
        return
      }
      
      // Check file type
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'audio/mp3', 'audio/wav', 'image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        alert('कृपया वैध फाइल प्रकार अपलोड करें (वीडियो, ऑडियो, इमेज, PDF)')
        return
      }
      
      setUploadedFile(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category || !formData.partyId) {
        throw new Error('कृपया सभी आवश्यक फ़ील्ड भरें')
      }

      // Create form data for file upload
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString())
      })

      if (uploadedFile) {
        submitData.append('evidenceFile', uploadedFile)
      }

      // Call API
      const response = await fetch('/api/promises', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('वादा रिपोर्ट करने में त्रुटि')
      }

      const result = await response.json()
      setSubmitStatus('success')
      
      if (onSubmit) {
        onSubmit(result.data)
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setSubmitStatus('idle')
        if (onCancel) {
          onCancel()
        }
      }, 2000)

    } catch (error) {
      console.error('Error submitting promise:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileVideo className="h-5 w-5" />
          <span>नया राजनीतिक वादा रिपोर्ट करें</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">बुनियादी जानकारी</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">वादे का शीर्षक *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="वादे का शीर्षक दर्ज करें"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">श्रेणी *</label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="श्रेणी चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">वादे का विवरण *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="वादे का विस्तृत विवरण दर्ज करें..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Political Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">राजनीतिक जानकारी</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">राजनीतिक दल *</label>
                <Select value={formData.partyId} onValueChange={(value) => handleInputChange('partyId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="राजनीतिक दल चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    {parties.map(party => (
                      <SelectItem key={party.value} value={party.value}>
                        {party.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">चुनाव वर्ष *</label>
                <Input
                  type="number"
                  value={formData.electionYear}
                  onChange={(e) => handleInputChange('electionYear', parseInt(e.target.value))}
                  min="2000"
                  max={new Date().getFullYear() + 5}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">राज्य</label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="राज्य दर्ज करें"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">निर्वाचन क्षेत्र</label>
                <Input
                  value={formData.constituency}
                  onChange={(e) => handleInputChange('constituency', e.target.value)}
                  placeholder="निर्वाचन क्षेत्र दर्ज करें"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">वादे की तारीख</label>
                <Input
                  type="date"
                  value={formData.promiseDate}
                  onChange={(e) => handleInputChange('promiseDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Source Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">स्रोत जानकारी</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">स्रोत प्रकार</label>
                <Select value={formData.sourceType} onValueChange={(value) => handleInputChange('sourceType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="स्रोत प्रकार चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">वादे का स्थान</label>
                <Input
                  value={formData.promiseLocation}
                  onChange={(e) => handleInputChange('promiseLocation', e.target.value)}
                  placeholder="वादे का स्थान दर्ज करें"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">स्रोत URL</label>
              <Input
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                placeholder="https://example.com/speech-video"
              />
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">सबूत अपलोड करें</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileUpload}
                accept="video/*,audio/*,image/*,.pdf"
                className="hidden"
                id="evidence-upload"
              />
              
              {!uploadedFile ? (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label htmlFor="evidence-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-800">
                      सबूत अपलोड करें
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    वीडियो, ऑडियो, इमेज, या PDF (अधिकतम 50MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {uploadedFile.type.startsWith('video/') && <FileVideo className="h-8 w-8 text-blue-600" />}
                    {uploadedFile.type.startsWith('audio/') && <FileVideo className="h-8 w-8 text-green-600" />}
                    {uploadedFile.type.startsWith('image/') && <FileImage className="h-8 w-8 text-purple-600" />}
                    {uploadedFile.type === 'application/pdf' && <FileVideo className="h-8 w-8 text-red-600" />}
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">टैग्स</label>
            <Input
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="टैग्स को कॉमा से अलग करें (जैसे: शिक्षा, स्वास्थ्य, किसान)"
            />
          </div>

          {/* Submit Status */}
          {submitStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                वादा सफलतापूर्वक रिपोर्ट किया गया! एडमिन द्वारा सत्यापन के बाद यह प्रकाशित किया जाएगा।
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                वादा रिपोर्ट करने में त्रुटि। कृपया फिर से कोशिश करें।
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                रद्द करें
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'जमा हो रहा है...' : 'वादा रिपोर्ट करें'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}