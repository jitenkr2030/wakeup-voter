'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Share2, 
  MessageCircle, 
  Send, 
  Copy, 
  Check,
  X,
  WhatsappIcon,
  Twitter,
  Facebook
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface ShareableContent {
  title: string
  description: string
  url: string
  category?: string
  tags?: string[]
  imageUrl?: string
}

interface ShareComponentProps {
  content: ShareableContent
  type?: 'promise' | 'issue' | 'report' | 'leader' | 'party'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function ShareComponent({ 
  content, 
  type = 'promise', 
  size = 'md', 
  showText = true 
}: ShareComponentProps) {
  const [copied, setCopied] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  })

  const getShareText = () => {
    const baseText = `${content.title}\n\n${content.description}`
    return customMessage ? `${customMessage}\n\n${baseText}` : baseText
  }

  const getShareUrl = () => {
    return content.url || (typeof window !== 'undefined' ? window.location.href : '')
  }

  const copyToClipboard = async () => {
    const text = getShareText()
    const url = getShareUrl()
    const fullText = `${text}\n\n${url}`
    
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(getShareText())
    const url = encodeURIComponent(getShareUrl())
    const whatsappUrl = `https://wa.me/?text=${text}%0A%0A${url}`
    
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}?text=${text}%0A%0A${url}`, '_blank')
    } else {
      window.open(whatsappUrl, '_blank')
    }
  }

  const shareOnTwitter = () => {
    const text = encodeURIComponent(getShareText())
    const url = encodeURIComponent(getShareUrl())
    const hashtags = content.tags ? content.tags.map(tag => `%23${tag.replace(/\s+/g, '')}`).join('%20') : '%23असलमुद्दे'
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`
    window.open(twitterUrl, '_blank')
  }

  const shareOnFacebook = () => {
    const url = encodeURIComponent(getShareUrl())
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
    window.open(facebookUrl, '_blank')
  }

  const shareOnTelegram = () => {
    const text = encodeURIComponent(getShareText())
    const url = encodeURIComponent(getShareUrl())
    const telegramUrl = `https://t.me/share/url?url=${url}&text=${text}`
    window.open(telegramUrl, '_blank')
  }

  const sendEmail = () => {
    const subject = encodeURIComponent(emailData.subject || content.title)
    const body = encodeURIComponent(`${emailData.message}\n\n${getShareText()}\n\n${getShareUrl()}`)
    const mailtoUrl = `mailto:${emailData.to}?subject=${subject}&body=${body}`
    window.location.href = mailtoUrl
  }

  const generateShareImage = () => {
    // This would typically call an API to generate a shareable image
    // For now, we'll just show an alert
    alert('शेयर इमेज जनरेट किया जा रहा है... (यह सुविधा जल्द ही उपलब्ध होगी)')
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-8 px-2 text-sm'
      case 'lg': return 'h-12 px-6 text-lg'
      default: return 'h-10 px-4'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3'
      case 'lg': return 'h-6 w-6'
      default: return 'h-4 w-4'
    }
  }

  const shareButtons = [
    {
      name: 'WhatsApp',
      icon: <WhatsappIcon className={getIconSize()} />,
      color: 'bg-green-500 hover:bg-green-600',
      action: shareOnWhatsApp
    },
    {
      name: 'Twitter',
      icon: <Twitter className={getIconSize()} />,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: shareOnTwitter
    },
    {
      name: 'Facebook',
      icon: <Facebook className={getIconSize()} />,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: shareOnFacebook
    },
    {
      name: 'Telegram',
      icon: <Send className={getIconSize()} />,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: shareOnTelegram
    },
    {
      name: 'Copy Link',
      icon: copied ? <Check className={getIconSize()} /> : <Copy className={getIconSize()} />,
      color: copied ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600',
      action: copyToClipboard
    }
  ]

  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size={size} className={getSizeClasses()}>
            <Share2 className={getIconSize()} />
            {showText && <span className="ml-2">शेयर करें</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">शेयर करें</h4>
              <p className="text-sm text-gray-600 mb-3">
                {content.title}
              </p>
            </div>
            
            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {shareButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={`justify-start ${button.color} text-white border-none`}
                  onClick={button.action}
                >
                  {button.icon}
                  <span className="ml-2">{button.name}</span>
                </Button>
              ))}
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium mb-2">
                कस्टम मैसेज (वैकल्पिक)
              </label>
              <Textarea
                placeholder="अपना संदेश यहाँ जोड़ें..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Advanced Options */}
            <div className="space-y-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                        अधिक विकल्प
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>अधिक शेयरिंग विकल्प</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* WhatsApp with Number */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            WhatsApp नंबर (वैकल्पिक)
                          </label>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="फोन नंबर दर्ज करें"
                              value={whatsappNumber}
                              onChange={(e) => setWhatsappNumber(e.target.value)}
                            />
                            <Button onClick={shareOnWhatsApp} disabled={!whatsappNumber}>
                              भेजें
                            </Button>
                          </div>
                        </div>

                        {/* Email Share */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            ईमेल द्वारा शेयर करें
                          </label>
                          <div className="space-y-2">
                            <Input
                              placeholder="ईमेल पता"
                              value={emailData.to}
                              onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                            />
                            <Input
                              placeholder="विषय"
                              value={emailData.subject}
                              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                            />
                            <Textarea
                              placeholder="संदेश"
                              value={emailData.message}
                              onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                              rows={3}
                            />
                            <Button onClick={sendEmail} className="w-full" disabled={!emailData.to}>
                              ईमेल भेजें
                            </Button>
                          </div>
                        </div>

                        {/* Generate Share Image */}
                        <div>
                          <Button onClick={generateShareImage} variant="outline" className="w-full">
                            शेयर इमेज जनरेट करें
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
            </div>

            {/* Content Tags */}
            {content.tags && content.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">टैग्स:</p>
                <div className="flex flex-wrap gap-1">
                  {content.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Social Share Buttons Component
export function SocialShareButtons({ content }: { content: ShareableContent }) {
  const shareButtons = [
    {
      name: 'WhatsApp',
      icon: <WhatsappIcon className="h-5 w-5" />,
      color: 'bg-green-500 hover:bg-green-600 text-white',
      action: () => {
        const text = encodeURIComponent(`${content.title}\n\n${content.description}`)
        const url = encodeURIComponent(content.url || window.location.href)
        window.open(`https://wa.me/?text=${text}%0A%0A${url}`, '_blank')
      }
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      action: () => {
        const text = encodeURIComponent(content.title)
        const url = encodeURIComponent(content.url || window.location.href)
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
      }
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      action: () => {
        const url = encodeURIComponent(content.url || window.location.href)
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
      }
    },
    {
      name: 'Copy Link',
      icon: <Copy className="h-5 w-5" />,
      color: 'bg-gray-500 hover:bg-gray-600 text-white',
      action: async () => {
        const url = content.url || window.location.href
        try {
          await navigator.clipboard.writeText(url)
          // Could add a toast notification here
        } catch (err) {
          console.error('Failed to copy:', err)
        }
      }
    }
  ]

  return (
    <div className="flex space-x-2">
      {shareButtons.map((button, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className={`${button.color} border-none`}
          onClick={button.action}
        >
          {button.icon}
          <span className="ml-2">{button.name}</span>
        </Button>
      ))}
    </div>
  )
}

// Floating Share Button (for mobile)
export function FloatingShareButton({ content }: { content: ShareableContent }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white rounded-lg shadow-lg p-2 space-y-2">
          <SocialShareButtons content={content} />
        </div>
      )}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-12 h-12 shadow-lg"
        size="sm"
      >
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  )
}