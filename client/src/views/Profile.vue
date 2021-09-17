<template>
  <section class="container shadow-5 shadow-5-strong mt-5 py-5 px-4" aria-labelledby="main-title">

    <h1 id="main-title">Mon compte</h1>

    <h2 class="h4 mt-4">Mes informations</h2>
    <ul>
      <li>Nom d'utilisateur <span>{{ currentUser.username }}</span></li>
      <li>Adresse mail <span>{{ currentUser.email }}</span></li>
    </ul>

    <h2 class="h4 mt-4 mb-3">Que souhaitez-vous faire ?</h2>
    <Button type="button" classes="btn-primary" @button-click="logoutClick" text="Me déconnecter"/>

    <UpdatePassword />

    <Button type="button" classes="btn-primary" @button-click="exportDataClick" text="Exporter mes données"/>
    <Button type="button" classes="btn-outline-danger" @button-click="deleteAccountClick" text="Supprimer mon compte"/>
  </section>
</template>

<script>
import Button from '@/components/Button'
import UpdatePassword from '@/components/UpdatePassword'

export default {
  name: 'Profile',

  components: {
    Button,
    UpdatePassword
  },

  computed: {
    currentUser () {
      return this.$store.state.auth.user || {}
    }
  },

  methods: {
    async logoutClick () {
      try {
        await this.$store.dispatch('auth/logout')
        await this.$router.push('/')
      } catch (e) {
        console.error({ code: e.status, message: e.data.message })
      }
    },

    changePasswordClick () {

    },

    exportDataClick () {

    },

    deleteAccountClick () {

    }
  },

  mounted () {
    if (!this.currentUser) {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped lang="scss">
ul {
  list-style-type: none;
  padding-left: 0;
  margin-top: 15px;

  li {
    margin-bottom: 15px;
    font-size: 1rem;

    span {
      font-size: initial;
      display: block;
    }
  }
}
</style>
