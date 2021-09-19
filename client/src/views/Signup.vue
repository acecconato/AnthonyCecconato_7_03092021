<template>
  <section class="container shadow-5 shadow-5-strong py-5 px-4">
    <h1>Créer mon compte</h1>

    <p v-if="!success" class="alert alert-info">Pour créer votre compte Groupomania, merci de remplir les champs suivants.</p>

    <Form v-if="!success" class="signup-form row" @submit="onSubmit" :validation-schema="schema">
      <div class="form-group mb-3">
        <label for="username" class="form-label">Nom d'utilisateur</label>
        <Field name="username" type="text" class="form-control form-control-lg" id="username"/>
        <ErrorMessage name="username" class="invalid-feedback" as="p"/>
      </div>

      <div class="form-group mb-3">
        <label for="email" class="form-label">Adresse mail</label>
        <Field name="email" type="text" class="form-control form-control-lg" id="email"/>
        <ErrorMessage name="email" class="invalid-feedback" as="p"/>
      </div>

      <div class="form-group mb-3">
        <label for="password" class="form-label">Mot de passe</label>
        <Field name="password" type="password" class="form-control form-control-lg" id="password"/>
        <ErrorMessage name="password" class="invalid-feedback" as="p"/>
      </div>

      <div class="form-group mb-3">
        <label for="repeat" class="form-label">Répétez le mot de passe</label>
        <Field name="repeat" type="password" class="form-control form-control-lg" id="repeat"/>
        <ErrorMessage name="repeat" class="invalid-feedback" as="p"/>
      </div>

      <div class="col-auto form-actions mt-4">
        <router-link to="/login" class="btn btn-lg btn-dark mb-3">
          <BIconArrowLeftCircle/>
          Retour
        </router-link>
        <button type="submit" class="btn  btn-lg btn-outline-primary mb-3">Créer mon compte</button>
      </div>
    </Form>

    <div v-if="message && !success">
        <p class="alert alert-danger" v-for="(msg, i) in message" :key="i">{{ msg.message || msg }}</p>
    </div>

    <p v-if="success" class="alert alert-success">
      Compte crée avec succès. <br>Vous pouvez désormais <router-link to="/login">vous connecter</router-link>
    </p>

  </section>
</template>

<script>
import auth from '../api/auth'
import { Field, Form, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'

export default {

  name: 'Signup',

  components: {
    Field,
    Form,
    ErrorMessage
  },

  data () {
    const schema = yup.object().shape({
      username: yup.string()
        .required('Le nom d\'utilisateur ne doit pas être vide')
        .matches(/^[a-z0-9]+$/i, 'Ne peut contenir que des caractères alphanumériques')
        .min(3, 'Doit contenir au moins 3 charactères')
        .max(30, 'Ne doit pas dépasser 30 caractères'),
      email: yup.string()
        .required('L\'adresse mail ne doit pas être vide')
        .email('L\'adresse mail n\'est pas valide')
        .min(5, 'Doit contenir au moins 5 charactères')
        .max(60, 'Ne doit pas dépasser 60 caractères'),
      password: yup.string().required('Le mot de passe ne doit pas être vide'),
      repeat: yup.string()
        .required('Ce champ ne peut pas être vide')
        .oneOf([yup.ref('password'), null], 'Les mots de passe doivent être identiques')
    })

    return {
      schema,
      success: false,
      message: ''
    }
  },

  methods: {
    async onSubmit (formData) {
      try {
        await auth.signup(formData)
        this.success = true
      } catch (e) {
        switch (e.status) {
          case 422:
            console.error(e.data)
            this.message = e.data
            break
          default:
            this.message = 'Une erreur inconnue est survenue'
            console.error(e.data)
        }
      }
    }
  },

  computed: {
    loggedIn () {
      return this.$store.state.auth.status.loggedIn
    }
  },

  mounted () {
    if (this.loggedIn) {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  margin-top: 50px;

  h1 {
    margin-bottom: 20px;
  }
}
</style>
