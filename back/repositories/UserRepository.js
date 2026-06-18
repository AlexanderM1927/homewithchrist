'use strict'
const { Op } = require('sequelize')
const {
  sequelize,
  User,
  Role,
  Chat,
  DiaryEntry,
  AiUsageEvent,
  UserSession,
  PushNotificationToken,
  TopicVerse,
  Verse,
  DailyVerse,
  TrainingReflection
} = require('../models')

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
   * Busca un usuario por correo.
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    return User.findOne({
      where: { email },
      include: [{ model: Role, attributes: ['role_name'] }]
    })
  }

  /**
   * Crea un nuevo usuario.
   * @param {{ name: string, email?: string|null, phone: string, password: string, role_id?: number }} data
   * @returns {Promise<User>}
   */
  async create(data) {
    return User.create({
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      password: data.password,
      role_id: data.role_id || 1,
      preferred_locale: data.preferred_locale || 'es-ES'
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
   * Actualiza la clave/PIN hasheado de un usuario.
   * @param {number} userId
   * @param {string} password
   */
  async updatePassword(userId, password) {
    await User.update({ password }, { where: { user_id: userId } })
    return this.findById(userId)
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
   * @param {{ name?: string, email?: string, phone?: string, preferred_locale?: string }} data
   * @returns {Promise<User>}
   */
  async updateProfile(userId, { name, email, phone, preferred_locale }) {
    const fields = {}
    if (name  !== undefined) fields.name  = name
    if (email !== undefined) fields.email = email || null
    if (phone !== undefined) fields.phone = phone
    if (preferred_locale !== undefined) fields.preferred_locale = preferred_locale
    await User.update(fields, { where: { user_id: userId } })
    return this.findById(userId)
  }

  /**
   * Elimina la cuenta y todos sus datos personales en una sola transaccion.
   * El contenido administrativo compartido se conserva sin referencia al autor.
   * @param {number} userId
   * @returns {Promise<string[]>} Rutas de imagenes que deben eliminarse del disco.
   */
  async deleteAccount(userId) {
    return sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE })
      if (!user) return null

      const diaryEntries = await DiaryEntry.findAll({
        where: { user_id: userId },
        attributes: ['image_path'],
        transaction
      })
      const imagePaths = diaryEntries.map(entry => entry.image_path).filter(Boolean)

      await AiUsageEvent.destroy({ where: { user_id: userId }, transaction })
      await DiaryEntry.destroy({ where: { user_id: userId }, transaction })
      await Chat.destroy({ where: { user_id: userId }, transaction })
      await PushNotificationToken.destroy({ where: { user_id: userId }, transaction })
      await TopicVerse.update({ created_by: null }, { where: { created_by: userId }, transaction })
      await Verse.update(
        { created_by: null, updated_by: null },
        {
          where: {
            [Op.or]: [{ created_by: userId }, { updated_by: userId }]
          },
          transaction
        }
      )
      await DailyVerse.update({ created_by: null }, { where: { created_by: userId }, transaction })
      await TrainingReflection.update({ created_by: null }, { where: { created_by: userId }, transaction })

      await UserSession.destroy({ where: { user_id: userId }, transaction })
      await user.destroy({ transaction })

      return imagePaths
    })
  }
}

module.exports = new UserRepository()
