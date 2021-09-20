<template>
  <section class="mt-3 py-4" aria-labelledby="comments-title">
    <h2 id="comments-title">Ajouter un commentaire</h2>

    <Form class="add-comments mt-4 row" @submit="onSubmit" :validation-schema="schema">
      <div class="form-group col-12">
        <label for="content" class="form-label">Contenu</label>
        <Field
          v-model="content"
          name="content"
          type="text"
          class="form-control form-control-lg"
          id="content"
          as="textarea"
          rows="3"
        />
        <p v-if="contentErrors" class="invalid-feedback">{{ contentErrors }}</p>
        <p :class="{'text-danger': contentLength > 160}">{{ contentLength }} / 160</p>
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
  </section>

</template>

<script>
import * as yup from 'yup'
import { Form, Field, useField, useForm } from 'vee-validate'
import { computed } from 'vue'

export default {
  name: 'AddComment',

  components: {
    Form,
    Field
  },

  setup () {
    const schema = {
      content: yup.string()
        .required('Le contenu du commentaire ne doit pas être vide')
        .min(5, 'Doit contenir au moins 5 charactères')
        .max(160, 'Ne doit pas dépasser 160 caractères')
    }

    const { resetForm } = useForm()
    const { value: content, errorMessage: contentErrors } = useField('content', schema.content)

    const contentLength = computed(() => {
      return (content.value) ? content.value.length : 0
    })

    return {
      schema,
      resetForm,
      content,
      contentErrors,
      contentLength
    }
  },

  data () {
    return {
      errors: false
    }
  },

  methods: {
    onSubmit (formData) {
      this.$emit('add-comment', formData)
      this.resetForm()
    }
  }
}
</script>
