'use strict'
const { User, Role } = require('../models')

class UserRepository {
  /**
   * Busca un usuario por número de teléfono.
   * @param {string} phone
   * @returns {Promise<User|null>}
   */
  async findByPhone(phone) {
    return User.findOne({
      where: { phone },
      include: [{ model: Role, attributes: ['role_name'] }]
    })
  }

  /**
   * Crea un nuevo usuario.
   * @param {{ name: string, phone: string, password: string, role_id?: number }} data
   * @returns {Promise<User>}
   */
  async create(data) {
    return User.create({
      name: data.name,
      phone: data.phone,
      password: data.password,
      role_id: data.role_id || 1
    })
  }

  /**
   * Guarda el refresh token hasheado en el usuario.
   * @param {number} userId
   * @param {string|null} refreshToken
   */
  async saveRefreshToken(userId, refreshToken) {
    await User.update({ refresh_token: refreshToken }, { where: { user_id: userId } })
  }

  /**
   * Busca un usuario por su ID.
   * @param {number} userId
   * @returns {Promise<User|null>}
   */
  async findById(userId) {
    return User.findByPk(userId, {
      include: [{ model: Role, attributes: ['role_name'] }]
    })
  }
}

module.exports = new UserRepository()
