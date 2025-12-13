<template>
  <div id="app">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>{{ $t('nav.systemTitle') }}</h1>
          <div class="header-right">
            <el-dropdown @command="handleLanguageChange">
              <span class="el-dropdown-link">
                <i class="el-icon-s-tools"></i>
                {{ $t('nav.language') }}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
                <el-dropdown-item command="en-US">English</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <el-menu
            :default-active="activeMenu"
            class="el-menu-vertical"
            router
            background-color="#304156"
            text-color="#bfcbd9"
            active-text-color="#409EFF">
            <el-menu-item index="/">
              <i class="el-icon-data-line"></i>
              <span slot="title">{{ $t('nav.dashboard') }}</span>
            </el-menu-item>
            <el-submenu index="parking">
              <template slot="title">
                <i class="el-icon-office-building"></i>
                <span>{{ $t('nav.parkingManagement') }}</span>
              </template>
              <el-menu-item index="/parking-records">{{ $t('nav.parkingRecords') }}</el-menu-item>
            </el-submenu>
            <el-submenu index="square">
              <template slot="title">
                <i class="el-icon-bank-card"></i>
                <span>{{ $t('nav.squareManagement') }}</span>
              </template>
              <el-menu-item index="/square-locations">{{ $t('nav.locationList') }}</el-menu-item>
              <el-menu-item index="/square-devices">{{ $t('nav.deviceManagement') }}</el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    activeMenu() {
      return this.$route.path
    }
  },
  methods: {
    handleLanguageChange(language) {
      this.$i18n.locale = language
      this.$store.dispatch('setLanguage', language)
      this.$message.success(this.$t('common.confirm'))
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
}

.el-container {
  height: 100%;
}

.el-header {
  background-color: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 24px;
  font-weight: normal;
}

.header-right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
}

.el-icon-s-tools {
  margin-right: 5px;
}

.el-main {
  padding: 20px;
  background-color: #f0f2f5;
  overflow-y: auto;
}

.el-aside {
  background-color: #304156;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu {
  border-right: none;
}

.el-submenu .el-menu-item {
  min-width: 180px;
  padding-left: 50px !important;
}
</style>
