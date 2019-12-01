<template>
  <div class="md-layout md-alignment-center-center" style="height: 100vh">
    <md-card class="md-layout-item md-size-50">
      <md-card-header>
        <div class="md-title">Login</div>
      </md-card-header>
      <form @submit.prevent="validateForm">
        <md-card-content>
          <md-field md-clearable :class="getValidationClass('email')">
            <label for="email">Email</label>
            <md-input
              :disabled="loading"
              type="email"
              name="email"
              id="email"
              autocomplete="email"
              v-model="form.email"
            ></md-input>
            <span class="md-error" v-if="!$v.form.email.required"></span>
            <span class="md-error" v-if="!$v.form.email.email">Invalid email</span>
          </md-field>
          <md-field :class="getValidationClass('password')">
            <label for="password">Password</label>
            <md-input
              :disabled="loading"
              type="password"
              name="password"
              id="password"
              autocomplete="password"
              v-model="form.password"
            ></md-input>
            <span class="md-error" v-if="!$v.form.password.required">Password is required</span>
            <span class="md-error" v-if="!$v.form.password.minLength">Password is too short</span>
            <span class="md-error" v-if="!$v.form.password.maxLength">Password is too long</span>
          </md-field>
        </md-card-content>
        <md-card-actions>
          <md-button @click="$router.push('/register')">Go to Register</md-button>
          <md-button class="md-primary md-raised" type="submit" :disabled="loading">Submit</md-button>
        </md-card-actions>
      </form>
      <md-snackbar :md-active.sync="isAuthenticated">Login successfully</md-snackbar>
    </md-card>
    <!-- Back button -->
    <md-button class="md-fab md-fab-bottom-right md-fixed md-primary" @click="$router.go(-1)">
      <md-icon>arrow_back</md-icon>
    </md-button>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'
export default {
  middleware: 'auth',
  data: () => ({
    form: {
      email: '',
      password: ''
    }
  }),
  validations: {
    form: {
      email: {
        required,
        email
      },
      password: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(20)
      }
    }
  },
  computed: {
    ...mapState(['loading']),
    ...mapGetters(['isAuthenticated'])
  },
  watch: {
    isAuthenticated (val) {
      if (val) {
        setTimeout(() => this.$router.push('/'), 2000)
      }
    }
  },
  methods: {
    validateForm () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.loginUser()
      }
    },
    async loginUser () {
      await this.$store.dispatch('authenticateUser', {
        action: 'login',
        email: this.form.email,
        password: this.form.password,
        returnSecureToken: true
      })
    },
    getValidationClass (fieldName) {
      const field = this.$v.form[fieldName]
      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty
        }
      }
    }
  }
}
</script>

<style></style>
