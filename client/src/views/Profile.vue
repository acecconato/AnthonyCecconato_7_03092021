<template>
  <section class="container mt-5" aria-labelledby="main-title">
    <h1 id="main-title">Mon compte</h1>
    <h2 class="h4 mt-4">Mes informations</h2>
    <ul>
      <li>Nom d'utilisateur <span>{{ currentUser.username }}</span></li>
      <li>Adresse mail <span>{{ currentUser.email }}</span></li>
    </ul>
  </section>

  <section class="container mt-5">
    <h2 class="h4">Que souhaitez-vous faire ?</h2>
    <Button type="button" @button-click="handleLogout" text="Me déconnecter"/>
  </section>
</template>

<script>
import Button from '../components/Button'

export default {
  name: 'Profile',

  components: {
    Button
  },

  computed: {
    currentUser () {
      return this.$store.state.auth.user || {}
    }
  },

  methods: {
    async handleLogout () {
      try {
        await this.$store.dispatch('auth/logout')
        await this.$router.push('/')
      } catch (e) {
        console.error({ code: e.status, message: e.data.message })
      }
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
