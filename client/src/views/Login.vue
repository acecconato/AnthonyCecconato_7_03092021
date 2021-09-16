<template>
  <section class="container">
    <h1>Connexion</h1>
    <Form class="login-form row" @submit="onSubmit" :validation-schema="schema">

      <div class="col-12 mb-3">
        <label for="username" class="form-label">Nom d'utilisateur</label>
        <Field name="username" type="text" class="form-control" id="username"/>
        <ErrorMessage name="username" class="invalid-feedback" as="p"/>
      </div>

      <div class="col-12 mb-3">
        <label for="password" class="form-label">Mot de passe</label>
        <Field name="password" type="password" class="form-control" id="password"/>
        <ErrorMessage name="password" class="invalid-feedback" as="p"/>
      </div>

      <div class="col-12 form-check form-switch">
        <Field name="remember" value="true" class="form-check-input" type="checkbox" id="remember" />
        <label class="form-check-label" for="remember">Garder ma session active</label>
      </div>

      <a href="#"
         class="col-12 btn btn-link mt-4"
         id="forget-password"
         @click="alert('Non disponible actuellement')"
      >
        Mot de passe oublié ?
      </a>

      <div class="col-12 form-group">
        <p v-if="message" class="alert alert-danger" role="alert">
          {{ message }}
        </p>
      </div>

      <div class="col-12 form-actions mt-4">
        <button type="submit" class="btn btn-primary mb-3">Connexion</button>
        <router-link to="/signup" class="btn btn-primary mb-3">Créer mon compte</router-link>
      </div>
    </Form>
  </section>
</template>

<script>
import { Field, Form, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'

export default {
  name: 'Login',

  components: {
    Field,
    Form,
    ErrorMessage
  },

  data () {
    const schema = yup.object().shape({
      username: yup.string().required('Le nom d\'utilisateur ne doit pas être vide'),
      password: yup.string().required('Le mot de passe ne doit pas être vide')
    })

    return {
      message: '',
      schema
    }
  },

  methods: {
    alert (text) {
      alert(text)
    },

    async onSubmit (user) {
      try {
        await this.$store.dispatch('auth/login', user)
        await this.$router.push('/')
      } catch (e) {
        if (e.status === 401) {
          this.message = 'Identifiants incorrects'
        }
      }
    }
  },

  computed: {
    loggedIn () {
      return this.$store.state.auth.status.loggedIn
    }
  },

  created () {
    // if (this.loggedIn) {
    //   this.$router.push('/')
    // }
  }
}
</script>

<style scoped lang="scss">
.container {
  margin-top: 50px;
  border: 1px solid #333;
  padding: 20px 10px;

  h1 {
    margin-bottom: 20px;
  }
}

#forget-password {
  text-align: left;
  width: fit-content;
}

.form-switch {
  padding-left: 52px;
}
</style>
