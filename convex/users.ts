import { query, action, internalMutation, internalQuery } from './_generated/server'
import { getAuthUserId, createAccount } from '@convex-dev/auth/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    return await ctx.db.get(userId)
  },
})

/**
 * Create an internal user account from the CLI:
 *
 *   npx convex run users:createUser '{"email":"you@example.com","password":"secret123","name":"Your Name"}'
 */
export const createUser = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { email, password, name }) => {
    await createAccount(ctx as any, {
      provider: 'password',
      account: { id: email, secret: password },
      profile: { email, name: name ?? email },
      shouldLinkViaEmail: false,
      shouldLinkViaPhone: false,
    })
    return { ok: true, email }
  },
})

/**
 * Delete a user by email from the CLI:
 *
 *   npx convex run users:deleteUser '{"email":"you@example.com"}'
 */
export const deleteUser = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const userId = await ctx.runQuery(internal.users._userIdByEmail, { email })
    if (!userId) return { ok: false, reason: 'User not found' }
    await ctx.runMutation(internal.users._deleteUserRecords, { userId })
    return { ok: true, email }
  },
})

export const _userIdByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const account = await ctx.db
      .query('authAccounts')
      .filter((q) => q.eq(q.field('providerAccountId'), email))
      .first()
    return account?.userId ?? null
  },
})

export const _deleteUserRecords = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    // Delete auth accounts
    const accounts = await ctx.db
      .query('authAccounts')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect()
    for (const a of accounts) await ctx.db.delete(a._id)

    // Delete sessions
    const sessions = await ctx.db
      .query('authSessions')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect()
    for (const s of sessions) await ctx.db.delete(s._id)

    // Delete refresh tokens
    const tokens = await ctx.db
      .query('authRefreshTokens')
      .filter((q) => q.eq(q.field('sessionId'), userId as any))
      .collect()
    for (const t of tokens) await ctx.db.delete(t._id)

    // Delete user
    await ctx.db.delete(userId)
  },
})
