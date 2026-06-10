'use strict'

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('verses', ['version', 'book', 'chapter', 'verse_start'], {
      unique: true,
      name: 'verses_version_book_chapter_verse_unique'
    })
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('verses', 'verses_version_book_chapter_verse_unique')
  }
}
