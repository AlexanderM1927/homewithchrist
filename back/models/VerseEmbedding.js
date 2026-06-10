'use strict'

module.exports = (sequelize, DataTypes) => {
  const VerseEmbedding = sequelize.define(
    'VerseEmbedding',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      verse_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      provider: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'ollama'
      },
      model: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      embedding: {
        type: DataTypes.JSON,
        allowNull: false
      },
      text_hash: {
        type: DataTypes.STRING(64),
        allowNull: false
      }
    },
    {
      tableName: 'verse_embeddings',
      timestamps: true,
      updatedAt: false
    }
  )

  return VerseEmbedding
}
