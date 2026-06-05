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

  /**
   * Devuelve todos los usuarios con su rol.
   * @returns {Promise<User[]>}
   */
  async findAll () {
    return User.findAll({
      include: [{ model: Role, attributes: ['role_id', 'role_name'] }],
      order: [['user_id', 'ASC']]
    })
  }

  /**
   * Cambia el rol de un usuario.
   * @param {number} userId
   * @param {number} roleId
   * @returns {Promise<User>}
   */
  async updateRole (userId, roleId) {
    await User.update({ role_id: roleId }, { where: { user_id: userId } })
    return this.findById(userId)
  }

  /**
   * Actualiza nombre, email y teléfono de un usuario.
   * @param {number} userId
   * @param {{ name?: string, email?: string, phone?: string }} data
   * @returns {Promise<User>}
   */
  async updateProfile(userId, { name, email, phone }) {
    const fields = {}
    if (name  !== undefined) fields.name  = name
    if (email !== undefined) fields.email = email || null
    if (phone !== undefined) fields.phone = phone
    await User.update(fields, { where: { user_id: userId } })
    return this.findById(userId)
  }
}

module.exports = new UserRepository()
