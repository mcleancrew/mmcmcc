"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface TeamData {
  totalMeters: number
  targetMeters: number
  membersCount: number
  deficit: number
  remainingDays: number
  dailyTeamRequired: number
  dailyPersonRequired: number
  daysAheadOrBehind: number
}

interface ProgressDataPoint {
  date: string
  meters: number
  target: number
}

export function useTeamData() {
  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [progressData, setProgressData] = useState<ProgressDataPoint[] | null>(null)

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        // Fetch all users from Firestore
        const usersRef = collection(db, "users")
        const querySnapshot = await getDocs(usersRef)

        let totalMeters = 0
        let membersCount = 0
        const allActivities: any[] = []

        querySnapshot.forEach((doc) => {
          const firestoreData = doc.data()
          const activities = firestoreData.activities || []

          // Calculate total meters from activities for this user
          const userMeters = activities.reduce((sum: number, activity: any) => {
            return sum + (Number(activity.points) || 0)
          }, 0)

          totalMeters += userMeters
          membersCount++

          // Collect all activities for daily progress calculation
          activities.forEach((activity: any) => {
            if (activity.date) {
              allActivities.push({
                ...activity,
                date: activity.date.toDate ? activity.date.toDate() : new Date(activity.date)
              })
            }
          })
        })

        // Calculate team metrics
        const targetMeters = membersCount * 1000000 // 1M per member
        const deficit = Math.max(0, targetMeters - totalMeters)
        
        // Calculate remaining days until Friday, September 5, 2025 EST
        const targetDate = new Date('2025-09-05T00:00:00-05:00') // Friday, September 5, 2025 EST
        const now = new Date()
        
        // Convert current time to EST for accurate calculation
        const nowEST = new Date(now.getTime() - (5 * 60 * 60 * 1000)) // Convert to EST (UTC-5)
        
        // Calculate difference in days, rounding up to include the current day
        const timeDiff = targetDate.getTime() - nowEST.getTime()
        const remainingDays = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))
        
        const dailyTeamRequired = Math.ceil(deficit / remainingDays)
        const dailyPersonRequired = Math.ceil(dailyTeamRequired / membersCount)

        const realTeamData: TeamData = {
          totalMeters,
          targetMeters,
          membersCount,
          deficit,
          remainingDays,
          dailyTeamRequired,
          dailyPersonRequired,
          daysAheadOrBehind: 0, // Will calculate this later if needed
        }

        setTeamData(realTeamData)

        // Calculate real daily team progress
        const dailyProgress = new Map<string, number>()
        
        // Group activities by date and sum meters
        allActivities.forEach((activity) => {
          const dateKey = activity.date.toISOString().split('T')[0] // YYYY-MM-DD format
          const meters = Number(activity.points) || 0
          dailyProgress.set(dateKey, (dailyProgress.get(dateKey) || 0) + meters)
        })

        // Calculate daily average from the beginning of summer
        const summerStartDate = new Date('2024-06-12') // Beginning of summer
        const today = new Date()
        const daysSinceSummerStart = Math.max(1, Math.ceil((today.getTime() - summerStartDate.getTime()) / (1000 * 60 * 60 * 24)))
        const dailyAverage = Math.round(totalMeters / daysSinceSummerStart)

        // Convert to chart data format and sort by date
        const realProgressData: ProgressDataPoint[] = Array.from(dailyProgress.entries())
          .map(([date, meters]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            meters,
            target: dailyAverage // Daily average instead of target
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // If no real data, provide some default data
        if (realProgressData.length === 0) {
          const today = new Date()
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          
          realProgressData.push({
            date: yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            meters: 0,
            target: dailyAverage
          })
        }

        setProgressData(realProgressData)

      } catch (error) {
        console.error("Error fetching team data:", error)
        setTeamData(null)
      }
    }

    fetchTeamData()
  }, [])

  return { teamData, progressData }
}
