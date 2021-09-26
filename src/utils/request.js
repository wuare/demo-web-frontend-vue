import axios from 'axios'
import store from '@/store'
import storage from 'store'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/store/mutation-types'
import router from '../router/index'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000 // 请求超时时间
})

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data
    // 从 localstorage 获取 token
    const token = storage.get(ACCESS_TOKEN)
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401) {
      // 调用refreshToken接口
      // 如果refreshToken接口返回错误，登出，重定向到登录页面
      const refreshTokenText = storage.get(REFRESH_TOKEN)

      return refreshToken({ refreshToken: refreshTokenText }).then((res) => {
        if (res.code !== 200) {
          notification.error({
            message: 'Unauthorized',
            description: 'Authorization verification failed'
          })
          if (token) {
            store.dispatch('Logout').then(() => {
              setTimeout(() => {
                router.replace({
                  path: '/user/login?',
                  query: { }
                })
              }, 1500)
            })
          }
        } else {
          store.dispatch('RefreshToken', res.result)
          error.config.__isRetryRequest = true
          error.config.headers.Authorization = 'Bearer ' + res.result.token
          return request(error.config)
        }
      })
    }
  }
  return Promise.reject(error)
}

// request interceptor
request.interceptors.request.use(config => {
  const token = storage.get(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  return response.data
}, errorHandler)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export {
  installer as VueAxios,
  request as axios
}

export const refreshToken = params => {
  return axios.post(`${process.env.VUE_APP_API_BASE_URL}/auth/token/refresh`, params).then(res => res.data)
}
