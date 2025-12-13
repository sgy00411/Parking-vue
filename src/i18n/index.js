import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'
import ElementLocale from 'element-ui/lib/locale'

Vue.use(VueI18n)

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const i18n = new VueI18n({
  locale: localStorage.getItem('language') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
})

ElementLocale.i18n((key, value) => i18n.t(key, value))

export default i18n
