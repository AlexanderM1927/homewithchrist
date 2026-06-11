'use strict'
const { Op } = require('sequelize')
const { AiUsageEvent } = require('../models')

class AiUsageService {
  async assertWithinBudget({ userId, provider, estimatedCostUsd = 0 }) {
    const monthlyBudget = numberFromEnv('OPENAI_MONTHLY_BUDGET_USD', 0)
    const userMonthlyBudget = numberFromEnv('OPENAI_USER_MONTHLY_BUDGET_USD', 0)

    if (monthlyBudget > 0) {
      const total = await this.getMonthlySpend({ provider })
      if (total + estimatedCostUsd > monthlyBudget) {
        throw this._budgetError('monthly')
      }
    }

    if (userMonthlyBudget > 0 && userId) {
      const total = await this.getMonthlySpend({ provider, userId })
      if (total + estimatedCostUsd > userMonthlyBudget) {
        throw this._budgetError('user_monthly')
      }
    }
  }

  async recordUsage({ userId = null, provider, model, operation, inputTokens = 0, outputTokens = 0, estimatedCostUsd = 0 }) {
    return AiUsageEvent.create({
      user_id: userId,
      provider,
      model,
      operation,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost_usd: estimatedCostUsd
    })
  }

  async getMonthlySpend({ provider, userId = null, now = new Date() }) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const where = {
      provider,
      createdAt: { [Op.gte]: start }
    }
    if (userId) where.user_id = userId

    const total = await AiUsageEvent.sum('estimated_cost_usd', { where })
    return Number(total || 0)
  }

  _budgetError(reason) {
    const error = new Error('Presupuesto mensual de IA alcanzado')
    error.code = 'AI_BUDGET_EXCEEDED'
    error.reason = reason
    return error
  }
}

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value > 0 ? value : fallback
}

module.exports = new AiUsageService()
