'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Bell,
  Filter,
  Search,
  Eye,
  MessageCircle,
  Share2,
  Bookmark,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
  Building,
  Award,
  FileText,
  Vote,
  BarChart3
} from 'lucide-react'
import { LanguageSelector } from '@/components/language-selector'
import { NextIntlClientProvider } from 'next-intl'
import { useMessages } from 'next-intl'

// Import messages for the default locale
import hiMessages from '../../messages/hi.json'

interface Issue {
  id: string
  title: string
  summary: string
  category: string
  impactScore: number
  affectedPeople?: number
  status: string
  priority: string
  localVsNational: string
  state?: string
  city?: string
  tags: string
  firstReportedAt: string
  lastUpdated: string
}

interface LocalReport {
  id: string
  title: string
  description: string
  category: string
  state?: string
  city?: string
  area?: string
  status: string
  upvotes: number
  createdAt: string
}

interface PoliticalPromise {
  id: string
  title: string
  description: string
  category: string
  status: string
  electionYear: number
  promiseDate: string
  party: {
    id: string
    name: string
    shortName: string
    logo?: string
  }
  leader?: {
    id: string
    name: string
    position?: string
    photo?: string
  }
  _count: {
    votes: number
    comments: number
    factChecks: number
  }
}

const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'सरकारी अस्पतालों में डॉक्टरों की कमी',
    summary: 'राज्य के सरकारी अस्पतालों में 40% पद खाली, मरीजों को इलाज के लिए इंतजार',
    category: 'health',
    impactScore: 85,
    affectedPeople: 50000,
    status: 'active',
    priority: 'high',
    localVsNational: 'national',
    state: 'उत्तर प्रदेश',
    tags: 'healthcare,doctors,hospital',
    firstReportedAt: '2024-01-15',
    lastUpdated: '2024-01-20'
  },
  {
    id: '2',
    title: 'गांवों में सड़कें टूटी हुईं, आवागमन प्रभावित',
    summary: 'मानसून के बाद से 200+ गांवों की सड़कें खराब, स्कूली बच्चों और किसानों को परेशानी',
    category: 'infrastructure',
    impactScore: 72,
    affectedPeople: 25000,
    status: 'active',
    priority: 'medium',
    localVsNational: 'local',
    state: 'बिहार',
    city: 'पटना',
    tags: 'roads,infrastructure,village',
    firstReportedAt: '2024-01-10',
    lastUpdated: '2024-01-18'
  },
  {
    id: '3',
    title: 'सरकारी स्कूलों में शिक्षकों की कमी से बच्चों की पढ़ाई प्रभावित',
    summary: 'प्राथमिक स्कूलों में 30% शिक्षक पद खाली, छात्र-शिक्षक अनुपात बिगड़ा',
    category: 'education',
    impactScore: 78,
    affectedPeople: 75000,
    status: 'under_discussion',
    priority: 'high',
    localVsNational: 'national',
    tags: 'education,teachers,school',
    firstReportedAt: '2024-01-05',
    lastUpdated: '2024-01-19'
  }
]

const mockLocalReports: LocalReport[] = [
  {
    id: '1',
    title: 'हमारे मोहल्ले में पानी की समस्या',
    description: 'पिछले 15 दिनों से पानी नहीं आ रहा, टैंकर से पानी मिल रहा है',
    category: 'water',
    state: 'दिल्ली',
    city: 'नई दिल्ली',
    area: 'लक्ष्मी नगर',
    status: 'pending',
    upvotes: 45,
    createdAt: '2024-01-20'
  },
  {
    id: '2',
    title: 'स्ट्रीट लाइट नहीं जल रहीं',
    description: 'मुख्य सड़क पर स्ट्रीट लाइट खराब, रात में अंधेरा',
    category: 'electricity',
    state: 'महाराष्ट्र',
    city: 'मुंबई',
    area: 'बांद्रा',
    status: 'verified',
    upvotes: 23,
    createdAt: '2024-01-19'
  }
]

