'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Award, 
  Building,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  PieChart,
  Activity
} from 'lucide-react'

interface PerformanceData {
  parties: PartyPerformance[]
  leaders: LeaderPerformance[]
  categories: CategoryPerformance[]
  trends: TrendData[]
  summary: {
    totalPromises: number
    fulfilledPromises: number
    partiallyFulfilledPromises: number
    pendingPromises: number
    brokenPromises: number
    averageFulfillmentRate: number
  }
}

interface PartyPerformance {
  id: string
  name: string
  shortName: string
  totalPromises: number
  fulfilledPromises: number
  partiallyFulfilledPromises: number
  pendingPromises: number
  brokenPromises: number
  fulfillmentRate: number
  trend: 'up' | 'down' | 'stable'
  color: string
}

interface LeaderPerformance {
  id: string
  name: string
  position: string
  party: string
  totalPromises: number
  fulfilledPromises: number
  fulfillmentRate: number
  topCategories: string[]
}

interface CategoryPerformance {
  category: string
  totalPromises: number
  fulfilledPromises: number
  fulfillmentRate: number
  topPerformingParty: string
  worstPerformingParty: string
}

interface TrendData {
  period: string
  totalPromises: number
  fulfillmentRate: number
  newPromises: number
  fulfilledThisPeriod: number
}

const mockPerformanceData: PerformanceData = {
  parties: [
    {
      id: '1',
      name: 'भारतीय जनता पार्टी',
      shortName: 'BJP',
      totalPromises: 45,
      fulfilledPromises: 18,
      partiallyFulfilledPromises: 12,
      pendingPromises: 10,
      brokenPromises: 5,
      fulfillmentRate: 66.7,
      trend: 'up',
      color: '#FF9800'
    },
    {
      id: '2',
      name: 'भारतीय राष्ट्रीय कांग्रेस',
      shortName: 'INC',
      totalPromises: 38,
      fulfilledPromises: 14,
      partiallyFulfilledPromises: 8,
      pendingPromises: 12,
      brokenPromises: 4,
      fulfillmentRate: 57.9,
      trend: 'stable',
      color: '#1976D2'
    },
    {
      id: '3',
      name: 'आम आदमी पार्टी',
      shortName: 'AAP',
      totalPromishes: 32,
      fulfilledPromises: 22,
      partiallyFulfilledPromises: 6,
      pendingPromises: 3,
      brokenPromises: 1,
      fulfillmentRate: 87.5,
      trend: 'up',
      color: '#4CAF50'
    },
    {
      id: '4',
      name: 'समाजवादी पार्टी',
      shortName: 'SP',
      totalPromises: 28,
      fulfilledPromises: 8,
      partiallyFulfilledPromises: 6,
      pendingPromises: 10,
      brokenPromises: 4,
      fulfillmentRate: 50.0,
      trend: 'down',
      color: '#E91E63'
    }
  ],
  leaders: [
    {
      id: '1',
      name: 'नरेंद्र मोदी',
      position: 'प्रधानमंत्री',
      party: 'BJP',
      totalPromises: 25,
      fulfilledPromises: 12,
      fulfillmentRate: 48.0,
      topCategories: ['अर्थव्यवस्था', 'बुनियादी ढांचा', 'स्वास्थ्य']
    },
    {
      id: '2',
      name: 'राहुल गांधी',
      position: 'सांसद',
      party: 'INC',
      totalPromises: 18,
      fulfilledPromises: 8,
      fulfillmentRate: 44.4,
      topCategories: ['शिक्षा', 'रोजगार', 'महिलाएं']
    },
    {
      id: '3',
      name: 'अरविंद केजरीवाल',
      position: 'दिल्ली के मुख्यमंत्री',
      party: 'AAP',
      totalPromises: 20,
      fulfilledPromises: 16,
      fulfillmentRate: 80.0,
      topCategories: ['शिक्षा', 'स्वास्थ्य', 'बिनियादी ढांचा']
    }
  ],
  categories: [
    {
      category: 'शिक्षा',
      totalPromises: 35,
      fulfilledPromises: 22,
      fulfillmentRate: 62.9,
      topPerformingParty: 'AAP',
      worstPerformingParty: 'SP'
    },
    {
      category: 'स्वास्थ्य',
      totalPromises: 28,
      fulfilledPromises: 15,
      fulfillmentRate: 53.6,
      topPerformingParty: 'BJP',
      worstPerformingParty: 'INC'
    },
    {
      category: 'अर्थव्यवस्था',
      totalPromises: 32,
      fulfilledPromises: 18,
      fulfillmentRate: 56.3,
      topPerformingParty: 'AAP',
      worstPerformingParty: 'SP'
    },
    {
      category: 'किसान',
      totalPromises: 25,
      fulfilledPromises: 12,
      fulfillmentRate: 48.0,
      topPerformingParty: 'BJP',
      worstPerformingParty: 'INC'
    },
    {
      category: 'बुनियादी ढांचा',
      totalPromises: 30,
      fulfilledPromises: 20,
      fulfillmentRate: 66.7,
      topPerformingParty: 'AAP',
      worstPerformingParty: 'SP'
    }
  ],
  trends: [
    {
      period: 'जनवरी 2024',
      totalPromises: 143,
      fulfillmentRate: 58.5,
      newPromises: 12,
      fulfilledThisPeriod: 8
    },
    {
      period: 'फरवरी 2024',
      totalPromises: 155,
      fulfillmentRate: 60.2,
      newPromises: 15,
      fulfilledThisPeriod: 11
    },
    {
      period: 'मार्च 2024',
      totalPromises: 168,
      fulfillmentRate: 62.1,
      newPromises: 18,
      fulfilledThisPeriod: 14
    },
    {
      period: 'अप्रैल 2024',
      totalPromises: 175,
      fulfillmentRate: 63.8,
      newPromises: 10,
      fulfilledThisPeriod: 12
    }
  ],
  summary: {
    totalPromises: 175,
    fulfilledPromises: 62,
    partiallyFulfilledPromises: 38,
    pendingPromises: 55,
    brokenPromises: 20,
    averageFulfillmentRate: 63.8
  }
}

