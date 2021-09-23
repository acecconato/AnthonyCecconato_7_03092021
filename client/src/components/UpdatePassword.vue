<template>

  <Button
    type="button"
    classes="btn-primary"
    data-bs-toggle="modal"
    data-bs-target="#changePasswordModal"
    text="Changer mon mot de passe"
  />

  <!-- Change Password Modal -->
  <div class="modal fade" id=changePasswordModal tabindex="-1" aria-labelledby="changePasswordModalLabel"
       aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">

        <div class="modal-header">
          <h3 class="h5 modal-title" id="changePasswordModalLabel">Changer mon mot de passe</h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
        </div>

        <div class="modal-body">

          <Form class="px-4 row" @submit="onSubmit" :validation-schema="schema">

            <div v-if="!success">
              <div class="form-group mb-3">
                <label for="old_password" class="form-label">Ancien mot de passe</label>
                <Field name="old_password" type="password" class="form-control form-control-lg" id="old_password"/>
                <ErrorMessage name="old_password" class="invalid-feedback" as="p"/>
              </div>

              <div class="form-group mb-3">
                <label for="password" class="form-label">Nouveau mot de passe</label>
                <Field name="password" type="password" class="form-control form-control-lg" id="password"/>
                <ErrorMessage name="password" class="invalid-feedback" as="p"/>
              </div>

              <div class="form-group mb-3">
                <label for="repeat" class="form-label">Répétez le nouveau mot de passe</label>
                <Field name="repeat" type="password" class="form-control form-control-lg" id="repeat"/>
                <ErrorMessage name="repeat" class="invalid-feedback" as="p"/>
              </div>
            </div>

            <p v-if="success" class="alert alert-success">
              Mot de passe modifié avec succès, vous pouvez fermer cette page
            </p>

            <div v-if="message && !success">
              <p class="alert alert-danger" v-for="(msg, i) in message" :key="i">{{ msg.message || msg }}</p>
            </div>

            <button v-if="!success" type="submit" class="btn btn-primary">Confirmer</button>

          </Form>
        </div>

        <div class="modal-footer">

          <button type="button" class="btn btn-dark" data-bs-dismiss="modal">Fermer</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import Button from '@/components/Button'
import { Field, Form, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import usersApi from '@/api/users'

export default {
  name: 'UpdatePassword',

  components: {
    Button,
    Field,
    Form,
    ErrorMessage
  },

  data () {
    const schema = yup.object().shape({
      old_password: yup.string().required('Le mot de passe ne doit pas être vide'),
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

  created () {
    this.currentUser = this.$store.state.auth.user
  },

  mounted () {
    const passwordChangeModal = document.getElementById('changePasswordModal')
    passwordChangeModal.addEventListener('hidden.bs.modal', () => {
      if (!this.success) {
        this.message = ''
        document.getElementById('old_password').value = ''
        document.getElementById('password').value = ''
        document.getElementById('repeat').value = ''
      }
    })
  },

  methods: {
    async onSubmit (formData) {
      try {
        await usersApi.updatePassword(this.currentUser.userId, formData.old_password, formData.password)
        this.success = true
      } catch (e) {
        console.error(e)
        this.message = e.data || 'Erreur inconnue'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.btn[type="submit"] {
  width: fit-content;
  margin-left: 12px;
}
</style>
