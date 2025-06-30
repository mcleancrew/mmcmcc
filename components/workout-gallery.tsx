import { Card, CardContent } from "@/components/ui/card"
import type { Workout } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface WorkoutGalleryProps {
  workouts: Workout[]
}

export function WorkoutGallery({ workouts }: WorkoutGalleryProps) {
  const workoutsWithImages = workouts.filter((workout) => workout.images && workout.images.length > 0)

  if (workoutsWithImages.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-slate-500">No workout images to display yet.</CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {workoutsWithImages.flatMap((workout) => 
        workout.images?.map((image, index) => {
          const totalImages = workout.images?.length || 1
          const imageNumber = index + 1
          const isMultipleImages = totalImages > 1
          
          return (
            <div key={`${workout.id}-${index}`} className="relative group overflow-hidden rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:rotate-1 hover:shadow-xl">
              <img
                src={image || "/placeholder.png"}
                alt={`Workout on ${formatDate(workout.date)}`}
                className="w-full aspect-square object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 group-hover:rotate-2"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out flex flex-col justify-end p-2">
                <p className="text-white text-xs font-medium transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {workout.type} - {workout.meters}m
                </p>
                <p className="text-white/80 text-xs transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {formatDate(workout.date)}
                </p>
                {isMultipleImages && (
                  <p className="text-white/90 text-xs font-medium transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                    Photo {imageNumber} of {totalImages}
                  </p>
                )}
              </div>
            </div>
          )
        }) || []
      )}
    </div>
  )
}