export function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData>(mockPerformanceData)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedParty, setSelectedParty] = useState('all')
  const [loading, setLoading] = useState(false)

  const getFulfillmentColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-blue-600'
    if (rate >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFulfillmentBadgeColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-800'
    if (rate >= 60) return 'bg-blue-100 text-blue-800'
    if (rate >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('hi-IN')
  }

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleExport = () => {
    // Simulate export functionality
    const csvContent = "data:text/csv;charset=utf-8," + 
      "पार्टी,कुल वादे,पूरे हुए,आंशिक रूप से,लंबित,टूटे हुए,पूर्ति दर\n" +
      data.parties.map(p => 
        `${p.name},${p.totalPromises},${p.fulfilledPromises},${p.partiallyFulfilledPromises},${p.pendingPromises},${p.brokenPromises},${p.fulfillmentRate}%`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "performance_report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">प्रदर्शन डैशबोर्ड</h2>
          <p className="text-gray-600">राजनीतिक वादों का विस्तृत विश्लेषण और ट्रैकिंग</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="अवधि चुनें" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सभी समय</SelectItem>
              <SelectItem value="1month">पिछला महीना</SelectItem>
              <SelectItem value="3months">पिछले 3 महीने</SelectItem>
              <SelectItem value="6months">पिछले 6 महीने</SelectItem>
              <SelectItem value="1year">पिछला वर्ष</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedParty} onValueChange={setSelectedParty}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="पार्टी चुनें" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सभी पार्टियां</SelectItem>
              {data.parties.map(party => (
                <SelectItem key={party.id} value={party.id}>
                  {party.shortName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            रिफ्रेश करें
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            एक्सपोर्ट करें
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">कुल वादे</p>
                <p className="text-2xl font-bold">{formatNumber(data.summary.totalPromises)}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">पूरे हुए</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(data.summary.fulfilledPromises)}</p>
                <p className="text-xs text-gray-500">{((data.summary.fulfilledPromises / data.summary.totalPromises) * 100).toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">आंशिक रूप से</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(data.summary.partiallyFulfilledPromises)}</p>
                <p className="text-xs text-gray-500">{((data.summary.partiallyFulfilledPromises / data.summary.totalPromises) * 100).toFixed(1)}%</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">टूटे हुए</p>
                <p className="text-2xl font-bold text-red-600">{formatNumber(data.summary.brokenPromises)}</p>
                <p className="text-xs text-gray-500">{((data.summary.brokenPromises / data.summary.totalPromises) * 100).toFixed(1)}%</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="parties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parties">पार्टी प्रदर्शन</TabsTrigger>
          <TabsTrigger value="leaders">नेता प्रदर्शन</TabsTrigger>
          <TabsTrigger value="categories">श्रेणी वार</TabsTrigger>
          <TabsTrigger value="trends">रुझान</TabsTrigger>
        </TabsList>

        {/* Party Performance */}
        <TabsContent value="parties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>पार्टी वार प्रदर्शन</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.parties.map((party) => (
                  <div key={party.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: party.color }}
                        />
                        <div>
                          <h3 className="font-semibold">{party.name}</h3>
                          <p className="text-sm text-gray-600">{party.shortName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(party.trend)}
                        <span className={`text-lg font-bold ${getFulfillmentColor(party.fulfillmentRate)}`}>
                          {party.fulfillmentRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">कुल</p>
                        <p className="font-semibold">{party.totalPromises}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">पूरे</p>
                        <p className="font-semibold text-green-600">{party.fulfilledPromises}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">आंशिक</p>
                        <p className="font-semibold text-blue-600">{party.partiallyFulfilledPromises}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">लंबित</p>
                        <p className="font-semibold text-yellow-600">{party.pendingPromises}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">टूटे</p>
                        <p className="font-semibold text-red-600">{party.brokenPromises}</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${party.fulfillmentRate}%`,
                          backgroundColor: party.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leader Performance */}
        <TabsContent value="leaders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>नेता वार प्रदर्शन</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {data.leaders.map((leader) => (
                  <div key={leader.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{leader.name}</h3>
                        <p className="text-sm text-gray-600">{leader.position} • {leader.party}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getFulfillmentBadgeColor(leader.fulfillmentRate)}>
                          {leader.fulfillmentRate.toFixed(1)}%
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {leader.fulfilledPromises}/{leader.totalPromises} पूरे
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {leader.topCategories.map((category, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Performance */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>श्रेणी वार प्रदर्शन</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {data.categories.map((category) => (
                  <div key={category.category} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{category.category}</h3>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${getFulfillmentColor(category.fulfillmentRate)}`}>
                          {category.fulfillmentRate.toFixed(1)}%
                        </span>
                        <p className="text-sm text-gray-600">
                          {category.fulfilledPromises}/{category.totalPromises} पूरे
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">सर्वश्रेष्ठ: </span>
                        <span className="font-medium text-green-600">{category.topPerformingParty}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">न्यूनतम: </span>
                        <span className="font-medium text-red-600">{category.worstPerformingParty}</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className="h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${category.fulfillmentRate}%`,
                          backgroundColor: category.fulfillmentRate >= 60 ? '#10B981' : 
                                         category.fulfillmentRate >= 40 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>प्रदर्शन रुझान</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.trends.map((trend, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{trend.period}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getFulfillmentBadgeColor(trend.fulfillmentRate)}>
                          {trend.fulfillmentRate.toFixed(1)}%
                        </Badge>
                        {getTrendIcon(index > 0 ? 'up' : 'stable')}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">कुल वादे: </span>
                        <span className="font-medium">{trend.totalPromises}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">नए वादे: </span>
                        <span className="font-medium text-blue-600">{trend.newPromises}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">पूरे हुए: </span>
                        <span className="font-medium text-green-600">{trend.fulfilledThisPeriod}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">पूर्ति दर: </span>
                        <span className={`font-medium ${getFulfillmentColor(trend.fulfillmentRate)}`}>
                          {trend.fulfillmentRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}