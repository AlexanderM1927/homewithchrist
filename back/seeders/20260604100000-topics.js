'use strict';

const topics = [
  { name: 'Perdón',      slug: 'perdon',      description: 'Versículos sobre el perdón y la reconciliación' },
  { name: 'Amor',        slug: 'amor',        description: 'Versículos sobre el amor de Dios y hacia el prójimo' },
  { name: 'Fe',          slug: 'fe',          description: 'Versículos sobre la fe y la confianza en Dios' },
  { name: 'Ansiedad',    slug: 'ansiedad',    description: 'Versículos para momentos de ansiedad y preocupación' },
  { name: 'Familia',     slug: 'familia',     description: 'Versículos sobre la familia y el hogar' },
  { name: 'Ira',         slug: 'ira',         description: 'Versículos sobre el manejo de la ira' },
  { name: 'Culpa',       slug: 'culpa',       description: 'Versículos sobre la culpa y la gracia de Dios' },
  { name: 'Gratitud',    slug: 'gratitud',    description: 'Versículos sobre la gratitud y la alabanza' },
  { name: 'Obediencia',  slug: 'obediencia',  description: 'Versículos sobre la obediencia a Dios' },
  { name: 'Humildad',    slug: 'humildad',    description: 'Versículos sobre la humildad y la mansedumbre' }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('topics', topics.map(t => ({
      ...t,
      is_active: true,
      createdAt: now,
      updatedAt: now
    })));
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('topics', null, {});
  }
};
