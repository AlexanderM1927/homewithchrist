<template>
  <q-page class="privacy-page">
    <main class="privacy-content">
      <section class="privacy-header">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          aria-label="Volver"
          class="q-mb-md"
          @click="goBack"
        />
        <div class="text-overline text-primary text-weight-bold">Home With Christ</div>
        <h1>Politica de privacidad</h1>
        <p class="last-updated">Ultima actualizacion: 16 de junio de 2026</p>
      </section>

      <section>
        <h2>1. Responsable</h2>
        <p>
          Esta politica describe como Home With Christ trata la informacion de las personas que usan la aplicacion.
          Para consultas sobre privacidad puedes escribir a
          <a href="mailto:admin@alexanderm.co">admin@alexanderm.co</a>.
        </p>
      </section>

      <section>
        <h2>2. Informacion que podemos recopilar</h2>
        <p>Segun las funciones que uses, la aplicacion puede recopilar:</p>
        <ul>
          <li>Datos de cuenta, como nombre, telefono, correo electronico si lo agregas, y credenciales de acceso.</li>
          <li>Contenido que escribes en la app, como entradas del diario, reflexiones, mensajes y conversaciones con el asesor espiritual.</li>
          <li>Contenido compartido por ti mediante enlaces privados, como chats o entradas del diario que decidas compartir.</li>
          <li>Datos tecnicos necesarios para operar la app, como tokens de sesion, registros de errores, fecha de uso, metadatos de solicitudes y diagnosticos de funcionamiento.</li>
          <li>Imagenes o archivos que adjuntes voluntariamente en funciones que lo permitan.</li>
        </ul>
      </section>

      <section>
        <h2>3. Como usamos la informacion</h2>
        <p>Usamos la informacion para:</p>
        <ul>
          <li>Crear y administrar tu cuenta.</li>
          <li>Permitir el acceso seguro a la aplicacion.</li>
          <li>Guardar y mostrar tus diarios, chats, reflexiones y configuraciones.</li>
          <li>Responder a tus mensajes en el asesor espiritual y mejorar la calidad de la experiencia.</li>
          <li>Prevenir abuso, proteger la seguridad del servicio y corregir errores tecnicos.</li>
          <li>Cumplir obligaciones legales o solicitudes validas de autoridades competentes cuando aplique.</li>
        </ul>
      </section>

      <section>
        <h2>4. Inteligencia artificial y proveedores externos</h2>
        <p>
          Algunas funciones pueden enviar el texto que escribes a proveedores de inteligencia artificial para generar respuestas.
          Evita incluir informacion sensible que no quieras procesar en estas funciones. Tambien podemos usar proveedores de
          infraestructura, base de datos, alojamiento, correo o analitica tecnica para operar la aplicacion.
        </p>
      </section>

      <section>
        <h2>5. Cuando compartimos informacion</h2>
        <p>No vendemos tu informacion personal. Podemos compartir informacion solo en estos casos:</p>
        <ul>
          <li>Con proveedores que nos ayudan a operar la aplicacion y procesan datos bajo instrucciones nuestras.</li>
          <li>Cuando tu decides compartir un chat o una entrada del diario mediante un enlace privado.</li>
          <li>Cuando sea necesario por seguridad, prevencion de fraude, soporte tecnico o cumplimiento legal.</li>
        </ul>
      </section>

      <section>
        <h2>6. Seguridad</h2>
        <p>
          Aplicamos medidas razonables para proteger la informacion, incluyendo autenticacion, tokens de sesion y controles de acceso.
          Aun asi, ningun sistema conectado a internet puede garantizar seguridad absoluta.
        </p>
      </section>

      <section>
        <h2>7. Conservacion y eliminacion</h2>
        <p>
          Conservamos la informacion mientras tu cuenta este activa o mientras sea necesaria para prestar el servicio, resolver
          incidencias, cumplir obligaciones legales o proteger la seguridad de la aplicacion. Puedes solicitar la eliminacion de
          tus datos escribiendo a <a href="mailto:admin@alexanderm.co">admin@alexanderm.co</a>.
        </p>
      </section>

      <section>
        <h2>8. Privacidad de menores</h2>
        <p>
          Home With Christ no esta dirigida especificamente a menores de 13 anos. Si eres padre, madre o tutor y crees que un menor
          nos proporciono informacion personal sin autorizacion, contactanos para revisar y eliminar la informacion cuando corresponda.
        </p>
      </section>

      <section>
        <h2>9. Tus derechos</h2>
        <p>
          Puedes solicitar acceso, correccion o eliminacion de tu informacion personal. Tambien puedes pedir aclaraciones sobre el
          tratamiento de tus datos escribiendo al correo de contacto indicado en esta politica.
        </p>
      </section>

      <section>
        <h2>10. Cambios a esta politica</h2>
        <p>
          Podemos actualizar esta politica para reflejar cambios en la aplicacion, en proveedores o en requisitos legales.
          Publicaremos la version vigente en esta pagina e indicaremos la fecha de ultima actualizacion.
        </p>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/welcome')
}
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: #f7f5fb;
  color: #1f1b2d;
}

.privacy-content {
  width: min(880px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 48px;
}

.privacy-header {
  padding-bottom: 10px;
}

h1 {
  margin: 6px 0 8px;
  font-size: clamp(2rem, 7vw, 3.2rem);
  line-height: 1.05;
  font-weight: 800;
}

h2 {
  margin: 32px 0 10px;
  font-size: 1.15rem;
  line-height: 1.25;
  font-weight: 800;
  color: #2b2142;
}

p,
li {
  font-size: 1rem;
  line-height: 1.7;
  color: #4d465d;
}

ul {
  margin: 10px 0 0;
  padding-left: 22px;
}

a {
  color: var(--q-primary, #7c3aed);
  font-weight: 700;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.last-updated {
  margin: 0;
  color: #746a88;
}
</style>
