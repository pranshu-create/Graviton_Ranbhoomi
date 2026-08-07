import { z } from "zod";

// Base validation regex patterns
const phoneRegex = /^\+?[0-9\s-()]{10,20}$/;
const nameRegex = /^[a-zA-Z\s.'-]{2,100}$/;

// 1. Team Registration Zod Schema
export const teamRegisterSchema = z.object({
  name: z.string()
    .min(3, "Team name must be at least 3 characters")
    .max(30, "Team name must not exceed 30 characters")
    .regex(/^[a-zA-Z0-9\s._-]+$/, "Team name contains invalid characters"),
  event: z.enum(["ROBO SOCCER", "ROBO RACE", "LINE FOLLOWER", "ROBO SUMO", "HACKATHON"]),
  institution: z.string()
    .min(2, "Institution name must be at least 2 characters")
    .max(100, "Institution name must not exceed 100 characters"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must not exceed 50 characters")
    .optional()
    .or(z.literal("")),
  memberDetails: z.array(
    z.object({
      role: z.enum(["Leader", "Member"]),
      name: z.string().regex(nameRegex, "Member name must contain only letters and spaces (2-50 chars)"),
      email: z.string().email("Invalid email address format"),
      phone: z.string().regex(phoneRegex, "Invalid phone number format (10-13 digits)").optional()
    })
  ).min(1, "Team must contain at least a leader").max(4, "Team must not exceed 4 members"),
  turnstileToken: z.string().optional()
});

// 2. Authentication Login Zod Schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(1, "Password is required"),
  turnstileToken: z.string().optional()
});

// 3. Contact Form Submission Zod Schema
export const contactSchema = z.object({
  name: z.string().regex(nameRegex, "Name must contain only letters and spaces (2-50 chars)"),
  email: z.string().email("Invalid email address format"),
  subject: z.string()
    .min(3, "Subject must be at least 3 characters")
    .max(100, "Subject must not exceed 100 characters"),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must not exceed 1000 characters"),
  turnstileToken: z.string().optional()
});

// 4. Accommodation Booking Zod Schema
export const accommodationSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  teamName: z.string().min(1, "Team Name is required"),
  memberName: z.string().regex(nameRegex, "Member name must contain only letters and spaces"),
  memberEmail: z.string().email("Invalid email format"),
  gender: z.enum(["BOYS", "GIRLS"]),
  age: z.number().min(15).max(30).optional().nullable(),
  arrivalDateTime: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)).optional().nullable(), // ISO or datetime-local
  departureDateTime: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)).optional().nullable(),
  emergencyContactName: z.string().regex(nameRegex, "Emergency contact name must be letters and spaces only").optional().nullable(),
  emergencyContactPhone: z.string().regex(phoneRegex, "Emergency phone number must be 10-13 digits").optional().nullable(),
  idProofUrl: z.string().url("Invalid ID proof URL format").or(z.string().regex(/^\/api\/admin\/files\?path=.+$/))
});
