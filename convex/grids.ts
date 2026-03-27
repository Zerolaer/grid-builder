import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'

export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const rows = await ctx.db
      .query('gridProjects')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()
    return rows
  },
})

export const saveProjects = mutation({
  args: {
    data: v.string(),
  },
  handler: async (ctx, { data }) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const existing = await ctx.db
      .query('gridProjects')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first()

    const now = new Date().toISOString()
    if (existing) {
      await ctx.db.patch(existing._id, { data, updatedAt: now })
      return existing._id
    }
    return await ctx.db.insert('gridProjects', {
      userId,
      name: 'My Grids',
      data,
      updatedAt: now,
    })
  },
})
