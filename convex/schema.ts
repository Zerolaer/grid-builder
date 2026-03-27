import { defineSchema, defineTable } from 'convex/server'
import { authTables } from '@convex-dev/auth/server'
import { v } from 'convex/values'

export default defineSchema({
  ...authTables,
  gridProjects: defineTable({
    userId: v.id('users'),
    name: v.string(),
    // LZ-string compressed JSON of GridProjectsState
    data: v.string(),
    updatedAt: v.string(),
  }).index('by_user', ['userId']),
})
