import {z} from "zod"

export const courseLevels = ['Beginner','Intermediate','Advanced'] as const
export const courseStatus = ["Draft","Published","Archieved"] as const

export const courseCategories = [
  'Development',
  'Business',
  "Finance",
  'IT & Software',
  'Office Productivity',
  'Personal Development',
  'Design',
  'Marketing',
  'Health & Fitness',
  'Music',
  'Teaching & Academics'
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(100, { message: "Title must be at most 100 characters long" }),
  
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters long" }),
  
  fileKey: z
    .string()
    .min(1, { message: "File key is required" }),
  
  price: z
    .coerce.number()
    .min(1, { message: "Price must be at least 1" }),
  
  duration: z
    .coerce.number()
    .min(1, { message: "Duration must be at least 1 hour" })
    .max(500, { message: "Duration cannot exceed 500 hours" }),
  
  level: z
    .enum(courseLevels, {
        message: "Invalid course level selected",
    }),

  category: z
    .enum(courseCategories,{
      message:"Category is required"
    }),
  
  smallDescription: z
    .string()
    .min(3, { message: "Short description must be at least 3 characters" })
    .max(200, { message: "Short description can't exceed 200 characters" }),
  
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters long" }),
  
  status: z
    .enum(courseStatus, {
      message: "Invalid course status"
    }),
});

export const chaptersSchema = z.object({
  name: z.string().min(3, {message: "Name must be at least 3 characters long"}),
  courseId: z.string().uuid({message:"Invalid course id"}),
})

export const lessonsSchema = z.object({
  name: z.string().min(3, {message: "Name must be at least 3 characters long"}),
  courseId: z.string().uuid({message:"Invalid course id"}),
  chapterId: z.string().uuid({message:"Invalid chapter id"}),
  description: z.string().min(3, {message: "Description must be at least 3 characters long"}).optional(),
  thumbnailKey: z.string().optional(),
  videoKey: z.string().optional(),
})

export type CourseSchemaType = z.infer<typeof courseSchema>
export type ChapterSchemaType = z.infer<typeof chaptersSchema>
export type LessonSchemaType = z.infer<typeof lessonsSchema>
