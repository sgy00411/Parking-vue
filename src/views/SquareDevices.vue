<template>
  <div class="square-devices">
    <h2>{{ $t('squareDevices.title') }}</h2>

    <!-- 操作栏 -->
    <el-card class="operation-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select
            v-model="selectedLocationId"
            :placeholder="$t('squareDevices.selectLocation')"
            clearable
            @change="loadDevices">
            <el-option
              v-for="location in locations"
              :key="location.id"
              :label="location.name"
              :value="location.id">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="selectedStatus"
            :placeholder="$t('squareDevices.filterByStatus')"
            clearable
            @change="handleStatusFilter">
            <el-option
              :label="$t('squareDevices.all')"
              value="">
            </el-option>
            <el-option
              :label="$t('squareDevices.available')"
              value="AVAILABLE">
            </el-option>
            <el-option
              :label="$t('squareDevices.offline')"
              value="OFFLINE">
            </el-option>
            <el-option
              :label="$t('squareDevices.busy')"
              value="BUSY">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" icon="el-icon-plus" @click="openCreateDialog">
            {{ $t('squareDevices.createDevice') }}
          </el-button>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" icon="el-icon-refresh" @click="loadDevices">
            {{ $t('common.refresh') }}
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 设备列表 -->
    <el-card class="table-card">
      <el-table
        :data="filteredDevices"
        v-loading="loading"
        style="width: 100%">

        <el-table-column
          prop="id"
          :label="$t('squareDevices.deviceId')"
          width="280">
        </el-table-column>

        <el-table-column
          prop="name"
          :label="$t('squareDevices.deviceName')"
          width="200">
        </el-table-column>

        <el-table-column
          prop="locationId"
          :label="$t('squareDevices.locationId')"
          width="280">
          <template slot-scope="scope">
            {{ getLocationName(scope.row.locationId) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="status"
          :label="$t('common.status')"
          width="120">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="productType"
          :label="$t('squareDevices.productType')"
          width="150">
        </el-table-column>

        <el-table-column
          prop="createdAt"
          :label="$t('common.createdAt')"
          width="180">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column
          fixed="right"
          :label="$t('common.actions')"
          width="100">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="viewDetails(scope.row)">
              {{ $t('common.detail') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建设备配对码对话框 -->
    <el-dialog
      :title="$t('squareDevices.createDevice')"
      :visible.sync="createDialogVisible"
      width="50%">
      <el-form :model="deviceForm" :rules="formRules" ref="deviceForm" label-width="120px">
        <el-form-item :label="$t('squareDevices.selectLocation')" prop="locationId">
          <el-select
            v-model="deviceForm.locationId"
            :placeholder="$t('squareDevices.selectLocation')"
            style="width: 100%">
            <el-option
              v-for="location in locations"
              :key="location.id"
              :label="location.name"
              :value="location.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('squareDevices.deviceName')" prop="deviceName">
          <el-input
            v-model="deviceForm.deviceName"
            :placeholder="$t('squareDevices.deviceNamePlaceholder')">
          </el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitCreateDevice" :loading="submitting">
          {{ $t('common.confirm') }}
        </el-button>
      </span>
    </el-dialog>

    <!-- 配对码显示对话框 -->
    <el-dialog
      :title="$t('squareDevices.pairingCode')"
      :visible.sync="codeDialogVisible"
      width="50%">
      <div v-if="pairingDevice" class="pairing-info">
        <el-alert
          :title="$t('squareDevices.pairingSuccess')"
          type="success"
          :closable="false"
          style="margin-bottom: 20px;">
        </el-alert>

        <el-descriptions :column="1" border>
          <el-descriptions-item :label="$t('squareDevices.deviceName')">
            {{ pairingDevice.name }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareDevices.pairingCode')">
            <div class="pairing-code">
              {{ pairingDevice.code }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareDevices.locationId')">
            {{ getLocationName(pairingDevice.locationId) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareDevices.pairStatus')">
            <el-tag :type="pairingDevice.pairStatus === 'PAIRED' ? 'success' : 'warning'">
              {{ pairingDevice.pairStatus }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          :title="$t('squareDevices.pairingInstructions')"
          type="info"
          :closable="false"
          style="margin-top: 20px;">
        </el-alert>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="codeDialogVisible = false">{{ $t('common.close') }}</el-button>
      </span>
    </el-dialog>

    <!-- 设备详情对话框 -->
    <el-dialog
      :title="$t('common.detail')"
      :visible.sync="detailDialogVisible"
      width="60%">
      <div v-if="selectedDevice" class="device-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('squareDevices.deviceId')">
            {{ selectedDevice.id }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareDevices.deviceName')">
            {{ selectedDevice.name }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareDevices.locationId')">
            {{ getLocationName(selectedDevice.locationId) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('common.status')">
            <el-tag :type="getStatusType(selectedDevice.status)">
              {{ getStatusText(selectedDevice.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareDevices.productType')">
            {{ selectedDevice.productType }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('common.createdAt')">
            {{ formatDateTime(selectedDevice.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">{{ $t('common.close') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'SquareDevices',
  data() {
    return {
      locations: [],
      devices: [],
      selectedLocationId: '',
      selectedStatus: '',
      loading: false,
      createDialogVisible: false,
      codeDialogVisible: false,
      detailDialogVisible: false,
      submitting: false,
      deviceForm: {
        locationId: '',
        deviceName: ''
      },
      formRules: {
        locationId: [
          { required: true, message: this.$t('squareDevices.locationRequired'), trigger: 'change' }
        ],
        deviceName: [
          { required: true, message: this.$t('squareDevices.deviceNameRequired'), trigger: 'blur' }
        ]
      },
      pairingDevice: null,
      selectedDevice: null
    }
  },
  computed: {
    filteredDevices() {
      if (!this.selectedStatus) {
        return this.devices
      }
      return this.devices.filter(device => device.status === this.selectedStatus)
    }
  },
  created() {
    this.loadLocations()
    this.loadDevices()
  },
  methods: {
    async loadLocations() {
      try {
        const response = await axios.get('/api/square/locations', {
          params: { page: 1, size: 100 }
        })
        if (response.data) {
          this.locations = response.data.content || response.data
        }
      } catch (error) {
        console.error('Failed to load locations:', error)
        this.$message.error(this.$t('common.loadFailed'))
      }
    },

    async loadDevices() {
      this.loading = true
      try {
        const params = {}
        if (this.selectedLocationId) {
          params.locationId = this.selectedLocationId
        }

        const response = await axios.get('/api/square/devices', { params })

        if (response.data) {
          this.devices = response.data.devices || []
        }
      } catch (error) {
        console.error('Failed to load devices:', error)
        this.$message.error(this.$t('common.loadFailed'))
      } finally {
        this.loading = false
      }
    },

    handleStatusFilter() {
      // 状态筛选通过 computed 属性自动完成
      // 这个方法用于清空状态筛选时的处理
    },

    openCreateDialog() {
      this.deviceForm = {
        locationId: this.selectedLocationId || '',
        deviceName: ''
      }
      this.createDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.deviceForm) {
          this.$refs.deviceForm.clearValidate()
        }
      })
    },

    submitCreateDevice() {
      this.$refs.deviceForm.validate(async (valid) => {
        if (valid) {
          this.submitting = true
          try {
            const response = await axios.post('/api/square/devices/codes', {
              locationId: this.deviceForm.locationId,
              deviceName: this.deviceForm.deviceName
            })

            if (response.data && response.data.success) {
              this.$message.success(this.$t('common.success'))
              this.createDialogVisible = false
              this.pairingDevice = response.data.device
              this.codeDialogVisible = true
              this.loadDevices()
            }
          } catch (error) {
            console.error('Failed to create device code:', error)
            this.$message.error(error.response?.data?.message || this.$t('common.failed'))
          } finally {
            this.submitting = false
          }
        }
      })
    },

    viewDetails(device) {
      this.selectedDevice = device
      this.detailDialogVisible = true
    },

    getLocationName(locationId) {
      const location = this.locations.find(loc => loc.id === locationId)
      return location ? location.name : locationId
    },

    getStatusType(status) {
      // 根据不同状态返回不同的Element UI tag类型
      const statusMap = {
        'AVAILABLE': 'success',      // 绿色 - 可用
        'OFFLINE': 'info',            // 灰色 - 离线
        'BUSY': 'warning',            // 橙色 - 忙碌
        'UNKNOWN': 'danger',          // 红色 - 未知
        'DECOMMISSIONED': 'info'      // 灰色 - 已停用
      }
      return statusMap[status] || 'info'
    },

    getStatusText(status) {
      // 返回状态的显示文本
      if (!status) return this.$t('squareDevices.offline')

      const statusTextMap = {
        'AVAILABLE': this.$t('squareDevices.available') || '可用',
        'OFFLINE': this.$t('squareDevices.offline') || '离线',
        'BUSY': this.$t('squareDevices.busy') || '忙碌',
        'UNKNOWN': this.$t('squareDevices.unknown') || '未知',
        'DECOMMISSIONED': this.$t('squareDevices.decommissioned') || '已停用'
      }
      return statusTextMap[status] || status
    },

    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      return date.toLocaleString(this.$i18n.locale === 'zh-CN' ? 'zh-CN' : 'en-US')
    }
  }
}
</script>

<style scoped>
.square-devices {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

.operation-card {
  margin-bottom: 20px;
}

.table-card {
  margin-top: 20px;
}

.device-detail {
  padding: 10px;
}

.pairing-info {
  padding: 10px;
}

.pairing-code {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  letter-spacing: 8px;
}
</style>
