<template>
  <Navbar :isHome="isHome"/>
  <main>
    <router-view></router-view>
  </main>
</template>

<script>
import { addBackToTop } from 'vanilla-back-to-top'
import Navbar from './components/Navbar'

addBackToTop()

export default {
  name: 'App',

  components: {
    Navbar
  },

  data () {
    return {
      isHome: false
    }
  },

  watch: {
    $route (to, from) {
      this.isHome = (to.path === '/')
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Karla:wght@200;300;400;700&family=Rubik:wght@400;700&display=swap');

$primaryColor: #012041;

* {
  font-family: Karla, sans-serif;
}

*:focus-visible {
  outline: #DD535B solid 4px!important;
  outline-offset: 4px;
}

body {
  background: $primaryColor;
}

main {
  & > .container {
    border: 3px solid #DD535B;
  }
}

.container {
  background: white;
}

h1, h2, h3, h4, h5 {
  font-family: Rubik, sans-serif;
}

h1, .h1, h2, .h2 {
  color: #FF361C;
}

p.h1 {
  font-family: Rubik, sans-serif;
}

#app {
  padding-bottom: 50px;
}

.btn {
  &-filter {
    background-color: #333;
    border: 1px solid transparent;
    border-radius: 3px;
    box-shadow: rgba(255, 255, 255, .4) 0 1px 0 0 inset;
    box-sizing: border-box;
    color: #fff;
    cursor: pointer;
    display: inline-block;
    font-family: -apple-system,system-ui,"Segoe UI","Liberation Sans",sans-serif;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.15385;
    margin: 0;
    outline: none;
    padding: 8px .8em;
    position: relative;
    text-align: center;
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    vertical-align: baseline;
    white-space: nowrap;

    &:hover,
    &:focus {
      background-color: #07c;
      color: whitesmoke;
    }

    &:focus {
      box-shadow: 0 0 0 4px rgba(0, 149, 255, .15);
    }

    &.active {
      background-color: #07c;
      box-shadow: none;
    }
  }
}

.container {

  @media all and (min-width: 992px) {
    max-width: 800px;
  }

  .form-actions {
    button, a {
      margin-right: 15px;
    }
  }
}

p.invalid-feedback {
  display: block;
  position: relative;
  top: 15px;
}

#back-to-top {
  background: #012041;
  border: 3px solid white;
}
</style>