const mockPromises: PoliticalPromise[] = [
  {
    id: '1',
    title: 'हर गरीब परिवार को 5000 रुपये मासिक भत्ता',
    description: 'सभी गरीब परिवारों को हर महीने 5000 रुपये का भत्ता दिया जाएगा ताकि उनका जीवन स्तर बेहतर हो सके',
    category: 'economy',
    status: 'pending',
    electionYear: 2024,
    promiseDate: '2024-01-15',
    party: {
      id: '1',
      name: 'भारतीय जनता पार्टी',
      shortName: 'BJP'
    },
    leader: {
      id: '1',
      name: 'नरेंद्र मोदी',
      position: 'प्रधानमंत्री'
    },
    _count: {
      votes: 1250,
      comments: 89,
      factChecks: 3
    }
  },
  {
    id: '2',
    title: 'सभी छात्रों को लैपटॉप और इंटरनेट',
    description: 'शिक्षा में तकनीकी को बढ़ावा देने के लिए सभी सरकारी स्कूलों के छात्रों को मुफ्त लैपटॉप और इंटरनेट कनेक्शन दिया जाएगा',
    category: 'education',
    status: 'partially_fulfilled',
    electionYear: 2024,
    promiseDate: '2024-01-10',
    party: {
      id: '2',
      name: 'भारतीय राष्ट्रीय कांग्रेस',
      shortName: 'INC'
    },
    _count: {
      votes: 890,
      comments: 56,
      factChecks: 2
    }
  },
  {
    id: '3',
    title: 'किसानों का कर्ज माफ',
    description: 'देश के सभी किसानों का 2 लाख तक का कृषि ऋण माफ किया जाएगा',
    category: 'farmers',
    status: 'broken',
    electionYear: 2024,
    promiseDate: '2024-01-08',
    party: {
      id: '3',
      name: 'आम आदमी पार्टी',
      shortName: 'AAP'
    },
    leader: {
      id: '3',
      name: 'अरविंद केजरीवाल',
      position: 'दिल्ली के मुख्यमंत्री'
    },
    _count: {
      votes: 2100,
      comments: 156,
      factChecks: 8
    }
  }
]

