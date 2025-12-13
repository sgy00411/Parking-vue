<template>
  <div class="vehicle-records">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <i class="el-icon-s-data stat-icon" style="color: #409EFF;"></i>
            <div class="stat-content">
              <div class="stat-label">{{ $t('vehicleRecords.statistics.total') }}</div>
              <div class="stat-value">{{ statistics.total }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <i class="el-icon-upload stat-icon" style="color: #67C23A;"></i>
            <div class="stat-content">
              <div class="stat-label">{{ $t('vehicleRecords.statistics.entered') }}</div>
              <div class="stat-value">{{ statistics.entered }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <i class="el-icon-download stat-icon" style="color: #E6A23C;"></i>
            <div class="stat-content">
              <div class="stat-label">{{ $t('vehicleRecords.statistics.exited') }}</div>
              <div class="stat-value">{{ statistics.exited }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <i class="el-icon-warning stat-icon" style="color: #F56C6C;"></i>
            <div class="stat-content">
              <div class="stat-label">{{ $t('vehicleRecords.statistics.exitOnly') }}</div>
              <div class="stat-value">{{ statistics.exitOnly }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选表单 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" label-width="120px" class="filter-form">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item :label="$t('vehicleRecords.status')">
              <el-select v-model="queryParams.status" :placeholder="$t('common.search')" clearable>
                <el-option :label="$t('vehicleRecords.statusOptions.all')" value=""></el-option>
                <el-option :label="$t('vehicleRecords.statusOptions.entered')" value="entered"></el-option>
                <el-option :label="$t('vehicleRecords.statusOptions.exited')" value="exited"></el-option>
                <el-option :label="$t('vehicleRecords.statusOptions.exitOnly')" value="exit_only"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item :label="$t('vehicleRecords.plateNumber')">
              <el-input v-model="queryParams.plateNumber" :placeholder="$t('common.search')" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item :label="$t('vehicleRecords.parkingLotCode')">
              <el-input v-model="queryParams.parkingLotCode" :placeholder="$t('common.search')" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item :label="$t('vehicleRecords.startDate')">
              <el-date-picker
                v-model="queryParams.startDate"
                type="date"
                :placeholder="$t('common.search')"
                value-format="yyyy-MM-dd"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item :label="$t('vehicleRecords.endDate')">
              <el-date-picker
                v-model="queryParams.endDate"
                type="date"
                :placeholder="$t('common.search')"
                value-format="yyyy-MM-dd"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="handleSearch">{{ $t('common.search') }}</el-button>
              <el-button icon="el-icon-refresh" @click="handleReset">{{ $t('common.reset') }}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column :label="$t('vehicleRecords.parkingLotCode')" prop="parkingLotCode" width="120"></el-table-column>
        <el-table-column :label="$t('vehicleRecords.status')" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 'entered'" type="success">{{ $t('vehicleRecords.statusOptions.entered') }}</el-tag>
            <el-tag v-else-if="scope.row.status === 'exited'" type="warning">{{ $t('vehicleRecords.statusOptions.exited') }}</el-tag>
            <el-tag v-else-if="scope.row.status === 'exit_only'" type="danger">{{ $t('vehicleRecords.statusOptions.exitOnly') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('vehicleRecords.plateNumber')" width="140">
          <template slot-scope="scope">
            {{ scope.row.entryPlateNumber || scope.row.exitPlateNumber || '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('vehicleRecords.entryTime')" width="180">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.entryTime) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('vehicleRecords.exitTime')" width="180">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.exitTime) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('vehicleRecords.duration')" width="150">
          <template slot-scope="scope">
            {{ formatDuration(scope.row.durationSeconds) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('vehicleRecords.entryCamera')" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.entryCameraName || '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('vehicleRecords.exitCamera')" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.exitCameraName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="停车费" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.parkingFeeCents">
              ${{ (scope.row.parkingFeeCents / 100).toFixed(2) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.paymentStatus === 'paid'" type="success">已支付</el-tag>
            <el-tag v-else-if="scope.row.paymentStatus === 'pending'" type="warning">待支付</el-tag>
            <el-tag v-else-if="scope.row.parkingFeeCents > 0" type="info">未支付</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.detail')" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" icon="el-icon-view" @click="handleViewDetail(scope.row.id)">
              {{ $t('common.detail') }}
            </el-button>
            <el-button
              v-if="scope.row.onlinePaymentUrl && scope.row.paymentStatus !== 'paid'"
              type="text"
              size="small"
              icon="el-icon-bank-card"
              @click="handleOnlinePayment(scope.row)"
              style="color: #67C23A;"
            >
              在线支付
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
import { getVehicleRecords, getStatistics } from '@/api/vehicleRecords'

export default {
  name: 'VehicleRecords',
  data() {
    return {
      loading: false,
      tableData: [],
      total: 0,
      queryParams: {
        page: 1,
        pageSize: 20,
        status: '',
        plateNumber: '',
        parkingLotCode: '',
        startDate: '',
        endDate: ''
      },
      statistics: {
        total: 0,
        entered: 0,
        exited: 0,
        exitOnly: 0
      }
    }
  },
  created() {
    this.loadData()
    this.loadStatistics()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const response = await getVehicleRecords(this.queryParams)
        if (response.success) {
          this.tableData = response.records
          this.total = response.total
        } else {
          this.$message.error(response.message || this.$t('common.loading'))
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error(this.$t('common.loading'))
      } finally {
        this.loading = false
      }
    },
    async loadStatistics() {
      try {
        const response = await getStatistics({ parkingLotCode: this.queryParams.parkingLotCode })
        if (response.success) {
          this.statistics = response.statistics
        }
      } catch (error) {
        console.error('加载统计信息失败:', error)
      }
    },
    handleSearch() {
      this.queryParams.page = 1
      this.loadData()
      this.loadStatistics()
    },
    handleReset() {
      this.queryParams = {
        page: 1,
        pageSize: 20,
        status: '',
        plateNumber: '',
        parkingLotCode: '',
        startDate: '',
        endDate: ''
      }
      this.loadData()
      this.loadStatistics()
    },
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.loadData()
    },
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.loadData()
    },
    handleViewDetail(id) {
      this.$router.push(`/vehicle-records/${id}`)
    },
    handleOnlinePayment(row) {
      // 在新窗口打开Square支付页面
      if (row.onlinePaymentUrl) {
        window.open(row.onlinePaymentUrl, '_blank')
        this.$message.success('已打开支付页面，请在新窗口中完成支付')
      } else {
        this.$message.error('支付链接不可用')
      }
    },
    formatDateTime(datetime) {
      if (!datetime) return '-'
      return datetime.replace('T', ' ')
    },
    formatDuration(seconds) {
      if (!seconds) return '-'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`
      } else {
        return `${secs}s`
      }
    }
  }
}
</script>

<style scoped>
.vehicle-records {
  padding: 0;
}

.statistics {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  font-size: 36px;
  margin-right: 15px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
