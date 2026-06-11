'use strict';

const dailyVerses = [
  { reference: 'Jeremías 29:11', text: '"Porque yo sé los planes que tengo para vosotros, dice Yahvé, planes de bienestar y no de mal, para daros el fin que esperáis."' },
  { reference: 'Filipenses 4:13', text: '"Todo lo puedo en Cristo que me fortalece."' },
  { reference: 'Salmos 23:1', text: '"Yahvé es mi pastor; nada me faltará."' },
  { reference: 'Isaías 41:10', text: '"No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo."' },
  { reference: 'Proverbios 3:5', text: '"Confía en Yahvé con todo tu corazón, y no te apoyes en tu propia prudencia."' },
  { reference: 'Romanos 8:28', text: '"Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien."' },
  { reference: 'Mateo 11:28', text: '"Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar."' },
  { reference: 'Juan 14:27', text: '"La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da."' },
  { reference: 'Salmos 46:1', text: '"Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones."' },
  { reference: 'Josué 1:9', text: '"Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes."' },
  { reference: '1 Corintios 16:14', text: '"Todas vuestras cosas sean hechas con amor."' },
  { reference: 'Efesios 4:32', text: '"Sed benignos unos con otros, misericordiosos, perdonándoos unos a otros."' },
  { reference: 'Salmos 34:8', text: '"Gustad, y ved que es bueno Yahvé; dichoso el hombre que confía en él."' },
  { reference: '2 Timoteo 1:7', text: '"Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio."' },
  { reference: 'Juan 3:16', text: '"Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito."' },
  { reference: 'Romanos 15:13', text: '"Y el Dios de esperanza os llene de todo gozo y paz en el creer."' },
  { reference: 'Salmos 121:2', text: '"Mi socorro viene de Yahvé, que hizo los cielos y la tierra."' },
  { reference: 'Gálatas 6:9', text: '"No nos cansemos, pues, de hacer bien; porque a su tiempo segaremos."' },
  { reference: 'Colosenses 3:23', text: '"Y todo lo que hagáis, hacedlo de corazón, como para el Señor."' },
  { reference: 'Hebreos 11:1', text: '"Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve."' }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('daily_verses', dailyVerses.map(verse => ({
      ...verse,
      createdAt: now,
      updatedAt: now
    })));
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('daily_verses', {
      reference: dailyVerses.map(verse => verse.reference)
    }, {});
  }
};
