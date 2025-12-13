<template>
  <div class="dashboard">
    <h2>{{ $t('dashboard.title') }}</h2>

    <!-- 停车场统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon parking">
            <i class="el-icon-parking"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.totalSpaces }}</div>
            <div class="stat-label">{{ $t('dashboard.totalSpaces') }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon occupied">
            <i class="el-icon-warning"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.occupiedSpaces }}</div>
            <div class="stat-label">{{ $t('dashboard.occupiedSpaces') }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon available">
            <i class="el-icon-success"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.availableSpaces }}</div>
            <div class="stat-label">{{ $t('dashboard.availableSpaces') }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon parked">
            <i class="el-icon-truck"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.currentParked }}</div>
            <div class="stat-label">{{ $t('dashboard.currentParked') }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 今日统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-icon revenue">
            <i class="el-icon-coin"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ statistics.todayRevenue }}</div>
            <div class="stat-label">{{ $t('dashboard.todayRevenue') }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-icon entries">
            <i class="el-icon-bottom"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.todayEntries }}</div>
            <div class="stat-label">{{ $t('dashboard.todayEntries') }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-icon exits">
            <i class="el-icon-top"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.todayExits }}</div>
            <div class="stat-label">{{ $t('dashboard.todayExits') }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近记录 -->
    <el-card class="recent-records">
      <div slot="header">
        <span>{{ $t('dashboard.recentRecords') || '最近停车记录' }}</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="goToParkingRecords">
          {{ $t('common.viewAll') || '查看全部' }}
        </el-button>
      </div>
      <el-table :data="recentRecords" style="width: 100%">
        <el-table-column prop="plateNumber" :label="$t('vehicleRecords.plateNumber')" width="120"></el-table-column>
        <el-table-column prop="status" :label="$t('vehicleRecords.status')" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'ENTRY' ? 'success' : 'warning'">
              {{ $t(`vehicleRecords.${scope.row.status.toLowerCase()}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="parkingLotCode" :label="$t('vehicleRecords.parkingLotCode')" width="120"></el-table-column>
        <el-table-column prop="entryTime" :label="$t('vehicleRecords.entryTime')" width="180">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.entryTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="exitTime" :label="$t('vehicleRecords.exitTime')" width="180">
          <template slot-scope="scope">
            {{ scope.row.exitTime ? formatDateTime(scope.row.exitTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="parkingFee" :label="$t('vehicleRecords.parkingFee')" width="100">
          <template slot-scope="scope">
            {{ scope.row.parkingFee ? '¥' + scope.row.parkingFee : '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DashboardView',
  data() {
    return {
      statistics: {
        totalSpaces: 500,
        occupiedSpaces: 0,
        availableSpaces: 500,
        currentParked: 0,
        todayRevenue: 0,
        todayEntries: 0,
        todayExits: 0
      },
      recentRecords: [],
      loading: false
    }
  },
  created() {
    this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      this.loading = true
      try {
        // 加载最近的停车记录
        const response = await axios.get('/api/vehicle-records', {
          params: {
            page: 1,
            size: 10
          }
        })

        if (response.data && response.data.content) {
          this.recentRecords = response.data.content

          // 计算统计数据
          this.calculateStatistics(response.data.content)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        this.$message.error(this.$t('common.loadFailed'))
      } finally {
        this.loading = false
      }
    },

    calculateStatistics(records) {
      // 计算当前停车数（状态为ENTRY的记录）
      this.statistics.currentParked = records.filter(r => r.status === 'ENTRY').length
      this.statistics.occupiedSpaces = this.statistics.currentParked
      this.statistics.availableSpaces = this.statistics.totalSpaces - this.statistics.occupiedSpaces

      // 计算今日入场和出场
      const today = new Date().toDateString()
      this.statistics.todayEntries = records.filter(r => {
        return r.entryTime && new Date(r.entryTime).toDateString() === today
      }).length

      this.statistics.todayExits = records.filter(r => {
        return r.exitTime && new Date(r.exitTime).toDateString() === today && r.status === 'EXIT'
      }).length

      // 计算今日收入
      this.statistics.todayRevenue = records
        .filter(r => r.exitTime && new Date(r.exitTime).toDateString() === today && r.parkingFee)
        .reduce((sum, r) => sum + parseFloat(r.parkingFee || 0), 0)
        .toFixed(2)
    },

    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      return date.toLocaleString(this.$i18n.locale === 'zh-CN' ? 'zh-CN' : 'en-US')
    },

    goToParkingRecords() {
      this.$router.push('/parking-records')
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 10px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  margin-right: 15px;
}

.stat-icon.parking {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.occupied {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.available {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.parked {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-icon.entries {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

.stat-icon.exits {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.recent-records {
  margin-top: 20px;
}
</style>
