<template>
  <Button
    type="button"
    :classes="{'btn-primary': !displayForm, 'btn-outline-danger': displayForm}"
    :text="buttonText"
    @button-click="onClick"
  />

  <p v-if="success" class="alert alert-success mt-4">Publication ajoutée</p>

  <Form v-if="displayForm" class="add-post-form mt-4 row" @submit="onSubmit" :validation-schema="schema">

    <div class="form-group col-12 mb-4 mt-2">
      <label for="media" class="form-label">Media URL (gif, jpg ou png) - Optionnel</label>
      <Field v-model="media" name="media" type="text" class="form-control form-control-lg" id="media"/>
      <p v-if="mediaErrors" class="invalid-feedback">{{ mediaErrors }}</p>
    </div>

    <div class="form-group col-12">
      <label for="content" class="form-label">Contenu du message</label>
      <Field
        v-model="content"
        name="content"
        type="text"
        class="form-control form-control-lg"
        id="content"
        as="textarea"
        rows="5"
      />
      <p v-if="contentErrors" class="invalid-feedback">{{ contentErrors }}</p>
      <p :class="{'text-danger': contentLength > 400}">{{ contentLength }} / 400</p>
    </div>

    <div v-if=errors class="col-12 form-group mt-3">
      <p v-for="(error, i) in errors" :key="i" class="alert alert-danger" role="alert">
        {{ error.message }}
      </p>
    </div>

    <div class="col-12 form-actions">
      <button type="submit" class="btn btn-lg btn-outline-primary mb-3">Envoyer !</button>
    </div>
  </Form>
</template>

<script>
import { computed } from 'vue'
import { Field, Form, useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import Button from '@/components/Button'
import postsApi from '@/api/posts'

export default {

  name: 'AddPost',

  components: {
    Button,
    Form,
    Field
  },

  setup () {
    const schema = {
      content: yup.string()
        .required('Le contenu de la publication ne doit pas être vide')
        .min(20, 'Doit contenir au moins 20 charactères')
        .max(400, 'Ne doit pas dépasser 400 caractères'),

      media: yup.string()
        .url('Vous devez insérer une URL (https://...)')
        .matches(/(.(gif|jpg|jpeg|png)|^)$/i, 'L\'url n\'est pas un gif ou une image valide')
    }

    const { resetForm } = useForm()
    const { value: content, errorMessage: contentErrors } = useField('content', schema.content)
    const { value: media, errorMessage: mediaErrors } = useField('media', schema.media)

    const contentLength = computed(() => {
      return (content.value) ? content.value.length : 0
    })

    return {
      schema,
      resetForm,
      media,
      mediaErrors,
      content,
      contentErrors,
      contentLength
    }
  },

  data () {
    return {
      displayForm: false,
      tooLong: false,
      success: false,
      errors: []
    }
  },

  methods: {
    async onSubmit (formData) {
      try {
        const post = await postsApi.addPost(formData)
        this.displayForm = false
        this.successTimeout()
        this.$emit('post-add', post)
        this.resetForm()
      } catch (e) {
        this.errors = e.data
        console.error(e.data)
      }
    },

    async onClick () {
      this.displayForm = !this.displayForm
      this.resetForm()
    },

    successTimeout () {
      this.success = true
      setTimeout(() => {
        this.success = false
      }, 3000)
    }
  },

  emits: ['post-add'],

  computed: {
    buttonText () {
      return (!this.displayForm) ? 'Ajouter une publication' : 'Annuler'
    }
  }
}
</script>