function HomeContent() {
  const [selectedTab, setSelectedTab] = useState('daily')
  const [issues, setIssues] = useState<Issue[]>(mockIssues)
  const [localReports, setLocalReports] = useState<LocalReport[]>(mockLocalReports)
  const [promises, setPromises] = useState<PoliticalPromise[]>(mockPromises)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedParty, setSelectedParty] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const messages = useMessages()

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return <AlertTriangle className="h-4 w-4" />
      case 'education': return <Users className="h-4 w-4" />
      case 'infrastructure': return <MapPin className="h-4 w-4" />
      case 'economy': return <TrendingUp className="h-4 w-4" />
      case 'farmers': return <Award className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'under_discussion': return 'bg-yellow-100 text-yellow-800'
      case 'ignored': return 'bg-gray-100 text-gray-800'
      case 'fulfilled': return 'bg-green-100 text-green-800'
      case 'partially_fulfilled': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'broken': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 100000) return (num / 100000).toFixed(1) + ' लाख'
    if (num >= 1000) return (num / 1000).toFixed(1) + ' हजार'
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('hi-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'पूरा हुआ'
      case 'partially_fulfilled': return 'आंशिक रूप से पूरा हुआ'
      case 'pending': return 'लंबित'
      case 'broken': return 'टूटा हुआ'
      case 'not_applicable': return 'लागू नहीं'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">WV</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">WakeUp Voter</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="खोजें..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 h-8 text-sm"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                फिल्टर
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                रिमाइंडर
              </Button>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Daily Critical Issue */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Today's Critical Issue</h2>
              <Badge className="bg-white/20 text-white border-white/30">
                {formatDate(issues[0]?.firstReportedAt || '')}
              </Badge>
            </div>
            <h3 className="text-xl font-semibold mb-3">{issues[0]?.title}</h3>
            <p className="text-white/90 mb-4">{issues[0]?.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">प्रभावित लोग</span>
                </div>
                <p className="text-lg font-bold">{formatNumber(issues[0]?.affectedPeople || 0)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">इम्पैक्ट स्कोर</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={issues[0]?.impactScore || 0} className="flex-1 h-2" />
                  <span className="text-sm font-bold">{issues[0]?.impactScore}</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">स्थिति</span>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  {issues[0]?.status === 'active' ? 'सक्रिय' : 'चर्चा में'}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                विस्तार से देखें
              </Button>
              <Button variant="secondary" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                चर्चा करें
              </Button>
              <Button variant="secondary" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                शेयर करें
              </Button>
              <Button variant="secondary" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                सेव करें
              </Button>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="daily">दैनिक मुद्दे</TabsTrigger>
            <TabsTrigger value="local">स्थानीय मुद्दे</TabsTrigger>
            <TabsTrigger value="promises">राजनीतिक वादे</TabsTrigger>
            <TabsTrigger value="timeline">टाइमलाइन</TabsTrigger>
            <TabsTrigger value="accountability">जवाबदेही</TabsTrigger>
            <TabsTrigger value="dashboard">डैशबोर्ड</TabsTrigger>
          </TabsList>

          {/* Daily Issues */}
          <TabsContent value="daily" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">सभी मुद्दे</h3>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                रिफ्रेश करें
              </Button>
            </div>
            <div className="grid gap-4">
              {issues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getCategoryIcon(issue.category)}
                          <Badge variant="outline" className={getStatusColor(issue.status)}>
                            {issue.status === 'active' ? 'सक्रिय' : 
                             issue.status === 'resolved' ? 'हल हो गया' :
                             issue.status === 'under_discussion' ? 'चर्चा में' : 'अनदेखा'}
                          </Badge>
                          <Badge variant="outline">
                            {issue.localVsNational === 'local' ? 'स्थानीय' : 'राष्ट्रीय'}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mb-2">{issue.title}</CardTitle>
                        <p className="text-gray-600 text-sm">{issue.summary}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.priority)}`} />
                        <span className="text-sm text-gray-500">
                          {formatDate(issue.lastUpdated)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">इम्पैक्ट स्कोर</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={issue.impactScore} className="flex-1 h-2" />
                          <span className="text-sm font-bold">{issue.impactScore}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">प्रभावित लोग</span>
                        <p className="font-bold">{formatNumber(issue.affectedPeople || 0)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">श्रेणी</span>
                        <p className="font-bold">{issue.category}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">प्राथमिकता</span>
                        <Badge variant="outline">{issue.priority}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        विस्तार से देखें
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        चर्चा करें
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        शेयर करें
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bookmark className="h-4 w-4 mr-2" />
                        सेव करें
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Local Issues */}
          <TabsContent value="local" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">स्थानीय शिकायतें</h3>
              <Button size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                नई शिकायत दर्ज करें
              </Button>
            </div>
            <div className="grid gap-4">
              {localReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className={getStatusColor(report.status)}>
                            {report.status === 'pending' ? 'लंबित' : 
                             report.status === 'verified' ? 'सत्यापित' : 'अन्य'}
                          </Badge>
                          <Badge variant="outline">
                            {report.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mb-2">{report.title}</CardTitle>
                        <p className="text-gray-600 text-sm">{report.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-bold">{report.upvotes}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(report.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">राज्य</span>
                        <p className="font-bold">{report.state}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">शहर</span>
                        <p className="font-bold">{report.city}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">क्षेत्र</span>
                        <p className="font-bold">{report.area}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">समर्थन</span>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span className="font-bold">{report.upvotes}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        समर्थन करें
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        चर्चा करें
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        शेयर करें
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Political Promises */}
          <TabsContent value="promises" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">राजनीतिक वादे</h3>
              <div className="flex items-center space-x-2">
                <Select value={selectedParty} onValueChange={setSelectedParty}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="पार्टी चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सभी पार्टियां</SelectItem>
                    <SelectItem value="bjp">भाजपा</SelectItem>
                    <SelectItem value="inc">कांग्रेस</SelectItem>
                    <SelectItem value="aap">आप</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  वादा रिपोर्ट करें
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {promises.map((promise) => (
                <Card key={promise.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className={getStatusColor(promise.status)}>
                            {getStatusText(promise.status)}
                          </Badge>
                          <Badge variant="outline">
                            {promise.party.shortName}
                          </Badge>
                          <Badge variant="outline">
                            {promise.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mb-2">{promise.title}</CardTitle>
                        <p className="text-gray-600 text-sm">{promise.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className="text-sm text-gray-500">
                          {formatDate(promise.promiseDate)}
                        </span>
                        <Badge variant="outline">
                          {promise.electionYear}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">पार्टी</span>
                        <p className="font-bold">{promise.party.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">नेता</span>
                        <p className="font-bold">{promise.leader?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">वोट</span>
                        <div className="flex items-center space-x-1">
                          <Vote className="h-4 w-4 text-blue-600" />
                          <span className="font-bold">{promise._count.votes}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">चर्चा</span>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4 text-green-600" />
                          <span className="font-bold">{promise._count.comments}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Vote className="h-4 w-4 mr-2" />
                        वोट दें
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        चर्चा करें
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        शेयर करें
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bookmark className="h-4 w-4 mr-2" />
                        सेव करें
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline" className="space-y-4">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">टाइमलाइन</h3>
              <p className="text-gray-600">यह फीचर जल्द आ रहा है</p>
            </div>
          </TabsContent>

          {/* Accountability */}
          <TabsContent value="accountability" className="space-y-4">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">जवाबदेही</h3>
              <p className="text-gray-600">यह फीचर जल्द आ रहा है</p>
            </div>
          </TabsContent>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">डैशबोर्ड</h3>
              <p className="text-gray-600">यह फीचर जल्द आ रहा है</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <NextIntlClientProvider messages={hiMessages} locale="hi">
      <HomeContent />
    </NextIntlClientProvider>
  )
}